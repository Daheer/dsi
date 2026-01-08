'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, initialize } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (mounted && !isLoading) {
            const isAuthPage = pathname === '/login';

            if (!isAuthenticated && !isAuthPage) {
                router.push('/login');
            } else if (isAuthenticated && isAuthPage) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, mounted, pathname, router]);

    if (!mounted || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                    <p className="text-sm text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
