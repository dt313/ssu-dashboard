'use client';

import * as React from 'react';

import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LoginButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/login')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
            aria-label="Login"
        >
            <LogIn className="h-4 w-4" />
        </button>
    );
}
