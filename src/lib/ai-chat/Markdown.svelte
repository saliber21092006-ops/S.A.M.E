<script module>
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	marked.setOptions({ gfm: true, breaks: false });

	// Links in answers open in a new tab.
	if (typeof window !== 'undefined') {
		DOMPurify.addHook('afterSanitizeAttributes', (node) => {
			if (node.tagName === 'A') {
				node.setAttribute('target', '_blank');
				node.setAttribute('rel', 'noopener noreferrer');
			}
		});
	}
</script>

<script>
	let { content = '' } = $props();

	// @ts-ignore
	let root;

	// The model's output is untrusted HTML once rendered, so it is always sanitized.
	const html = $derived(
		typeof window === 'undefined' || !content
			? ''
			// @ts-ignore
			: DOMPurify.sanitize(marked.parse(content), { ADD_ATTR: ['target'] })
	);

	// Add a "Copy" button to every code block after each render.
	$effect(() => {
		html;
		// @ts-ignore
		if (!root) return;
		for (const pre of root.querySelectorAll('pre')) {
			if (pre.querySelector('.copy')) continue;
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'copy';
			button.textContent = 'Copy';
			button.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? '');
					button.textContent = 'Copied';
				} catch {
					button.textContent = 'Failed';
				}
				setTimeout(() => (button.textContent = 'Copy'), 1500);
			});
			pre.append(button);
		}
	});
</script>

<div class="md" bind:this={root}>{@html html}</div>

<style>
	.md {
		line-height: 1.65;
		overflow-wrap: anywhere;
	}
	.md :global(> :first-child) {
		margin-top: 0;
	}
	.md :global(> :last-child) {
		margin-bottom: 0;
	}
	.md :global(p),
	.md :global(ul),
	.md :global(ol),
	.md :global(blockquote),
	.md :global(table),
	.md :global(pre) {
		margin: 0.8em 0;
	}
	.md :global(h1),
	.md :global(h2),
	.md :global(h3),
	.md :global(h4) {
		margin: 1.3em 0 0.5em;
		line-height: 1.3;
	}
	.md :global(h1) {
		font-size: 1.4em;
	}
	.md :global(h2) {
		font-size: 1.2em;
	}
	.md :global(h3) {
		font-size: 1.05em;
	}
	.md :global(ul),
	.md :global(ol) {
		padding-left: 1.5em;
	}
	.md :global(li) {
		margin: 0.25em 0;
	}
	.md :global(a) {
		color: var(--c-accent);
	}
	.md :global(blockquote) {
		padding-left: 1em;
		border-left: 3px solid var(--c-border);
		color: var(--c-muted);
	}
	.md :global(hr) {
		border: 0;
		border-top: 1px solid var(--c-border);
		margin: 1.4em 0;
	}
	.md :global(code) {
		padding: 0.15em 0.4em;
		border-radius: 6px;
		background: var(--c-code-bg);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.88em;
	}
	.md :global(pre) {
		position: relative;
		padding: 14px 16px;
		border-radius: 12px;
		background: var(--c-code-bg);
		border: 1px solid var(--c-border);
		overflow-x: auto;
	}
	.md :global(pre code) {
		padding: 0;
		background: none;
		font-size: 0.85em;
		line-height: 1.55;
	}
	.md :global(pre .copy) {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 3px 10px;
		border: 1px solid var(--c-border);
		border-radius: 8px;
		background: var(--c-surface);
		color: var(--c-muted);
		font: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s;
	}
	.md :global(pre:hover .copy),
	.md :global(pre .copy:focus-visible) {
		opacity: 1;
	}
	@media (hover: none) {
		.md :global(pre .copy) {
			opacity: 1;
		}
	}
	.md :global(table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
	}
	.md :global(th),
	.md :global(td) {
		padding: 6px 12px;
		border: 1px solid var(--c-border);
		text-align: left;
	}
	.md :global(th) {
		background: var(--c-code-bg);
	}
</style>
