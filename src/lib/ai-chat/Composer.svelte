<script>
	import { onMount, tick } from 'svelte';
	import { AIChatStore } from './ai-chat.svelte';

	let { onsend, onstop, streaming = false, placeholder = 'Message the assistant…' } = $props();

	let value = $state('');
	/**
     * @type {HTMLTextAreaElement}
     */
	let field;

	const canSend = $derived(value.trim().length > 0 && !streaming);

	function resize() {
		field.style.height = 'auto';
		field.style.height = `${Math.min(field.scrollHeight, 200)}px`;
	}

	function submit() {
		if (!canSend) return;
		onsend(value.trim());
		value = '';
		tick().then(resize);
	}

	/**
     * @param {{ key: string; shiftKey: any; isComposing: any; preventDefault: () => void; }} event
     */
	function onkeydown(event) {
		// Enter sends, Shift+Enter adds a newline. Ignore Enter while an IME is composing.
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			submit();
		}
	}

	onMount(() => {
		
		let loadMsg = new AIChatStore()
		loadMsg.loadDBMessages()

		if (window.matchMedia('(hover: hover)').matches) field.focus();
	});
</script>

<form
	class="composer"
	onsubmit={(event) => {
		event.preventDefault();
		submit();
	}}
>
	<textarea
		bind:this={field}
		bind:value
		rows="1"
		{placeholder}
		aria-label="Message"
		{onkeydown}
		oninput={resize}
	></textarea>

	{#if streaming}
		<button type="button" class="act" onclick={onstop} aria-label="Stop generating">
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
				<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
			</svg>
		</button>
	{:else}
		<button type="submit" class="act" disabled={!canSend} aria-label="Send message">
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	{/if}
</form>

<style>
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		padding: 10px 10px 10px 18px;
		border: 1px solid var(--c-border);
		border-radius: 24px;
		background: var(--c-surface);
		box-shadow: 0 2px 12px rgb(0 0 0 / 0.06);
		transition: border-color 0.15s;
	}
	.composer:focus-within {
		border-color: color-mix(in srgb, var(--c-accent) 60%, var(--c-border));
	}
	textarea {
		flex: 1;
		min-width: 0;
		padding: 8px 0;
		border: 0;
		outline: none;
		resize: none;
		background: none;
		color: var(--c-text);
		font: inherit;
		line-height: 1.5;
		max-height: 200px;
	}
	textarea::placeholder {
		color: var(--c-muted);
	}
	.act {
		flex: none;
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border: 0;
		border-radius: 50%;
		background: var(--c-accent);
		color: var(--c-on-accent);
		cursor: pointer;
		transition:
			opacity 0.15s,
			transform 0.15s;
	}
	.act:hover:not(:disabled) {
		transform: scale(1.06);
	}
	.act:focus-visible {
		outline: 2px solid var(--c-accent);
		outline-offset: 2px;
	}
	.act:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
