export const ACCESS_TOKEN = "accessToken";
export const TOKEN_TYPE = "token_type";
export const EXPIRES_IN = "expires_in";
const APP_URL = import.meta.env.VITE_APP_URL;

export const ENDPOINT = {
    userInfo:"me",
    featuredPlaylist:"browse/featured-playlists",
    toplists:"browse/categories/toplists/playlists?limit=10",
    playlist:"playlists"
}
export const logout = () =>{
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(EXPIRES_IN)
    localStorage.removeItem(TOKEN_TYPE)
    window.location.href = APP_URL;
}

export const SECTIONTYPE = {
    DASHBOARD:"DASHBOARD",
    PLAYLIST:"PLAYLIST"
}