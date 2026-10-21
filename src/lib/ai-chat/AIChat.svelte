<script>
	import { tick } from 'svelte';
	import { AIChatStore } from './ai-chat.svelte.js';
	import ChatMessage from './ChatMessage.svelte';
	import Composer from './Composer.svelte';

	let {
		store = new AIChatStore(),
		title = 'S.A.M.E',
		greeting = 'How can I help you today?',
		suggestions = [
			'Explain how async/await works',
			'Help me write a polite follow-up email',
			'Give me a 3-day workout plan',
			'Summarize the pros and cons of Svelte'
		]
	} = $props();

	/**
     * @type {HTMLDivElement}
     */
	let scroller;
	let stick = true;
	let showJump = $state(false);

	function onscroll() {
		const gap = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
		stick = gap < 80;
		showJump = gap > 240;
	}

	function toBottom(behavior = 'smooth') {
		scroller?.scrollTo({ top: scroller.scrollHeight, behavior });
	}


	// Follow the conversation, including while text streams in, unless the reader scrolled up.
	$effect(() => {
		const last = store.messages.at(-1);
		void last?.content;
		void store.messages.length;
		if (last?.role === 'user') stick = true;
		if (!stick) return;
		tick().then(() => toBottom(store.streaming ? 'auto' : 'smooth'));
	});

	const lastIndex = $derived(store.messages.length - 1);
</script>

<div class="ai-chat">
	<header>
		<h1>{title}</h1>
		{#if store.messages.length}
			<button type="button" class="new" onclick={() => store.clear()}>New chat</button>
		{/if}
	</header>

	<div class="scroller" bind:this={scroller} {onscroll}>
		<div class="column">
			{#if store.messages.length === 0}
				<div class="empty">
					<h2>{greeting}</h2>
					<ul class="chips">
						{#each suggestions as suggestion (suggestion)}
							<li><button type="button" onclick={() => store.send(suggestion)}>{suggestion}</button></li>
						{/each}
					</ul>
				</div>
			{:else}
				<div class="thread" role="log" aria-label="Conversation">
					{#each store.messages as message, i (message.id)}
						<ChatMessage
							{message}
							generating={store.streaming && i === lastIndex && message.role === 'assistant'}
							canRegenerate={i === lastIndex && message.role === 'assistant'}
							onregenerate={() => store.regenerate()}
						/>
					{/each}

					{#if store.error}
						<div class="error" role="alert">
							<span>{store.error}</span>
							<button type="button" onclick={() => store.regenerate()}>Try again</button>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<footer>
		<div class="column">
			{#if showJump}
				<button type="button" class="jump" onclick={() => toBottom()} aria-label="Scroll to latest message">
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path d="M12 5v14m6.5-6.5L12 19l-6.5-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			{/if}
			<Composer onsend={(/** @type {any} */ text) => store.send(text)} onstop={() => store.stop()} streaming={store.streaming} />
			<p class="note">AI can make mistakes. Check important information.</p>
		</div>
	</footer>
</div>

<style>
	.ai-chat {
		/* Theme tokens. Override from a parent to match your brand. */
		--c-bg: #faf9f6;
		--c-surface: #ffffff;
		--c-surface-2: #efede8;
		--c-border: #e4e1da;
		--c-text: #1d1c1a;
		--c-muted: #6f6b63;
		--c-accent: #c2410c;
		--c-on-accent: #ffffff;
		--c-user: #efede8;
		--c-code-bg: #f3f1ec;
		--c-danger: #b42318;

		display: flex;
		flex-direction: column;
		height: var(--chat-height, 100dvh);
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
		.ai-chat {
			--c-bg: #1b1a18;
			--c-surface: #262522;
			--c-surface-2: #322f2b;
			--c-border: #3a3733;
			--c-text: #efede8;
			--c-muted: #a09b92;
			--c-accent: #f08a5d;
			--c-on-accent: #2a1305;
			--c-user: #2f2c28;
			--c-code-bg: #121110;
			--c-danger: #f97066;
		}
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 20px;
	}
	h1 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}
	.new {
		padding: 6px 14px;
		border: 1px solid var(--c-border);
		border-radius: 999px;
		background: var(--c-surface);
		color: var(--c-text);
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.new:hover {
		background: var(--c-surface-2);
	}
	.scroller {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 8px 16px 24px;
	}
	.column {
		position: relative;
		width: 100%;
		max-width: 760px;
		margin-inline: auto;
	}
	.thread {
		display: flex;
		flex-direction: column;
		gap: 28px;
		padding-top: 12px;
	}
	.empty {
		display: grid;
		justify-items: center;
		gap: 24px;
		padding-top: 18vh;
		text-align: center;
	}
	.empty h2 {
		margin: 0;
		font-size: clamp(1.6rem, 4vw, 2.2rem);
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chips button {
		padding: 9px 16px;
		border: 1px solid var(--c-border);
		border-radius: 999px;
		background: var(--c-surface);
		color: var(--c-text);
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
	}
	.chips button:hover {
		background: var(--c-surface-2);
	}
	.chips button:focus-visible {
		outline: 2px solid var(--c-accent);
	}
	.error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 14px;
		border: 1px solid var(--c-danger);
		border-radius: 12px;
		color: var(--c-danger);
		font-size: 0.9rem;
	}
	.error button {
		padding: 4px 12px;
		border: 1px solid currentColor;
		border-radius: 999px;
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	footer {
		padding: 0 16px calc(10px + env(safe-area-inset-bottom));
	}
	.jump {
		position: absolute;
		left: 50%;
		top: -48px;
		translate: -50% 0;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--c-border);
		border-radius: 50%;
		background: var(--c-surface);
		color: var(--c-text);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);
		cursor: pointer;
	}
	.note {
		margin: 8px 0 0;
		text-align: center;
		font-size: 0.75rem;
		color: var(--c-muted);
	}
</style>
