/**
 * Chat state for an AI assistant UI.
 *
 * Talks to a streaming endpoint (default: POST /api/chat/streams/) that accepts
 *   { messages: [{ role: 'user' | 'assistant', content: string }, ...] }
 * and responds with the reply as a plain-text stream. See src/routes/api/chat/+server.js.
 */

import { apiFetcher } from "#lib/api.js";
// import { _ApiFetcher } from "../../routes/chat/+page";

export class AIChatStore {
	/** @type {{ id: string, role: 'user' | 'assistant', content: string }[]} */
	messages = $state([]);
	streaming = $state(false);
	uploading = $state(false)
	/** @type {string | null} */
	error = $state(null);

	/** @type {[]} */
	chats = $state([])
	activeChatId = $state(null)

	/** @type {((chatId: string) => void) | null} called once, right after a brand-new chat has been created */
	onChatCreated = null

	#endpoint;
	/** @type {AbortController | null} */
	#controller = null;

	/** @param {{ endpoint?: string }} [options] */
	constructor({ endpoint = 'http://127.0.0.1:8000/api/chat/stream/' } = {}) {
		this.#endpoint = endpoint;

		// this.loadDBMessages()
	}

	// old DB message loader
	async loadDBMessages(){
		try{
			const response  = await apiFetcher('/api/chat/messages/', {
				method: 'GET'
			})

			if(!response.ok){
				throw new Error(`Failed to load messages: ${response.status}`)
			}

			const data = await response.json()

			if(!Array.isArray(data)){
				throw new Error(`Expected an array of messages from the API`)
			}

			this.messages = data
			console.log("Success Message")
		}
		catch(err){
			console.error("Message loading error:", err)
			this.error = err?.message || "Couldn't load messages"
		}

		// const res = await fetch('http://127.0.0.1:8000/api/chat/messages/', {
		// 	method: 'GET',
		// 	credentials: 'include',
		// 	headers: {
		// 		'content-type': 'application/json',
		// 		// 'Authorization': `Bearer ${sessionStorage.getItem('access')}`
		// 	},
		// })

		// if(!res.ok){
		// 	let data = await res.json().catch(()=> {})
		// 	console.log(document.cookie)
		// 	throw new Error("Failed to load messages")
		// }
		
		// let data = await res.json()
		// this.messages = data //.map((/** @type {{ role: any; content: any; }} */ msg) => ({
		// // 	role: msg.role,
		// // 	content: msg.content
		// // }))
		console.log("LOADDBMET", this.messages)
	}

	/** @param {string} text */
	async __send(text) {
		console.log("1. Got here")
		const content = text.trim();
		if (!content || this.streaming) return;
		this.error = null;
		this.messages.push({ id: crypto.randomUUID(), role: 'user', content });
		console.log("2. ", content)
		await this.#generate();
	}

	/** Drop the last answer (if any) and ask again. Also used to retry after an error. */
	async _regenerate() {
		if (this.streaming) return;
		// while (this.messages.at(-1)?.role === 'assistant') this.messages.pop();
		// if (!this.messages.length) return;
		// this.error = null;
		// await this.#generate();

		console.log("/////////////////////////////", this.messages.at(-2))
		while(this.messages.at(-1)?.role === 'assistant') this.messages.pop()
		console.log(this.messages.at(-1)?.content)
		let user_last_message = this.messages.at(-1)?.content

		if(!user_last_message) return
		this.error = null
		await this.gen(user_last_message, [])

	}

	/** Stop the current response. Whatever has streamed so far is kept. */
	stop() {
		this.#controller?.abort();
	}

	clear() {
		this.stop();
		this.messages = [];
		this.error = null;
	}

	// old unused generate 
	async #generate() {
		const history = this.messages.map(({ role, content }) => ({ role, content }));

		this.messages.push({ id: crypto.randomUUID(), role: 'assistant', content: '' });
		// Read it back from the array so we hold the reactive proxy, not the raw object.
		const reply = this.messages[this.messages.length - 1];

		this.streaming = true;
		this.#controller = new AbortController();

		try {
			console.log(this.#endpoint)
			// const res = await apiFetcher(this.#endpoint, {
			const res = await fetch("http://127.0.0.1:8000/api/chat/stream/", {
				method: 'POST',
				credentials: 'include',
				headers: { 
					'content-type': 'application/json',
					// 'Authorization': `Bearer ${sessionStorage.getItem('access')}`
				},
				body: JSON.stringify({ messages: history }),
				signal: this.#controller.signal
			});

			if (!res.ok || !res.body) {
				throw new Error(
					res.status === 401 ? 'Please sign in to continue.' : `Request failed (${res.status}).`
				);
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				reply.content += decoder.decode(value, { stream: true });
			}
		} catch (err) {
			if (err?.name !== 'AbortError') {
				this.error = err?.message || 'Something went wrong. Please try again.';
			}
		} finally {
			this.streaming = false;
			this.#controller = null;
			// Nothing came back (error or instant stop): remove the empty placeholder.
			if (!reply.content) this.messages = this.messages.filter((m) => m.id !== reply.id);
		}
	}

	// new DB message loader
	async _loadDBMessages(chat_id = this.activeChatId){
		if(!chat_id){
			this.messages = []
			return
		}

		try{
			const response  = await apiFetcher(`/api/chat/messages/${chat_id}/`, {
				method: 'GET'
			})

			if(!response.ok){
				throw new Error(`Failed to load messages: ${response.status}`)
			}

			const data = await response.json()

			if(!Array.isArray(data)){
				throw new Error(`Expected an array of messages from the API`)
			}

			this.messages = data
			this.activeChatId = chat_id
			console.log("Success Message")
		}
		catch(err){
			console.error("Message loading error:", err)
			this.error = err?.message || "Couldn't load messages"
		}

	}

	// Loads all chats in the sidebar
	async loadChats(){
		try{
			const res = await apiFetcher("/api/chat/chats/", {method: "GET"})
			if (!res.ok){
				throw new Error("Could not load conversations");
			}
			this.chats = await res.json()
		}
		catch(err){
			console.error("Load Chats:", err)
			this.error = err.message
		}
	}

	// opens a chat 
	async openChat(chatId){
		this.stop()
		this.activeChatId = chatId
		this.messages = []
		this.error = null

		await this._loadDBMessages(chatId)
	}

	// Sends a message. If there is no active chat yet, gen() creates one first.
	async send(content = "", attachments = []){
		await this.gen(content, attachments)
	}

	// Creates the chat on the backend (POST /api/chat/new-chat/) and returns its id.
	async #createChat(firstMessage = ""){
		const res = await apiFetcher("/api/chat/new-chat/", {
			method: "POST",
			body: JSON.stringify({ content: firstMessage }),
			signal: this.#controller?.signal
		})

		if(!res.ok){
			throw new Error(res.status === 401 ? 'Please sign in to continue.' : "Could not start a new chat.")
		}

		const { chat_id } = await res.json()
		return String(chat_id)
	}

	// new message generator 
	async gen(text="", files = []){
		const content = text.trim()
		if(this.streaming || !content && !files.length) return

		this.streaming = true
		this.error = null
		this.#controller = new AbortController()

		// Show the user's message and an empty assistant bubble (the "thinking" dots) straight away.
		// Before, they were only added once the server had replied, which can take a while, so the
		// screen looked frozen.
		this.messages.push({ id: crypto.randomUUID(), role: "user", content })
		this.messages.push({ id: crypto.randomUUID(), role: "assistant", content: "" })
		// Read it back from the array so we hold the reactive proxy, not the raw object. Writing to the
		// raw object is invisible to Svelte, which is why the streamed text never showed up.
		const reply = this.messages[this.messages.length - 1]

		try{
			// First message of a new chat: create it, show it in the sidebar, and let the page move to /chat/<id>
			if(!this.activeChatId){
				this.activeChatId = await this.#createChat(content)
				this.loadChats()
				console.log(this.activeChatId)
				this.onChatCreated?.(this.activeChatId)
			}

			const formData = new FormData()
			formData.append("content", content)
			formData.append("chat_id", this.activeChatId)
			for(const file of files){
				formData.append("attachments", file)
			}

			const response = await fetch("http://127.0.0.1:8000/api/chat/streams/", {
				method: "POST",
				credentials: "include",
				body: formData,
				signal: this.#controller.signal
			})

			if (!response.ok || !response.body) {
				throw new Error(
					response.status === 401 ? 'Please sign in to continue.' : `Request failed (${response.status}).`
				);
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()

			while(true){
				const {done, value} = await reader.read()
				if(done) break
				reply.content += decoder.decode(value, {stream: true})
			}

			reply.content += decoder.decode()

			if(!reply.content){
				this.error = "No response was received. Please try again."
			}
		}
		catch(err){
			if(err?.name !== 'AbortError'){
				console.error(err)
				this.error = err?.message || 'Something went wrong. Please try again.'
			}
		}
		finally{
			this.streaming = false
			this.#controller = null
			// nothing came back (error, or stopped straight away): drop the empty bubble
			if(!reply.content) this.messages = this.messages.filter((m) => m.id !== reply.id)
			// refresh the sidebar (new chat, updated order)
			this.loadChats()
		}
	}

	async regenerate(){
		if(this.streaming) return

		while(this.messages.at(-1)?.role === 'assistant') this.messages.pop()
		let user_last_msg = this.messages.at(-1)?.content

		if(!user_last_msg) return

		this.streaming = true
		this.error = null
		this.#controller = new AbortController()

		this.messages.push({ id: crypto.randomUUID(), role: "assistant", content: "" })
		const reply = this.messages[this.messages.length - 1]

		try{
			const response = await fetch("http://127.0.0.1:8000/api/chat/re-streams/", {
				method: "POST",
				headers: {'Content-type': 'application/json'},
				credentials: "include",
				body: JSON.stringify({"req_regen": this.activeChatId}),
				signal: this.#controller.signal
			})

			if(!response.ok || !response.body){
				throw new Error(response.status == 401? "Please sign in to continue" : `The request failed (${response.status})`)
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()

			while(true){
				const {done, value} = await reader.read()
				if(done) break
				reply.content += decoder.decode(value, {stream: true})
			}

			reply.content += decoder.decode()
			if(!reply.content){
				this.error = "No response received, try again please"
			}
		}
		catch(err){
			if(err?.name !== 'AbortError'){
				console.error(err)
				this.error = err?.message || 'Something went wrong. Please try again.'
			}
		}
		finally{
			this.streaming = false
			this.#controller = null
			this.loadChats()
		}
	}

}

export const chatStore = new AIChatStore({endpoint: 'http://127.0.0.1:8000/api/chat/stream/'})