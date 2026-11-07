<script>
	import { onMount } from 'svelte'
	import { _ApiFetcher } from './+page';
    import { AIChat, AIChatStore } from '#lib/ai-chat/index.js';
	import ChatShell from '#lib/ai-chat/ChatShell.svelte';
    import { browser } from '$app/env';
    import { goto } from '$app/navigation';
    import { chatStore } from '#lib/ai-chat/ai-chat.svelte.js';

	// const store = new AIChatStore({ endpoint: 'http://127.0.0.1:8000/api/chat/stream/' });

	// CHANGED: the shared store, not a page-local one. The chat created here keeps streaming
	// when the page moves to /chat/<id>, because both pages use the same store.
	const store = chatStore;

	if (browser) {
		// "/chat" is always a blank new chat (also when arriving with the Back button)
		store.clear();
		store.activeChatId = null;
		// once the first message has created the chat, show it at /chat/<id> without a reload
		store.onChatCreated = (id) => goto(`/chat/${id}`, { replaceState: true, keepFocus: true, noScroll: true });
	}

	let { data } = $props()

</script>

<svelte:head>
	<title>S.A.M.E - Assistant</title>
</svelte:head>

<ChatShell {store} user={data.user}>
	<AIChat {store} title="" greeting="Welcome, {data.user.username.toLowerCase()}. How can i help you today?" />
</ChatShell>

<!-- <AIChat {store} title="S.A.M.E" greeting="Hello {username}, how can I help you today?" /> -->
<!-- <AIChat title="S.A.M.E" greeting="Welcome, {data.user.username.toUpperCase()}. How can i help you today?" /> -->

