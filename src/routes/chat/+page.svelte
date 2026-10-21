<script>
	// import { AIChat, AIChatStore } from '$lib/ai-chat';
    import { AIChat, AIChatStore } from '#lib/ai-chat/index.js';

	const store = new AIChatStore({ endpoint: 'http://127.0.0.1:8000/api/chat/stream/' });
</script>

<svelte:head>
	<title>Assistant</title>   
</svelte:head>

<AIChat {store} title="S.A.M.E" />
