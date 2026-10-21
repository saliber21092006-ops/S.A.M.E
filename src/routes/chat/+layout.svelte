<script>
    import { onMount } from "svelte";
    /** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

    onMount(()=>{
        let ss = sessionStorage.getItem('access')
        if(!ss){
            window.location.href="/auth/login"
        }
    })
</script>

{@render children()}