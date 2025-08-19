import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, isExpiringSoon, setAccessToken, clearAccessToken } from "./auth";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() : Promise<void> {
    const doRefresh = async () => {
        const res = await instance.post<string>("/oauth/refresh", {}, { withCredentials: true });
        setAccessToken(res.data);
    }

    if (!refreshPromise) {
        refreshPromise = doRefresh().catch((e) => { throw e; })
        .finally(() => { refreshPromise = null; });
    }

    return refreshPromise;
}
    
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const isRefreshRequest = Boolean(config.url && config.url.includes("/oauth/refresh"));
    let token = getAccessToken();

    if (!isRefreshRequest && token && isExpiringSoon(token)) {
        try {
            await refreshAccessToken();
            token = getAccessToken();
        } catch {
            token = null;
        }
    }

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const isRefreshRequest = Boolean(originalRequest.url && originalRequest.url.includes("/oauth/refresh"));

        if (status === 401 && !originalRequest._retry && !isRefreshRequest) {
            try {
                originalRequest._retry = true;
                await refreshAccessToken();
                const token = getAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                if (token) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return instance(originalRequest);
            } catch (refreshError) {
                // 토큰 갱신 실패 시 로그아웃 처리
                clearAccessToken();
                
                // refresh 요청이 아닌 경우에만 홈페이지로 리다이렉트
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
                
                return Promise.reject(refreshError);
            }
        }

        // refresh 요청 자체가 401인 경우 바로 로그아웃 처리
        if (status === 401 && isRefreshRequest) {
            clearAccessToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default instance;