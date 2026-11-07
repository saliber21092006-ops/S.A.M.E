<script>
	import { onMount, untrack } from 'svelte';
	import { page } from '$app/state';
	import { chatStore } from './ai-chat.svelte.js';
	import UserMenu from './UserMenu.svelte';
	import { normalizeChats, filterChats, groupChats } from './chat-list.js';

	/**
	 * store:      the AIChatStore whose `chats` we list (uses store.chats / loadChats())
	 * user:       { username, email?, avatar? } for the account button
	 * title:      brand text at the top
	 * onnewchat:  "New chat" clicked
	 * onnavigate: a chat link was clicked (the shell uses it to close the mobile drawer)
	 * oncollapse: the collapse / close button was clicked
	 * plan, languages, onlanguage, onmenu: passed through to the account menu
	 */
	let {
		store = chatStore,
		user = null,
		title = 'S.A.M.E',
		plan = '',
		languages = undefined,
		onnewchat,
		onnavigate,
		oncollapse,
		onlanguage,
		onmenu
	} = $props();

	let query = $state('');
	let loading = $state(true);
	/** @type {HTMLInputElement} */
	let search;

	const chats = $derived(normalizeChats(store.chats));
	const searching = $derived(query.trim().length > 0);
	const visible = $derived(filterChats(chats, query));
	const groups = $derived(
		searching
			? [{ label: `${visible.length} result${visible.length === 1 ? '' : 's'}`, items: visible }]
			: groupChats(chats)
	);
	// The store knows the open chat once it has loaded; the URL knows it immediately.
	const activeId = $derived(String(store.activeChatId ?? page.params.id ?? ''));

	onMount(async () => {
		await store.loadChats();
		loading = false;
	});

	// A reply just finished streaming: the backend may have created the chat or retitled it.
	let wasStreaming = false;
	$effect(() => {
		const streaming = store.streaming;
		if (wasStreaming && !streaming) untrack(() => store.loadChats());
		wasStreaming = streaming;
	});

	export function focusSearch() {
		search?.focus();
		search?.select();
	}
</script>

<div class="sidebar">
	<div class="top">
		<span class="brand">{title}</span>
		<button type="button" class="icon" onclick={oncollapse} aria-label="Close sidebar" aria-controls="chat-sidebar">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" />
			</svg>
		</button>
	</div>

	<button type="button" class="new" onclick={onnewchat}>
		<span class="plus">
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
				<path d="M12 5v14M5 12h14" />
			</svg>
		</span>
		New chat
	</button>

	<div class="search">
		<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
			<circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" />
		</svg>
		<input
			bind:this={search}
			bind:value={query}
			type="search"
			placeholder="Search chats"
			aria-label="Search chats"
			autocomplete="off"
			onkeydown={(e) => e.key === 'Escape' && query && ((query = ''), e.stopPropagation())}
		/>
	</div>

	<nav class="list" aria-label="Chats">
		{#if loading && !chats.length}
			<div class="skeleton" aria-busy="true" aria-label="Loading chats">
				{#each Array(7) as _, i (i)}<span style:width="{55 + ((i * 17) % 40)}%"></span>{/each}
			</div>
		{:else if !chats.length}
			<p class="note">No chats yet. Start a new one!</p>
		{:else if searching && !visible.length}
			<p class="note">No chats match “{query.trim()}”.</p>
		{:else}
			{#each groups as group (group.label)}
				<section>
					<h2 class="group">{group.label}</h2>
					<ul>
						{#each group.items as chat (chat.id)}
							<li>
								<a
									class="chat"
									class:active={chat.id === activeId}
									href="/chat/{encodeURIComponent(chat.id)}"
									aria-current={chat.id === activeId ? 'page' : undefined}
									title={chat.title}
									onclick={onnavigate}>{chat.title}</a
								>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		{/if}
	</nav>

	<div class="foot">
		<UserMenu {user} {plan} {languages} {onlanguage} onselect={onmenu} />
	</div>
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 6px;
		height: 100%;
		box-sizing: border-box;
		padding: 10px 8px 8px;
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2px 4px 2px 10px;
	}
	.brand {
		font-weight: 650;
		letter-spacing: 0.01em;
	}
	.icon {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
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
	.icon:focus-visible,
	.new:focus-visible {
		outline: 2px solid var(--c-accent);
		outline-offset: -2px;
	}
	.new {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 10px;
		border: 0;
		border-radius: 12px;
		background: none;
		color: var(--c-text);
		font: inherit;
		font-weight: 500;
		cursor: pointer;
	}
	.new:hover {
		background: var(--c-hover);
	}
	.plus {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--c-accent);
		color: var(--c-on-accent);
	}
	.search {
		position: relative;
		margin: 2px 4px 6px;
	}
	.search svg {
		position: absolute;
		left: 11px;
		top: 50%;
		translate: 0 -50%;
		color: var(--c-muted);
		pointer-events: none;
	}
	.search input {
		width: 100%;
		box-sizing: border-box;
		padding: 8px 12px 8px 34px;
		border: 1px solid transparent;
		border-radius: 10px;
		background: var(--c-surface-2);
		color: var(--c-text);
		font: inherit;
		font-size: 0.9rem;
	}
	.search input::placeholder {
		color: var(--c-muted);
	}
	.search input:focus-visible {
		outline: none;
		border-color: var(--c-accent);
	}
	.list {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 4px;
	}
	.group {
		margin: 14px 10px 6px;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--c-muted);
	}
	ul {
		display: grid;
		gap: 1px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chat {
		display: block;
		padding: 8px 10px;
		border-radius: 10px;
		color: var(--c-text);
		font-size: 0.92rem;
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.chat:hover {
		background: var(--c-hover);
	}
	.chat.active {
		background: var(--c-active);
		font-weight: 500;
	}
	.chat:focus-visible {
		outline: 2px solid var(--c-accent);
		outline-offset: -2px;
	}
	.note {
		margin: 28px 14px;
		text-align: center;
		font-size: 0.88rem;
		color: var(--c-muted);
	}
	.skeleton {
		display: grid;
		gap: 12px;
		padding: 18px 10px;
	}
	.skeleton span {
		height: 12px;
		border-radius: 6px;
		background: var(--c-surface-2);
		animation: pulse 1.4s ease-in-out infinite;
	}
	.foot {
		padding-top: 8px;
		border-top: 1px solid var(--c-border);
	}
	@keyframes pulse {
		50% {
			opacity: 0.45;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton span {
			animation: none;
		}
	}
</style>
