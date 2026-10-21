// import { env } from '$env/dynamic/private';

// const MODEL = 'claude-sonnet-5-5';
// const SYSTEM_PROMPT = 'You are a helpful, concise assistant. Format answers with Markdown when it helps.';

// /** Streams the model's reply back to the browser as plain text. */
// export async function POST({ request, locals }) {
// 	// Protect the endpoint with your existing auth. Adjust to however your app stores the session.
// 	// if (!locals.user) return new Response('Unauthorized', { status: 401 });

// 	if (!env.ANTHROPIC_API_KEY) {
// 		return new Response('Server is missing ANTHROPIC_API_KEY.', { status: 500 });
// 	}
    
// 	let body;
// 	try {
// 		body = await request.json();
// 	} catch {
// 		return new Response('Invalid JSON.', { status: 400 });
// 	}

// 	// Only pass through what the API needs; never trust extra fields from the client.
// 	const messages = (Array.isArray(body?.messages) ? body.messages : [])
// 		.filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content)
// 		.map((m) => ({ role: m.role, content: m.content }));

// 	if (!messages.length || messages.at(-1).role !== 'user') {
// 		return new Response('Last message must be from the user.', { status: 400 });
// 	}

// 	const upstream = await fetch('https://api.anthropic.com/v1/messages', {
// 		method: 'POST',
// 		headers: {
// 			'content-type': 'application/json',
// 			'x-api-key': env.ANTHROPIC_API_KEY,
// 			'anthropic-version': '2023-06-01'
// 		},
// 		body: JSON.stringify({
// 			model: MODEL,
// 			max_tokens: 2048,
// 			stream: true,
// 			system: SYSTEM_PROMPT,
// 			messages
// 		}),
// 		signal: request.signal // user pressed Stop -> cancel the upstream request too
// 	});

// 	if (!upstream.ok || !upstream.body) {
// 		console.error('Upstream error', upstream.status, await upstream.text().catch(() => ''));
// 		return new Response('The AI service returned an error.', { status: 502 });
// 	}

// 	// Convert the provider's server-sent events into a stream of plain text chunks.
// 	const encoder = new TextEncoder();
// 	const decoder = new TextDecoder();
// 	const reader = upstream.body.getReader();

// 	const stream = new ReadableStream({
// 		async start(controller) {
// 			let buffer = '';
// 			try {
// 				while (true) {
// 					const { done, value } = await reader.read();
// 					if (done) break;
// 					buffer += decoder.decode(value, { stream: true });

// 					const lines = buffer.split('\n');
// 					buffer = lines.pop() ?? '';

// 					for (const line of lines) {
// 						if (!line.startsWith('data:')) continue;
// 						const data = line.slice(5).trim();
// 						if (!data) continue;
// 						try {
// 							const event = JSON.parse(data);
// 							if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
// 								controller.enqueue(encoder.encode(event.delta.text));
// 							}
// 						} catch {
// 							/* ignore partial or non-JSON lines */
// 						}
// 					}
// 				}
// 				controller.close();
// 			} catch (err) {
// 				controller.error(err);
// 			}
// 		},
// 		cancel() {
// 			reader.cancel();
// 		}
// 	});

// 	return new Response(stream, {
// 		headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache, no-transform' }
// 	});
// }

import { onMount } from 'svelte';

/**
 * @type {string | null}
 */
let access

onMount(()=>{
    if(sessionStorage.getItem("access")){
        access = sessionStorage.getItem("access")
    }
})

// const MODEL = 'claude-sonnet-5-5';
// const SYSTEM_PROMPT = 'You are a helpful, concise assistant. Format answers with Markdown when it helps.';


/** Streams the model's reply back to the browser as plain text. */
// @ts-ignore
export async function POST({ request, locals }) {
	// Protect the endpoint with your existing auth. Adjust to however your app stores the session.
	// if (!locals.user) return new Response('Unauthorized', { status: 401 });

	// if (!access) {
	// 	return new Response('You need to Login to access messaging', { status: 500 });
	// }
    
	let body;
	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON.', { status: 400 });
	}

	// Only pass through what the API needs; never trust extra fields from the client.
	const messages = (Array.isArray(body?.messages) ? body.messages : [])
		// @ts-ignore
		.filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content)
		// @ts-ignore
		.map((m) => ({ role: m.role, content: m.content }));

	if (!messages.length || messages.at(-1).role !== 'user') {
		return new Response('Last message must be from the user.', { status: 400 });
	}

    console.log(messages)

	const upstream = await fetch('http://127.0.0.1:8000/api/chat/stream/', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'Authorization': `Bearer ${access}`,
		},
		body: JSON.stringify({
			stream: true,
			messages
		}),
		signal: request.signal // user pressed Stop -> cancel the upstream request too
	});

	if (!upstream.ok || !upstream.body) {
		console.error('Upstream error', upstream.status, await upstream.text().catch(() => ''));
		return new Response('The AI service returned an error.', { status: 502 });
	}

	// Convert the provider's server-sent events into a stream of plain text chunks.
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const reader = upstream.body.getReader();

	const stream = new ReadableStream({
		async start(controller) {
			let buffer = '';
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });

					const lines = buffer.split('\n');
					buffer = lines.pop() ?? '';

					for (const line of lines) {
						if (!line.startsWith('data:')) continue;
						const data = line.slice(5).trim();
						if (!data) continue;
						try {
							const event = JSON.parse(data);
							if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
								controller.enqueue(encoder.encode(event.delta.text));
							}
						} catch {
							/* ignore partial or non-JSON lines */
						}
					}
				}
				controller.close();
			} catch (err) {
				controller.error(err);
			}
		},
		cancel() {
			reader.cancel();
		}
	});

	return new Response(stream, {
		headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache, no-transform' }
	});
}
