<!-- <script>
    import Login from "#lib/component/Login.svelte";

</script>

<Login /> -->

<script>
    import { enhance } from "$app/forms";
    import { redirect } from "@sveltejs/kit";

    let { form } = $props()

    let username = $state("")
    let password = $state("")

    let loading = $state(false)
    let errorMessage = $state("")
    // let successMessage = $state("")


    /**
     * @param {{ preventDefault: () => void; }} e
     */
    // async function handle_login(e){
    //     e.preventDefault()

    //     const cleanUsername = username.trim()
    //     const cleanPassword = password.trim()

    //     if(!cleanUsername || !cleanPassword){
    //         errorMsg("Please fill out both fields")
    //         return
    //     }

    //     if(cleanPassword.length < 8){
    //         errorMsg("Password must be at least 8 characters long!")
    //         return;
    //     }

    //     loading = true

    //     try{
    //         const res = await fetch("http://127.0.0.1:8000/auth/login/", {
    //             method: "POST",
    //             headers: {'Content-Type': 'application/json'},
    //             credentials: 'include',
    //             body: JSON.stringify({'username':cleanUsername, 'password':cleanPassword})
    //         })

    //         if(res.ok){
    //             console.log("hey")
    //             const data = await res.json()
    //             successMessage = data.detail
    //             // _storage(data.access, data.refresh)
    //             window.location.href="/chat"
    //         }

    //         else if(!res.ok){
    //             const data = await res.json()
    //             errorMsg(`${data.detail || 'Invalid Credentials, Please Try again.'}`)
    //         }

    //     }
    //     catch(e){
    //         errorMsg(`${e}`)
    //     }
    //     finally{
    //         loading = false
    //     }

    // }
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