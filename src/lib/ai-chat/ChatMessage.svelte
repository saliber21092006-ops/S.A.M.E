<script>
	import Markdown from './Markdown.svelte';

	/**
	 * message: { id, role, content }
	 * generating: true while THIS message is the one being streamed
	 * canRegenerate: show the regenerate action (last assistant message only)
	 */
	let { message, generating = false, canRegenerate = false, onregenerate } = $props();

	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(message.content);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* clipboard unavailable */
		}
	}
</script>

{#if message.role === 'user'}
	<div class="msg user">
		<div class="bubble">{message.content}</div>
	</div>
{:else}
	<div class="msg assistant">
		{#if generating && !message.content}
			<div class="thinking" role="status" aria-label="Assistant is thinking"><i></i><i></i><i></i></div>
		{:else}
			<div class="answer" class:streaming={generating}>
				<Markdown content={message.content} />
			</div>
		{/if}

		{#if !generating && message.content}
			<div class="actions">
				<button type="button" onclick={copy} aria-label="Copy response">{copied ? 'Copied' : 'Copy'}</button>
				{#if canRegenerate}
					<button type="button" onclick={onregenerate} aria-label="Regenerate response">Retry</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.msg {
		animation: in 0.2s ease-out;
	}
	.user {
		display: flex;
		justify-content: flex-end;
	}
	.bubble {
		max-width: min(85%, 560px);
		padding: 10px 16px;
		border-radius: 20px;
		border-bottom-right-radius: 6px;
		background: var(--c-user);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.assistant {
		min-width: 0;
	}
	/* Blinking caret at the end of the text while streaming */
	.answer.streaming :global(.md > :last-child)::after {
		content: '';
		display: inline-block;
		width: 8px;
		height: 1.05em;
		margin-left: 3px;
		vertical-align: text-bottom;
		border-radius: 2px;
		background: var(--c-accent);
		animation: blink 1s steps(2) infinite;
	}
	.thinking {
		display: flex;
		gap: 5px;
		padding: 10px 0;
	}
	.thinking i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--c-muted);
		animation: bounce 1.2s infinite ease-in-out;
	}
	.thinking i:nth-child(2) {
		animation-delay: 0.15s;
	}
	.thinking i:nth-child(3) {
		animation-delay: 0.3s;
	}
	.actions {
		display: flex;
		gap: 4px;
		margin-top: 6px;
		margin-left: -8px;
	}
	.actions button {
		padding: 4px 10px;
		border: 0;
		border-radius: 8px;
		background: none;
		color: var(--c-muted);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.actions button:hover {
		background: var(--c-surface-2);
		color: var(--c-text);
	}
	.actions button:focus-visible {
		outline: 2px solid var(--c-accent);
	}
	@keyframes in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.5;
		}
		30% {
			transform: translateY(-4px);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.msg,
		.thinking i,
		.answer.streaming :global(.md > :last-child)::after {
			animation: none;
		}
	}
</style>
