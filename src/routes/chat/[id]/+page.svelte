<script>
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { AIChat, AIChatStore } from '#lib/ai-chat/index.js';
	import ChatShell from '#lib/ai-chat/ChatShell.svelte';
    import { chatStore } from '#lib/ai-chat/ai-chat.svelte.js';

	let { data } = $props();

	// CHANGED: the shared store (same one "/chat" uses), so a chat that was just created on "/chat"
	// arrives here with its messages and its still-running stream intact.
	const store = chatStore;

	// True when the store already holds this chat (we came from "/chat" after its first message),
	// so there is nothing to load and nothing to wipe.
	const isOpen = (id) =>
		String(store.activeChatId ?? '') === String(id) && (store.messages.length > 0 || store.streaming);

	let loading = $state(!isOpen(page.params.id));
	let latest = 0; // newest open() call
	let done = 0; // newest open() call that has finished

	async function open(id) {
		const ticket = ++latest;
		loading = true;
		try {
			await store.openChat(id);
		} catch (err) {
			console.error(err);
		}

		if (ticket === latest) {
			done = ticket;
			loading = false;
		} else if (done === latest) {
			// An older request for a previous chat finished AFTER the newest one and overwrote it.
			// Load the chat that is in the URL again.
			open(page.params.id);
		}
	}

	// Runs on first load and whenever the id in the URL changes (clicking another chat).
	$effect(() => {
		const id = page.params.id;
		if (!id) return; // params can briefly be empty while navigating away
		untrack(() => {
			if (isOpen(id)) loading = false;
			else open(id);
		});
	});
</script>

<svelte:head>
	<title>S.A.M.E - Assistant</title>
</svelte:head>

<ChatShell {store} user={data.user}>
	<AIChat {store} title="S.A.M.E" />

	{#if loading}
		<div class="cover" role="status">Loading chat…</div>
	{:else if store.error && !store.messages.length}
		<div class="cover" role="alert">
			<p>{store.error}</p>
			<button type="button" onclick={() => open(page.params.id)}>Try again</button>
		</div>
	{/if}
</ChatShell>

<style>
	.cover {
		position: absolute;
		inset: 0;
		z-index: 5;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 10px;
		background: var(--c-bg);
		color: var(--c-muted);
	}
	.cover p {
		margin: 0;
	}
	.cover button {
		padding: 6px 16px;
		border: 1px solid var(--c-border);
		border-radius: 999px;
		background: var(--c-surface);
		color: var(--c-text);
		font: inherit;
		cursor: pointer;
	}
</style>
