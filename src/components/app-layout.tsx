'use client';

import { useAuthStore } from '@/store/use-auth-store';
import { useUIStore } from '@/store/use-ui-store';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

import {
    BackgroundSelector,
    DashedGridBackground,
    DotsBackground,
    GradientBackground,
    SolidBackground,
} from '@/components/background-selector';
import { LoginButton } from '@/components/login-button';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function AppHeader({
    showAuth = true,
    showThemeToggle = true,
    showBackgroundSelector = false,
}: {
    showAuth?: boolean;
    showThemeToggle?: boolean;
    showBackgroundSelector?: boolean;
}) {
    const { isAuthenticated, logout, isHydrated } = useAuthStore();

    return (
        <div className="fixed top-4 right-4 flex gap-2 z-50">
            {showBackgroundSelector && <BackgroundSelector />}
            {showAuth && (
                <>
                    {isHydrated && isAuthenticated ? (
                        <button
                            onClick={() => logout()}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white dark:bg-zinc-950 transition-colors hover:bg-accent"
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    ) : (
                        <LoginButton />
                    )}
                </>
            )}
            {showThemeToggle && <ThemeToggleButton />}
        </div>
    );
}

export function AppLayout({
    children,
    title,
    subtitle,
    hideHeader = false,
    showAuth = true,
    showThemeToggle = true,
    showBackgroundSelector = false,
}: {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    hideHeader?: boolean;
    showAuth?: boolean;
    showThemeToggle?: boolean;
    showBackgroundSelector?: boolean;
}) {
    const { bgType } = useUIStore();

    return (
        <div className="relative min-h-screen w-full bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
            {showBackgroundSelector ? (
                <>
                    {bgType === 'dashed-grid' && <DashedGridBackground />}
                    {bgType === 'dots' && <DotsBackground />}
                    {bgType === 'gradient' && <GradientBackground />}
                    {bgType === 'solid' && <SolidBackground />}
                </>
            ) : (
                <DashedGridBackground />
            )}

            <AppHeader
                showAuth={showAuth}
                showThemeToggle={showThemeToggle}
                showBackgroundSelector={showBackgroundSelector}
            />
            <div className="relative z-10 flex flex-col items-center gap-8 p-4 pt-12 pb-24">
                <div className="w-full max-w-[1400px] flex flex-col gap-8">
                    {!hideHeader && (
                        <header className="flex flex-col gap-2">
                            <Link href="/" className="w-fit">
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity">
                                    {title}
                                </h1>
                            </Link>
                            {subtitle && <p className="text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
                        </header>
                    )}
                    <main className="w-full">{children}</main>
                </div>
            </div>
        </div>
    );
}
