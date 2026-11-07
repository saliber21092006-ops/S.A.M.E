import { redirect } from "@sveltejs/kit";

// Same guard as routes/chat/+page.server.js, because that load only runs for /chat itself.
export async function load(event){
    const accessToken = event.cookies.get('access')

    if(!accessToken){
        throw redirect(303, "/auth/login")
    }

    const res = await fetch("http://127.0.0.1:8000/auth/get_user_info/", {
        method: "GET",
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })

    if(!res.ok){
        event.cookies.delete('access', {path: '/'})
        throw redirect(303, '/auth/login')
    }

    const userData = await res.json()

    return {
        user: userData,
        chatId: event.params.id
    }
}
