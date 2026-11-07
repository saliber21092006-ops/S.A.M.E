import { fail } from "@sveltejs/kit";

export const actions = {
    sign_up: async ({request, cookies}) =>{
        const data = await request.formData()
        const username = data.get("username")
        const email = data.get("email")
        const password = data.get("password")
        const password_confirm = data.get("password_confirm")

        if(!username || !email || !password || !password_confirm){
            return fail(400, {incorrect: true, message: "Fields can't be left blank"})
        }

        if(password_confirm !== password){
            return fail(400, {incorrect: true, message: "Passwords do not match. Please try again"})
        }

        const res = await fetch("http://127.0.0.1:8000/auth/sign_up/", {
            method: "POST",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({username, email, password})
        })

        if(!res.ok){
            let errMsg = await res.json()
            return fail(400, {error: true, message: errMsg.detail})
        }

         const setCookieHeader = res.headers.get('set-cookie')

        if(setCookieHeader){
            // set the access token 
            cookies.set('access', extractTokenValue(setCookieHeader, 'access'), {
                path: "/",
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 3600
            })

            // set the refresh token 
            cookies.set('refresh', extractTokenValue(setCookieHeader, 'refresh'), {
                path: "/",
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 86400
            })
        }

        return {
            success: true,
            message: "Account Successfully Created! Logging in....."
        }
    }
}


/**
 * @param {string} header
 * @param {any} cookieName
 */
function extractTokenValue(header, cookieName){
    const match = header.match(new RegExp(`${cookieName}=([^;]+)`))
    return match ? match[1] : ""
}