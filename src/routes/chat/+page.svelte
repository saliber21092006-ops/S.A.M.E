<script>
	import { onMount } from 'svelte'
	import { _ApiFetcher } from './+page';
	// import { AIChat, AIChatStore } from '$lib/ai-chat';
    import { AIChat, AIChatStore } from '#lib/ai-chat/index.js';

	let username = $state("")
	// const store = new AIChatStore({ endpoint: 'http://127.0.0.1:8000/api/chat/stream/' });

	onMount(async ()=>{
		// fetches the user's info onloading the page
		// if(!sessionStorage.getItem('access')){
		// 	window.location.href="/auth/login"
		// 	return
		// }

		const res = await _ApiFetcher("http://127.0.0.1:8000/auth/get_user_info/", {
			method: "GET",
			headers: {
				'Content-type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("access")}`
			}
		})

		if(!res.ok){
			let data = await res.json()
			throw Error(data.error)
		}

		let data = await res.json()
		username = data.username

		// await store.loadDBMessages()
	})

	const store = new AIChatStore({ endpoint: 'http://127.0.0.1:8000/api/chat/stream/' });
</script>

<svelte:head>
	<title>Assistant</title>   
</svelte:head>

<AIChat {store} title="S.A.M.E" greeting="Hello {username}, how can I help you today?" />
