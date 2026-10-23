import { onMount } from "svelte"

let access = sessionStorage.getItem('access')
let refresh = sessionStorage.getItem('refresh')

// onMount(()=>{
//     if(typeof sessionStorage !=="undefined"){
//         access = sessionStorage.getItem("access")
//         refresh = sessionStorage.getItem("refresh")
//     }
// })

// console.log(access)

if(!access && !refresh){
    // alert('You are not logged in')
    if(typeof window !=="undefined"){
        window.location.href="/auth/login"
    }
}

function handleLogout(){
    sessionStorage.removeItem('access')
    sessionStorage.removeItem('refresh')
    window.location.href="/auth/login"
}

function _storage(access = '', refresh = ''){
    sessionStorage.setItem('access', access)
    sessionStorage.setItem('refresh', refresh)
}

// async function ApiFetcher(url = "", options = {}){
//     const makereq = async()=>{
//         let req = await fetch(url, {
//             headers: {
//                 'Content-type': 'appplication/json',
//                 'Authorization': `Bearer ${access}`
//             },
//             ...options
//         })

//         return req
//     }

//     if(!makereq || makereq().status == 401){

//     }

//     return makereq
// }

export async function _ApiFetcher(url = "", options = {}){
    let access_token = await cookieStore.get("access")
    let makereq = await fetch(url, {
            headers: {
                'Content-type': 'appplication/json',
                'Authorization': `Bearer ${access_token?.value}`
            },
            ...options
    })

    if(makereq.status == 401 && refresh){
        try{
            let refresh_token = await tokenRefresher(access_token?.value)
            if(refresh_token){
                makereq = await fetch(url, {
                        ...options.headers,
                        headers: {
                            'Content-type': 'appplication/json',
                            'Authorization': `Bearer ${access_token?.value}`
                        },
                })
            }
            else{
                // refresh too is expired
                handleLogout()
                throw new Error('Session expired. Please log in again')
            }
        }
        catch(err){
            console.error('Token refresh failed', err)
        }
    }

    return makereq
}


async function tokenRefresher(access_token = ""){
    const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({"token": refresh})
    })

    if(!res.ok){
        return false
    }
    
    let data = await res.json()
    _storage(data.access, data.refresh)
    return true
}

