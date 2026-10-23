/**
 * Chat state for an AI assistant UI.
 *
 * Talks to a streaming endpoint (default: POST /api/chat/stream/) that accepts
 *   { messages: [{ role: 'user' | 'assistant', content: string }, ...] }
 * and responds with the reply as a plain-text stream. See src/routes/api/chat/+server.js.
 */

import { _ApiFetcher } from "../../routes/chat/+page";

export class AIChatStore {
	/** @type {{ id: string, role: 'user' | 'assistant', content: string }[]} */
	messages = $state([]);
	streaming = $state(false);
	/** @type {string | null} */
	error = $state(null);

	#endpoint;
	/** @type {AbortController | null} */
	#controller = null;

	/** @param {{ endpoint?: string }} [options] */
	constructor({ endpoint = 'http://127.0.0.1:8000/api/chat/stream/' } = {}) {
		this.#endpoint = endpoint;

		// this.loadDBMessages()
	}

	async loadDBMessages(){
		const res = await _ApiFetcher('http://127.0.0.1:8000/api/chat/messages/', {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem('access')}`
			},
		})

		if(!res.ok){
			let data = await res.json().catch(()=> {})
			throw new Error("Failed to load messages")
		}
		
		let data = await res.json()
		this.messages = data //.map((/** @type {{ role: any; content: any; }} */ msg) => ({
		// 	role: msg.role,
		// 	content: msg.content
		// }))
		console.log(this.messages)
	}

	/** @param {string} text */
	async send(text) {
		const content = text.trim();
		if (!content || this.streaming) return;
		this.error = null;
		this.messages.push({ id: crypto.randomUUID(), role: 'user', content });
		await this.#generate();
	}

	/** Drop the last answer (if any) and ask again. Also used to retry after an error. */
	async regenerate() {
		if (this.streaming) return;
		while (this.messages.at(-1)?.role === 'assistant') this.messages.pop();
		if (!this.messages.length) return;
		this.error = null;
		await this.#generate();
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

	async #generate() {
		const history = this.messages.map(({ role, content }) => ({ role, content }));

		this.messages.push({ id: crypto.randomUUID(), role: 'assistant', content: '' });
		// Read it back from the array so we hold the reactive proxy, not the raw object.
		const reply = this.messages[this.messages.length - 1];

		this.streaming = true;
		this.#controller = new AbortController();

		try {
			const res = await _ApiFetcher(this.#endpoint, {
				method: 'POST',
				headers: { 
					'content-type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem('access')}`
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
}
