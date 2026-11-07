import { fail, redirect } from '@sveltejs/kit'

export const actions = {
    login: async(routeEvent) =>{
        const data = await routeEvent.request.formData()
        const username = data.get('username')
        const password = data.get("password")

        if(!username && !password){
            return fail(400, {incorrect: true, message: "Fields can't be left blank"})
        }

        const response = await fetch("http://127.0.0.1:8000/auth/login/", {
            method: "POST",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({username, password})
        })

        if(!response.ok){
            return fail(400, {incorrect: true, message: "Invalid Credential"})
        }

        const setCookieHeader = response.headers.get('set-cookie')
        
        if (setCookieHeader){
            // set access token 
            routeEvent.cookies.set('access', extractTokenValue(setCookieHeader, 'access'), {
                path: "/",
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 3600
            })
            // set refresh token 
            routeEvent.cookies.set('refresh', extractTokenValue(setCookieHeader, 'refresh'), {
                path: "/",
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 86400
            })
        }

        // throw redirect(303, '/chat')
        return {
            success: true,
            message: "Login was successful! Redirecting...."
        }
    }
}

// @ts-ignore
function extractTokenValue(header, cookieName){
    const match = header.match(new RegExp(`${cookieName}=([^;]+)`))
    return match ? match[1] : ""
}