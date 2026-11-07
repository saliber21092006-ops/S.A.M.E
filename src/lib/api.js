// @ts-nocheck
const BASE_URL = 'http://127.0.0.1:8000'

// function that refreshes users token 
async function refreshToken(){
    try{
        const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-type': 'application/json'
            }
        })

        if(!response.ok){
            return false
        }

        return true
    }
    catch(err){
        console.error("An error occured", err)
        return false
    }
}


// the custom api fetcher 
export async function apiFetcher(url, options = {}) {
    let res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-type': 'application/json',
            ...options.headers
        }
    })

    if (res.status === 401) {
        if(url.includes('/api/token/refresh/')){
            window.location.href = "/auth/login"
            return res
        }

        const refreshed = await refreshToken()

        if(!refreshed){
            window.location.href = "/auth/login"
            return res
        }

        res = await fetch(`${BASE_URL}${url}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-type': 'application/json',
                ...options.headers
            }
        })
    }

    return res
}