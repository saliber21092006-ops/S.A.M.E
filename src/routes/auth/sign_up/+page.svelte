<script>
    import { redirect } from "@sveltejs/kit";
    import { onMount } from "svelte";

    let username = $state("")
    let email = $state("")
    let password = $state("")
    let confirmPassword = $state("")

    let loading = $state(false)
    let errorMessage = $state("")
    let successMessage = $state("")

    onMount(()=>{
        console.log("What's the problem")
    })

    function _storage(access = '', refresh = ''){
        sessionStorage.setItem('access', access)
        sessionStorage.setItem('refresh', refresh)
    }

    function errorMsg(msg=''){
        errorMessage = msg
        setTimeout(() => {
            errorMessage=""
        }, 3000);
    }

    /**
     * @param {{ preventDefault: () => void; }} e
     */
    async function handle_login(e){
        e.preventDefault()

        const cleanUsername = username.trim()
        const cleanEmail = email.trim()
        const cleanPassword = password.trim()
        const cleanConfirm = confirmPassword.trim()

        if(!cleanUsername || !cleanPassword || !cleanEmail || !cleanConfirm){
            errorMsg("Please fill out all fields")
            return
        }

        if(cleanPassword !== cleanConfirm){
            errorMsg("Passwords do not match! Please Try Again")
            return
        }

        if(cleanPassword.length < 8){
            errorMsg("Password must be at least 8 characters long!")
            return;
        }

        loading = true

        try{
            const res = await fetch("http://127.0.0.1:8000/auth/sign_up/", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'username':cleanUsername,
                    'email':cleanEmail,
                    'password':cleanPassword,
                })
            })

            const data = await res.json()

            if(!res.ok){
                errorMsg(`${data.detail || 'Invalid Credentials'}`)
            }

            successMessage = "Account Created Successfully! You will be redirected to the Login page"
            return window.location.href = "/auth/login"

        }
        catch(e){
            errorMsg(`${e}`)
        }
        finally{
            loading = false
        }

    }
</script>

<svelte:head>
   <title>Issus - Create Account</title>
</svelte:head>

<main class="body">
    <div class="container">

        <div class="login_body">
            <h2>S.A.M.E - Sign Up</h2>
            {#if errorMessage}
                <p style="text-align: center;color: red;">{errorMessage}</p>
            {/if}

            {#if successMessage}
                <p style="text-align: center;color: green;">{successMessage}</p>
            {/if}

            <form onsubmit={handle_login}>
                
                <div class="username">
                    <input type="text" id="username" class="text-username" bind:value={username} placeholder="Enter Username...">
                </div>

                <div class="username">
                    <input type="text" id="email" class="text-email" bind:value={email} placeholder="Enter Email Address...">
                </div>

                <div class="password">
                    <input type="password" id="pwd" class="text-password" bind:value={password} placeholder="Enter Password...">
                </div>

                <div class="password">
                    <input type="password" id="pwd-2" class="text-password" bind:value={confirmPassword} placeholder="Re-enter Password...">
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
</style>