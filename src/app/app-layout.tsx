'use client';

import * as React from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { useUIStore } from '@/store/use-ui-store';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
    BackgroundSelector,
    DashedGridBackground,
    DotsBackground,
    GradientBackground,
    SolidBackground,
} from '@/components/background-selector';
import { LoginButton } from '@/components/login-button';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function AppHeader() {
    const { isHydrated, isAuthenticated, logout } = useAuthStore();
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <div className="fixed top-4 right-4 flex gap-2 z-50">
            <BackgroundSelector />

            {isHydrated && isAuthenticated && !isLoginPage && (
                <>
                    <button
                        onClick={() => logout()}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white dark:bg-zinc-950 transition-colors hover:bg-accent"
                        aria-label="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </>
            )}
            <ThemeToggleButton />
        </div>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { bgType, isHydrated } = useUIStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            {mounted && isHydrated && (
                <>
                    {bgType === 'dashed-grid' && <DashedGridBackground />}
                    {bgType === 'dots' && <DotsBackground />}
                    {bgType === 'gradient' && <GradientBackground />}
                    {bgType === 'solid' && <SolidBackground />}
                </>
            )}

            <AppHeader />
            <div className="relative z-10 flex flex-col items-center gap-8 p-4 pt-12 pb-24">
                <div className="w-full max-w-[1400px] flex flex-col gap-8">
                    <main className="w-full">{children}</main>
                </div>
            </div>
        </div>
    );
}
