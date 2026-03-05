'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { useToastStore } from '@/store/use-toast-store';

import { ThemeToggleButton } from '@/components/theme-toggle-button';

import { usaintService } from '@/services';

export default function Home() {
    const { appSessionId, isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchUsaintData = async () => {
            if (!appSessionId) return;

            try {
                const res = await usaintService.callUsaintApi({ appSessionId });
                console.log('u-SAINT API response:', res);
            } catch (error) {
                console.error('Error fetching u-SAINT data:', error);
            }
        };

        fetchUsaintData();
    }, [appSessionId]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-zinc-900 gap-4">
            <ThemeToggleButton />
            <h1 className="text-2xl font-bold">Hello World</h1>

            {isAuthenticated ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-green-600 font-medium">You are logged in with session: {appSessionId}</p>
                </div>
            ) : (
                <p className="text-zinc-500">Please login to access student info</p>
            )}
        </div>
    );
}
