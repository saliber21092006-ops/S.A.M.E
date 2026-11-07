<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiFetcher } from '#lib/api.js';
	import { chatStore } from './ai-chat.svelte.js';
	import Sidebar from './Sidebar.svelte';

	// TODO: point this at your real logout endpoint. If your auth cookies are httpOnly the browser
	// cannot clear them from JS, so the backend has to do it.
	const LOGOUT_URL = '/auth/logout/';

	/**
	 * Wraps a chat page with the sidebar.
	 *
	 * store:      the AIChatStore the page uses (defaults to the shared `chatStore`)
	 * user:       { username, email?, avatar? } (from the page's load())
	 * title:      brand text
	 * plan:       optional label under the user's name ("Free plan")
	 * languages / onlanguage: language list for the account menu
	 * onmenu:     (id) => boolean | void   id: 'settings' | 'upgrade' | 'help' | 'logout'
	 *             return true to say you handled it and skip the defaults
	 */
	let {
		store = chatStore,
		user = null,
		title = 'S.A.M.E',
		plan = '',
		languages = undefined,
		onlanguage,
		onmenu,
		children
	} = $props();

	let collapsed = $state(false); // desktop: sidebar folded away
	let drawer = $state(false); // phones: sidebar slid in over the chat
	let mobile = $state(false);
	/** @type {{ focusSearch: () => void } | undefined} */
	let sidebar = $state();

	const hidden = $derived(mobile ? !drawer : collapsed);

	onMount(() => {
		try {
			collapsed = localStorage.getItem('chat:sidebar') === 'collapsed';
		} catch {
			/* storage unavailable */
		}
		const mq = matchMedia('(max-width: 768px)');
		const sync = () => {
			mobile = mq.matches;
			if (!mobile) drawer = false;
		};
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	function setCollapsed(value) {
		collapsed = value;
		try {
			localStorage.setItem('chat:sidebar', value ? 'collapsed' : 'open');
		} catch {
			/* storage unavailable */
		}
	}

	function toggle() {
		if (mobile) drawer = !drawer;
		else setCollapsed(!collapsed);
	}

	function newChat() {
		store.clear();
		store.activeChatId = null;
		drawer = false;
		goto('/chat');
	}

	async function logout() {
		try {
			await apiFetcher(LOGOUT_URL, { method: 'POST' });
		} catch {
			/* ignore: we still sign the user out locally */
		}
		window.location.href = '/auth/login';
		window.location.reload()
	}

	function select(id) {
		drawer = false;
		if (onmenu?.(id) === true) return;
		if (id === 'logout') logout();
		else goto(`/${id}`); // /settings, /upgrade, /help: placeholders until those pages exist
	}

	function onkey(e) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			if (mobile) drawer = true;
			else if (collapsed) setCollapsed(false);
			tick().then(() => sidebar?.focusSearch());
		} else if (e.key === 'Escape' && drawer) {
			drawer = false;
		}
	}
</script>

<svelte:window onkeydown={onkey} />

<div class="shell" class:collapsed class:drawer>
	<aside class="side" id="chat-sidebar" aria-label="Chat history" inert={hidden}>
		<Sidebar
			bind:this={sidebar}
			{store}
			{user}
			{title}
			{plan}
			{languages}
			{onlanguage}
			onnewchat={newChat}
			onnavigate={() => (drawer = false)}
			oncollapse={toggle}
			onmenu={select}
		/>
	</aside>

	{#if collapsed}
		<div class="rail">
			<button type="button" class="icon" onclick={toggle} aria-label="Open sidebar" aria-expanded="false" aria-controls="chat-sidebar">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" />
				</svg>
			</button>
			<button type="button" class="icon" onclick={newChat} aria-label="New chat">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<path d="M12 5v14M5 12h14" />
				</svg>
			</button>
		</div>
	{/if}

	{#if mobile && drawer}
		<button type="button" class="scrim" aria-label="Close sidebar" onclick={() => (drawer = false)}></button>
	{/if}

	<div class="main">
		<header class="mobilebar">
			<button type="button" class="icon" onclick={toggle} aria-label="Open sidebar" aria-expanded={drawer} aria-controls="chat-sidebar">
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
					<path d="M4 7h16M4 12h16M4 17h16" />
				</svg>
			</button>
			<span class="mtitle">{title}</span>
			<button type="button" class="icon" onclick={newChat} aria-label="New chat">
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<path d="M12 5v14M5 12h14" />
				</svg>
			</button>
		</header>

		<div class="content">
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.shell {
		/* Same palette as AIChat, plus sidebar tokens. Override from a parent to re-theme. */
		--c-bg: #faf9f6;
		--c-surface: #ffffff;
		--c-surface-2: #efede8;
		--c-border: #e4e1da;
		--c-text: #1d1c1a;
		--c-muted: #6f6b63;
		--c-accent: #c2410c;
		--c-on-accent: #ffffff;
		--c-danger: #b42318;
		--c-sidebar: #f3f1ec;
		--c-hover: rgb(0 0 0 / 0.05);
		--c-active: rgb(0 0 0 / 0.08);
		--sidebar-w: 280px;
		--bar-h: 52px;

		display: flex;
		height: 100dvh;
		overflow: hidden;
		background: var(--c-bg);
		color: var(--c-text);
		font:
			16px/1.5 system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}
	@media (prefers-color-scheme: dark) {
		.shell {
			--c-bg: #1b1a18;
			--c-surface: #262522;
			--c-surface-2: #322f2b;
			--c-border: #3a3733;
			--c-text: #efede8;
			--c-muted: #a09b92;
			--c-accent: #f08a5d;
			--c-on-accent: #2a1305;
			--c-danger: #f97066;
			--c-sidebar: #151412;
			--c-hover: rgb(255 255 255 / 0.06);
			--c-active: rgb(255 255 255 / 0.1);
		}
	}

	.side {
		flex: none;
		width: var(--sidebar-w);
		background: var(--c-sidebar);
		border-right: 1px solid var(--c-border);
	}
	.shell.collapsed .side {
		display: none;
	}
	.rail {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
		box-sizing: border-box;
		width: 52px;
		padding: 10px 8px;
		background: var(--c-sidebar);
		border-right: 1px solid var(--c-border);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border: 0;
		border-radius: 10px;
		background: none;
		color: var(--c-muted);
		cursor: pointer;
	}
	.icon:hover {
		background: var(--c-hover);
		color: var(--c-text);
	}
	.icon:focus-visible {
		outline: 2px solid var(--c-accent);
	}

	.main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.content {
		position: relative;
		flex: 1;
		min-height: 0;
		/* AIChat sizes itself with this variable */
		--chat-height: 100dvh;
	}
	.mobilebar {
		display: none;
	}
	.scrim {
		display: none;
	}

	@media (max-width: 768px) {
		.rail {
			display: none;
		}
		.side,
		.shell.collapsed .side {
			display: block;
			position: fixed;
			inset: 0 auto 0 0;
			z-index: 40;
			width: min(86vw, 320px);
			transform: translateX(-100%);
			visibility: hidden;
			transition:
				transform 0.22s ease,
				visibility 0.22s;
		}
		.shell.drawer .side {
			transform: none;
			visibility: visible;
			box-shadow: 0 0 40px rgb(0 0 0 / 0.3);
		}
		.scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 30;
			border: 0;
			background: rgb(0 0 0 / 0.4);
		}
		.mobilebar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex: none;
			height: var(--bar-h);
			box-sizing: border-box;
			padding: 0 8px;
			border-bottom: 1px solid var(--c-border);
		}
		.mtitle {
			font-weight: 650;
		}
		.content {
			--chat-height: calc(100dvh - var(--bar-h));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.side {
			transition: none !important;
		}
	}
</style>
