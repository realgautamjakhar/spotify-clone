import { ACCESS_TOKEN , EXPIRES_IN , TOKEN_TYPE } from "../common";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read"
const REDIRECT_URI = "http://localhost:3000/login/login.html"
const APP_URL = "http://localhost:3000"

const authorizeUser = () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_dialog=true`
    window.open(url,"login","width=800,height=600")
}
document.addEventListener("DOMContentLoaded",()=>{
    const loginBtn = document.getElementById("login-btn")
    loginBtn.addEventListener("click",authorizeUser)
})

window.setItemsInLocalStorage = (accessToken,token_type,expires_in) => {
    localStorage.setItem(ACCESS_TOKEN,accessToken)
    localStorage.setItem(TOKEN_TYPE,token_type)
    localStorage.setItem(EXPIRES_IN,expires_in)
    window.Location.href = "http://localhost:3000/dashboard/dashboard.html";
}

window.addEventListener("load",()=>{
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    
    if (accessToken){
        window.location.href = "http://localhost:3000/dashboard/dashboard.html";
    }

    if(window.opener !== null && !window.opener.closed){
        window.focus();
        if(window.location.href.includes("error")){
            window.close();
        }

        const { hash } = window.location;
        const searchParams = new URLSearchParams(hash);
        const accessToken = searchParams.get("#access_token");
        const token_type = searchParams.get("token_type");
        const expires_in = searchParams.get("expire_in");
        
        if(accessToken){
            window.close();
            window.opener.setItemsInLocalStorage(accessToken,token_type,expires_in);
        }else{
            window.close();
        }
    }
})