'use client';

import { useState } from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { useToastStore } from '@/store/use-toast-store';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';

import { loginWithUsaint as apiLoginWithUsaint } from '@/services/auth';

import { getErrorMessage } from '@/utils/get-error-message';

export default function LoginPage() {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const showToast = useToastStore((s) => s.show);
    const loginWithUsaint = useAuthStore((s) => s.loginWithUsaint);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentId || !password) {
            showToast({
                title: 'Error',
                message: 'Please fill in all fields',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiLoginWithUsaint({ studentId, password });
            console.log('Login successful:', response);

            // Store appSessionId in Zustand (persisted to localStorage)
            loginWithUsaint(response.appSessionId);

            showToast({
                title: 'Success',
                message: 'Logged in successfully with u-SAINT',
                type: 'success',
            });

            // Redirect to home or feed after successful login
            router.push('/');
        } catch (error) {
            console.error('Login error:', error);
            showToast({
                title: 'Login Failed',
                message: getErrorMessage(
                    error as
                        | Error
                        | string
                        | {
                              message?: string;
                              error?: string | { message?: string; details?: { message: string }[] };
                              success?: boolean;
                          }
                        | null
                        | undefined,
                    'Failed to login with u-SAINT',
                ),
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Login with u-SAINT
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Enter your Soongsil University student ID and password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="studentId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Student ID
                            </label>
                            <Input
                                id="studentId"
                                type="text"
                                placeholder="20XXXXXXXX"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader className="mr-2 h-4 w-4" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </Button>
                </form>

                <div className="text-center text-xs text-zinc-500">
                    <p>This application does not store your u-SAINT password.</p>
                </div>
            </div>
        </div>
    );
}
