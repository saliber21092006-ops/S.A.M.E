import { redirect } from "@sveltejs/kit";

export async function load({ cookies }){
    const accessToken = cookies.get('access')

    if(!accessToken){
        throw redirect(303, '/auth/login')
    }

    return {}
}