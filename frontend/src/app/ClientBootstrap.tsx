"use client";

import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function ClientBootstrap({ children }: PropsWithChildren) {
    const { ready, isAuthenticated } = useAuthBootstrap();
    const pathname = usePathname();

    if (!ready) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">페이지를 불러오는 중입니다...</p>
            </div>
        );
    }

    // 홈페이지나 인증 관련 페이지는 인증 체크를 건너뜀
    if (pathname === '/' || pathname.startsWith('/auth/')) {
        return <>{children}</>;
    }

    // 인증이 필요한 페이지에서 인증되지 않은 경우
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">인증 처리 중입니다...</p>
            </div>
        );
    }

    return <>{children}</>;
}