"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "@/lib/axios";
import { setAccessToken, clearAccessToken } from "@/lib/auth";

export function useAuthBootstrap() {
    const [ready, setReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // 홈페이지에서는 토큰 갱신을 시도하지 않음
        if (pathname === '/') {
            setReady(true);
            setIsAuthenticated(false);
            return;
        }

        axios.post<string>('/oauth/refresh', {}, {withCredentials: true})
        .then((res) => {
            setAccessToken(res.data);
            setIsAuthenticated(true);
        })
        .catch((e) => {
            console.error("Failed to bootstrap auth", e);
            clearAccessToken();
            setIsAuthenticated(false);
        })
        .finally(() => {
            setReady(true);
        });
    }, [pathname]);

    return { ready, isAuthenticated };
}