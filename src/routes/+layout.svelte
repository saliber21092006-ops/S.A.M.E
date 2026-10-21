<script>
    import { onMount } from "svelte";
	import favicon from '#lib/assets/favicon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	onMount(()=>{
		console.log("Hello, world")
	})

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

