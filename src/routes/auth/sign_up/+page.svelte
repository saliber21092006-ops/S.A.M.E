<script>
// @ts-nocheck

    import { enhance } from "$app/forms";
    import { redirect } from "@sveltejs/kit";

    // let { form } = $props()

    let loading = $state(false)
    let errorMsg = $state("")

</script>

<svelte:head>
   <title>SAME - Create Account</title>
</svelte:head>

<main class="body">
    <div class="container">

        <div class="signup_body">
            <h2>S.A.M.E - Sign Up</h2>

            <!-- {#if form?.message}
                {#if form.success}
                    <p style="text-align: center;color: green;">{form.message}</p>
                {:else if form.error}
                    <p style="text-align: center;color: red;">{form.message}</p>
                    {loading = false}
                {/if}
            {/if} -->

            {#if errorMsg}
            <p style="text-align: center;color: red;">{errorMsg}</p>
            {/if}

            <form method="POST" action="?/sign_up" use:enhance={() =>{
                loading = true
                errorMsg = ""

                return async({result, update}) => {
                    if(result.type === "success"){
                        loading = false
                        window.location.href="/chat"
                    }
                    else if(result.type === "failure" || result.type === "error"){
                        loading = false
                        errorMsg = result.data?.message || "An error occured during registration. Please try again."
                    }
                }
            }}>
                
                <div class="username">
                    <input type="text" id="username" name="username" class="text-username" placeholder="Enter Username...">
                </div>

                <div class="username">
                    <input type="text" id="email" name="email" class="text-email" placeholder="Enter Email Address...">
                </div>

                <div class="password">
                    <input type="password" id="pwd" name="password" class="text-password" placeholder="Enter Password...">
                </div>

                <div class="password">
                    <input type="password" id="pwd-2" name="password_confirm" class="text-password" placeholder="Re-enter Password...">
                </div>

                <p>
                   Already have an account? <a href="/auth/login">Sign in</a>
                </p>
                <div class="btn">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...': 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
        
        <!-- <div class="right">
            <p>This is Issus. Sign in to get access </p>
        </div> -->

    </div>
</main>
   

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
    .signup_body{
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
</style>