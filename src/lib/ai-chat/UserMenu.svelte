<script>
	import { onMount, tick } from 'svelte';
	import { initialsOf } from './chat-list.js';

	/**
	 * user:      { username, email?, avatar? }
	 * plan:      optional label under the name, e.g. "Free plan"
	 * languages: [{ code, label }]
	 * onselect:  (id) => void, id is 'settings' | 'upgrade' | 'help' | 'logout'
	 * onlanguage:(code) => void, called when a language is picked (also saved in localStorage)
	 */
	let {
		user = null,
		plan = '',
		languages = [
			{ code: 'en', label: 'English' },
			{ code: 'es', label: 'Español' },
			{ code: 'fr', label: 'Français' },
			{ code: 'pt', label: 'Português' },
			{ code: 'de', label: 'Deutsch' },
			{ code: 'ar', label: 'العربية' }
		],
		onselect,
		onlanguage
	} = $props();

	let open = $state(false);
	let view = $state('main'); // 'main' | 'language'
	let lang = $state('en');

	/** @type {HTMLDivElement} */
	let root;
	/** @type {HTMLButtonElement} */
	let trigger;
	/** @type {HTMLDivElement | undefined} */
	let menuEl = $state();

	const name = $derived(user?.username ?? user?.name ?? 'Account');
	const currentLabel = $derived(languages.find((l) => l.code === lang)?.label ?? 'English');

	onMount(() => {
		try {
			lang = localStorage.getItem('chat:lang') || 'en';
		} catch {
			/* storage unavailable */
		}
	});

	function items() {
		return menuEl ? [...menuEl.querySelectorAll('[role^="menuitem"]')] : [];
	}

	function focusItem(i) {
		const list = items();
		if (!list.length) return;
		/** @type {HTMLElement} */ (list[((i % list.length) + list.length) % list.length]).focus();
	}

	async function show() {
		open = true;
		view = 'main';
		await tick();
		focusItem(0);
	}

	function hide(refocus = false) {
		open = false;
		if (refocus) trigger?.focus();
	}

	async function openLanguage() {
		view = 'language';
		await tick();
		// Land on the current language (index 0 is the "back" row).
		focusItem(Math.max(0, languages.findIndex((l) => l.code === lang)) + 1);
	}

	async function backToMain() {
		view = 'main';
		await tick();
		focusItem(1); // the "Language" row
	}

	function choose(id) {
		hide();
		onselect?.(id);
	}

	function pick(code) {
		lang = code;
		try {
			localStorage.setItem('chat:lang', code);
		} catch {
			/* storage unavailable */
		}
		onlanguage?.(code);
		hide(true);
	}

	function onkeydown(e) {
		const list = items();
		const i = list.indexOf(document.activeElement);
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusItem(i + 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusItem(i < 0 ? -1 : i - 1);
				break;
			case 'Home':
				e.preventDefault();
				focusItem(0);
				break;
			case 'End':
				e.preventDefault();
				focusItem(-1);
				break;
			case 'Escape':
				// Handled here so the mobile drawer behind us doesn't also close.
				e.preventDefault();
				e.stopPropagation();
				if (view === 'language') backToMain();
				else hide(true);
				break;
			case 'Tab':
				hide();
				break;
		}
	}
</script>

<svelte:window onpointerdown={(e) => open && !root.contains(/** @type {Node} */ (e.target)) && hide()} />

{#snippet icon(kind)}
	<svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		{#if kind === 'settings'}
			<path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
		{:else if kind === 'language'}
			<circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z" />
		{:else if kind === 'upgrade'}
			<circle cx="12" cy="12" r="9" /><path d="M12 16V8m-3.5 3.5L12 8l3.5 3.5" />
		{:else if kind === 'help'}
			<circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17h.01" />
		{:else if kind === 'logout'}
			<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
		{:else if kind === 'next'}
			<path d="m9 6 6 6-6 6" />
		{:else if kind === 'back'}
			<path d="m15 6-6 6 6 6" />
		{:else if kind === 'check'}
			<path d="m5 12 5 5 9-10" />
		{/if}
	</svg>
{/snippet}

<div class="user" bind:this={root}>
	{#if open}
		<div
			id="user-menu"
			class="menu"
			role="menu"
			tabindex="-1"
			aria-label="Account menu"
			bind:this={menuEl}
			{onkeydown}
		>
			{#if view === 'main'}
				{#if user?.email}
					<div class="email" role="presentation">{user.email}</div>
				{/if}
				<button type="button" role="menuitem" class="item" onclick={() => choose('settings')}>
					{@render icon('settings')}<span>Settings</span>
				</button>
				<button type="button" role="menuitem" class="item" aria-haspopup="menu" onclick={openLanguage}>
					{@render icon('language')}<span>Language</span>
					<span class="hint">{currentLabel}</span>
					{@render icon('next')}
				</button>
				<button type="button" role="menuitem" class="item" onclick={() => choose('upgrade')}>
					{@render icon('upgrade')}<span>Upgrade plan</span>
				</button>
				<button type="button" role="menuitem" class="item" onclick={() => choose('help')}>
					{@render icon('help')}<span>Get help</span>
				</button>
				<div class="sep" role="separator"></div>
				<button type="button" role="menuitem" class="item danger" onclick={() => choose('logout')}>
					{@render icon('logout')}<span>Log out</span>
				</button>
			{:else}
				<button type="button" role="menuitem" class="item back" onclick={backToMain}>
					{@render icon('back')}<span>Language</span>
				</button>
				<div class="sep" role="separator"></div>
				{#each languages as l (l.code)}
					<button
						type="button"
						role="menuitemradio"
						aria-checked={l.code === lang}
						class="item"
						onclick={() => pick(l.code)}
					>
						<span class="lbl">{l.label}</span>
						{#if l.code === lang}<span class="tick">{@render icon('check')}</span>{/if}
					</button>
				{/each}
			{/if}
		</div>
	{/if}

	<button
		type="button"
		class="trigger"
		bind:this={trigger}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls="user-menu"
		onclick={() => (open ? hide() : show())}
	>
		<span class="avatar">
			{#if user?.avatar}<img src={user.avatar} alt="" />{:else}{initialsOf(name)}{/if}
		</span>
		<span class="who">
			<span class="name">{name}</span>
			{#if plan}<span class="plan">{plan}</span>{/if}
		</span>
		<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="chev">
			<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
		</svg>
	</button>
</div>

<style>
	.user {
		position: relative;
	}
	.trigger {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px;
		border: 0;
		border-radius: 12px;
		background: none;
		color: var(--c-text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.trigger:hover,
	.trigger[aria-expanded='true'] {
		background: var(--c-hover);
	}
	.trigger:focus-visible {
		outline: 2px solid var(--c-accent);
		outline-offset: -2px;
	}
	.avatar {
		flex: none;
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		overflow: hidden;
		background: var(--c-accent);
		color: var(--c-on-accent);
		font-size: 0.8rem;
		font-weight: 700;
		user-select: none;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.who {
		flex: 1;
		min-width: 0;
		display: grid;
		line-height: 1.25;
	}
	.name {
		font-size: 0.92rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.plan {
		font-size: 0.75rem;
		color: var(--c-muted);
	}
	.chev {
		flex: none;
		color: var(--c-muted);
	}

	.menu {
		position: absolute;
		left: 4px;
		right: 4px;
		bottom: calc(100% + 8px);
		z-index: 10;
		padding: 6px;
		border: 1px solid var(--c-border);
		border-radius: 14px;
		background: var(--c-surface);
		box-shadow: 0 8px 28px rgb(0 0 0 / 0.16);
		animation: pop 0.12s ease-out;
		transform-origin: bottom center;
	}
	.menu:focus {
		outline: none;
	}
	.email {
		padding: 8px 10px 6px;
		font-size: 0.8rem;
		color: var(--c-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 9px 10px;
		border: 0;
		border-radius: 9px;
		background: none;
		color: var(--c-text);
		font: inherit;
		font-size: 0.9rem;
		text-align: left;
		cursor: pointer;
	}
	.item:hover,
	.item:focus-visible {
		background: var(--c-hover);
		outline: none;
	}
	.item .ico {
		flex: none;
		color: var(--c-muted);
	}
	.item .hint {
		margin-left: auto;
		color: var(--c-muted);
		font-size: 0.8rem;
	}
	.item .lbl {
		flex: 1;
	}
	.item .tick {
		display: grid;
		color: var(--c-accent);
	}
	.item.danger,
	.item.danger .ico {
		color: var(--c-danger);
	}
	.sep {
		height: 1px;
		margin: 6px 4px;
		background: var(--c-border);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.98);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.menu {
			animation: none;
		}
	}
</style>
