<!-- 

<script>
    import { enhance } from "$app/forms";
    import { redirect } from "@sveltejs/kit";

    let { form } = $props()

    let username = $state("")
    let password = $state("")

    let loading = $state(false)
    let errorMessage = $state("")
    // let successMessage = $state("")


</script>

<svelte:head>
   <title>SAME - Login</title>
</svelte:head>

<main class="body">
    <div class="container">

        <div class="login_body">
            <h2>S.A.M.E - Login</h2>
           
            {#if form?.message}
                {#if form.success}
                    <p style="text-align: center;color: green;">{form.message}</p>
                    {redirect(303,"/chat")}
                {:else}
                    <p style="text-align: center;color: red;">{form.message}</p>
                {/if}
            {/if}

            {#if errorMessage}
            <p style="text-align: center;color: red;">{errorMessage}</p>
            {/if}

            <form method="POST" action="?/login" use:enhance={()=>{
                loading = true
                return async({result, update}) =>{
                    if(result.type === "failure" || result.type === "error"){
                        loading = false
                        //@ts-ignore
                        errorMessage = result.data?.message
                    }
                    if(result.type === "success"){
                        window.location.href = "/chat"
                    }
                }
            }}>
                
                <div class="username">
                    <input type="text" id="username" name="username" class="text-username" placeholder="Enter Username...">
                </div>

                <div class="password">
                    <input type="password" id="pwd" name="password" class="text-password" placeholder="Enter Password...">
                </div>

                <div class="lnks" style="display: flex;justify-content: space-around;align-items: center;">
                    <p>
                        <a href="/">fogotten password?</a>
                    </p>
                    <p>
                        <a href="/auth/sign_up">Create Account</a>
                    </p>
                </div>


                <div class="btn">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...': 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
        
        

    </div>
</main> -->
   
<!-- 
<style>
    *{
        padding: 0;
        margin: 0;
    }
    .body{
        background: transparent;
        min-height: 90vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .container{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 80%;
    }
    .login_body{
        width: 100%;
    }
    h2{
        margin: 5px;
        text-align: center;
    }
    .username input{
        width: 80%;
        padding: 10px;
        margin: 5px;
        margin-top: 15px;
        outline: none;
        border: none;
        border-bottom: 1px solid black;
    }
    .password input{
        width: 80%;
        padding: 10px;
        margin: 5px;
        margin-top: 15px;
        outline: none;
        border: none;
        border-bottom: 1px solid black;
    }

    .btn button{
        background: #777;
        width: 150px;
        padding: 15px;
        margin-top: 15px;
        border: none;
        border-radius: 5px;
    }
</style> -->


<script>
// @ts-nocheck

	import { enhance } from '$app/forms';

	let { form } = $props();

	let loading = $state(false);
	let errorMessage = $state('');
	let showPassword = $state(false);

	// Also covers the no-JS case, where the server re-renders the page with `form`
	const message = $derived(errorMessage || (form && !form.success ? form.message : ''));

	/** @type {import('@sveltejs/kit').SubmitFunction} */
	function submit() {
		loading = true;
		errorMessage = '';

		return async ({ result }) => {
			if (result.type === 'success') {
				// Stay in the loading state until the browser leaves the page
				window.location.href = '/chat';
				return;
			}

			loading = false;
			errorMessage =
				// @ts-ignore
				result.data?.message || 'Could not sign you in. Please try again.';
		};
	}
</script>

<svelte:head>
	<title>S.A.M.E - Login</title>
</svelte:head>

<main class="page">
	<section class="card" aria-labelledby="login-title">
		<div class="brand">
			<span class="logo" aria-hidden="true">S</span>
			<h1 id="login-title">Welcome back</h1>
			<p class="sub">Sign in to continue to S.A.M.E</p>
		</div>

		<div class="alert-slot" aria-live="polite">
			{#if message}
				<p class="alert" role="alert">{message}</p>
			{/if}
		</div>

		<form method="POST" action="?/login" use:enhance={submit} aria-busy={loading}>
			<div class="field">
				<label for="username">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					placeholder="Enter your username"
					autocomplete="username"
					autocapitalize="none"
					spellcheck="false"
					required
					readonly={loading}
				/>
			</div>

			<div class="field">
				<div class="label-row">
					<label for="pwd">Password</label>
					<a class="link small" href="/">Forgot password?</a>
				</div>
				<div class="pwd">
					<input
						id="pwd"
						name="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="Enter your password"
						autocomplete="current-password"
						required
						readonly={loading}
					/>
					<button
						type="button"
						class="eye"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						aria-pressed={showPassword}
						disabled={loading}
					>
						<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							{#if showPassword}
								<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 8.5 4 9.5 7a12 12 0 0 1-2.6 3.9M6.1 6.1A12.3 12.3 0 0 0 2.5 12C3.5 15 7 19 12 19c1.5 0 2.8-.3 4-.9" />
							{:else}
								<path d="M2.5 12C3.5 9 7 5 12 5s8.5 4 9.5 7c-1 3-4.5 7-9.5 7s-8.5-4-9.5-7z" /><circle cx="12" cy="12" r="3" />
							{/if}
						</svg>
					</button>
				</div>
			</div>

			<button type="submit" class="submit" disabled={loading}>
				{#if loading}
					<span class="spinner" aria-hidden="true"></span>
					<span>Signing in…</span>
				{:else}
					Sign in
				{/if}
			</button>
		</form>

		<p class="foot">
			New here? <a class="link" href="/auth/sign_up">Create an account</a>
		</p>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
	}

	.page {
		/* Same palette as the chat app */
		--c-bg: #faf9f6;
		--c-surface: #ffffff;
		--c-surface-2: #efede8;
		--c-border: #e4e1da;
		--c-text: #1d1c1a;
		--c-muted: #6f6b63;
		--c-accent: #c2410c;
		--c-accent-hover: #a8370a;
		--c-on-accent: #ffffff;
		--c-danger: #b42318;
		--c-danger-bg: #fef3f2;

		box-sizing: border-box;
		display: grid;
		place-items: center;
		min-height: 100dvh;
		padding: 24px 16px;
		background: var(--c-bg);
		color: var(--c-text);
		font:
			16px/1.5 system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}
	@media (prefers-color-scheme: dark) {
		.page {
			--c-bg: #1b1a18;
			--c-surface: #262522;
			--c-surface-2: #322f2b;
			--c-border: #3a3733;
			--c-text: #efede8;
			--c-muted: #a09b92;
			--c-accent: #f08a5d;
			--c-accent-hover: #f39d77;
			--c-on-accent: #2a1305;
			--c-danger: #f97066;
			--c-danger-bg: #3a1f1c;
		}
	}

	.card {
		box-sizing: border-box;
		width: 100%;
		max-width: 400px;
		padding: 32px 28px 24px;
		border: 1px solid var(--c-border);
		border-radius: 20px;
		background: var(--c-surface);
		box-shadow: 0 8px 30px rgb(0 0 0 / 0.06);
	}

	.brand {
		text-align: center;
		margin-bottom: 20px;
	}
	.logo {
		display: inline-grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: var(--c-accent);
		color: var(--c-on-accent);
		font-size: 1.3rem;
		font-weight: 700;
	}
	h1 {
		margin: 14px 0 2px;
		font-size: 1.5rem;
		font-weight: 650;
		letter-spacing: -0.01em;
	}
	.sub {
		margin: 0;
		color: var(--c-muted);
		font-size: 0.92rem;
	}

	/* reserves no space until an error appears */
	.alert-slot:empty {
		display: none;
	}
	.alert {
		margin: 0 0 16px;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--c-danger-bg);
		color: var(--c-danger);
		font-size: 0.9rem;
		text-align: center;
	}

	form {
		display: grid;
		gap: 16px;
	}
	.field {
		display: grid;
		gap: 6px;
	}
	label {
		font-size: 0.88rem;
		font-weight: 500;
	}
	.label-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		padding: 11px 12px;
		border: 1px solid var(--c-border);
		border-radius: 12px;
		background: var(--c-bg);
		color: var(--c-text);
		font: inherit; /* 16px: stops iOS zooming on focus */
	}
	input::placeholder {
		color: var(--c-muted);
	}
	input:focus-visible {
		outline: none;
		border-color: var(--c-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 22%, transparent);
	}
	input[readonly] {
		opacity: 0.7;
	}

	.pwd {
		position: relative;
	}
	.pwd input {
		padding-right: 44px;
	}
	.eye {
		position: absolute;
		top: 50%;
		right: 6px;
		translate: 0 -50%;
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border: 0;
		border-radius: 8px;
		background: none;
		color: var(--c-muted);
		cursor: pointer;
	}
	.eye:hover:not(:disabled) {
		color: var(--c-text);
		background: var(--c-surface-2);
	}
	.eye:focus-visible {
		outline: 2px solid var(--c-accent);
	}

	.submit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;
		min-height: 46px;
		margin-top: 4px;
		border: 0;
		border-radius: 12px;
		background: var(--c-accent);
		color: var(--c-on-accent);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}
	.submit:hover:not(:disabled) {
		background: var(--c-accent-hover);
	}
	.submit:focus-visible {
		outline: 2px solid var(--c-accent);
		outline-offset: 2px;
	}
	.submit:disabled {
		cursor: progress;
		opacity: 0.85;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2.5px solid color-mix(in srgb, var(--c-on-accent) 35%, transparent);
		border-top-color: var(--c-on-accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}

	.link {
		color: var(--c-accent);
		text-decoration: none;
		font-weight: 500;
	}
	.link:hover {
		text-decoration: underline;
	}
	.small {
		font-size: 0.82rem;
	}
	.foot {
		margin: 20px 0 0;
		text-align: center;
		color: var(--c-muted);
		font-size: 0.9rem;
	}

	@media (max-width: 480px) {
		.page {
			align-items: start;
			padding-top: max(40px, 8dvh);
		}
		.card {
			padding: 24px 18px 20px;
			border-radius: 16px;
			box-shadow: none;
		}
	}
	@media (max-height: 560px) {
		.page {
			align-items: start;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-duration: 1.6s;
		}
	}
</style>