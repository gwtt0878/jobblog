import { TokenPayload } from "@/types/Token";
import axios from "./axios";

let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}
 
export function clearAccessToken() {
  accessToken = null;
}

export function logout() {
    clearAccessToken();
    axios.post('/oauth/logout', {}, {withCredentials: true});
}

export function getUsername() : Promise<string> {
    return axios.get<string>('/users/me', {withCredentials: true})
    .then((res) => res.data);
}   

export function clearRefreshToken() {
    document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
  
export function parseJwt<T = Record<string, unknown>>(token: string): T | null {
    try {
        const [, payload] = token.split(".");
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/")); // base64 디코딩
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
        return null;
    }
}

export function isExpiringSoon(token: string | null, seconds = 60): boolean {
    if (!token) return true;
    const payload = parseJwt<TokenPayload>(token);
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now <= seconds;
}