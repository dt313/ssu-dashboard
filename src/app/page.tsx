'use client';

import { useEffect, useState } from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { useUsaintStore } from '@/store/use-usaint-store';

import { ChapelCard } from '@/components/chapel-card';
import { GraduationCard } from '@/components/graduation-card';
import { StudentInfoCard } from '@/components/student-info';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { TimetableCard } from '@/components/timetable-card';
import { TuitionCard } from '@/components/tuition-card';
import { Loader } from '@/components/ui/loader';

import { usaintService } from '@/services';

export default function Home() {
    const { appSessionId, isAuthenticated, logout } = useAuthStore();
    const { studentInfo, tuitionInfo, timetableInfo, graduationInfo, chapelInfo } = useUsaintStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUsaintData = async () => {
            if (!appSessionId || !isAuthenticated) return;

            // If we don't have any data yet, show the loader
            if (!studentInfo && !tuitionInfo && !timetableInfo && !graduationInfo && !chapelInfo) {
                setIsLoading(true);
            }

            try {
                // Fetch all data in parallel
                await Promise.allSettled([
                    usaintService.callStudentInfoApi({ appSessionId }),
                    usaintService.callTuitionApi({ appSessionId }),
                    usaintService.callTimetableApi({ appSessionId }),
                    usaintService.callGraduationApi({ appSessionId }),
                    usaintService.callChapelApi({ appSessionId }),
                ]);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                if (error.error === 'Session expired or invalid. Please login again.') {
                    logout();
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsaintData();
    }, [appSessionId, isAuthenticated, logout]);

    return (
        <div className="relative min-h-screen w-full bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
            {/* Dashed Grid Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
                        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 0',
                    maskImage: `
                        repeating-linear-gradient(
                            to right,
                            black 0px,
                            black 3px,
                            transparent 3px,
                            transparent 8px
                        ),
                        repeating-linear-gradient(
                            to bottom,
                            black 0px,
                            black 3px,
                            transparent 3px,
                            transparent 8px
                        )
                    `,
                    WebkitMaskImage: `
                        repeating-linear-gradient(
                            to right,
                            black 0px,
                            black 3px,
                            transparent 3px,
                            transparent 8px
                        ),
                        repeating-linear-gradient(
                            to bottom,
                            black 0px,
                            black 3px,
                            transparent 3px,
                            transparent 8px
                        )
                    `,
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8 p-4 pt-12 pb-24">
                <div className="fixed top-4 right-4 flex gap-2 z-50">
                    {isAuthenticated && (
                        <button
                            onClick={() => logout()}
                            className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 shadow-sm"
                        >
                            Logout
                        </button>
                    )}
                    <ThemeToggleButton />
                </div>

                <div className="w-full max-w-[1400px] flex flex-col gap-8">
                    <header className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            SSU Dashboard
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Manage your academic information in one place.
                        </p>
                    </header>

                    <main className="w-full">
                        {isAuthenticated ? (
                            isLoading ? (
                                <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                    <Loader className="h-8 w-8 text-primary" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    {/* Left Column (Student Info + Tuition): Takes 2/5 width */}
                                    <div className="lg:col-span-2 flex flex-col gap-6">
                                        {studentInfo && <StudentInfoCard data={studentInfo} />}
                                        <ChapelCard data={chapelInfo} studentId={studentInfo?.studentId} />
                                        {tuitionInfo && tuitionInfo.length > 0 && <TuitionCard data={tuitionInfo} />}
                                    </div>

                                    {/* Right Column (Graduation Audit): Takes 3/5 width */}
                                    <div className="lg:col-span-3">
                                        {graduationInfo && (
                                            <GraduationCard data={graduationInfo} className="h-full flex flex-col" />
                                        )}
                                    </div>

                                    {/* Bottom: Timetable (Full Width) */}
                                    {timetableInfo && timetableInfo.length > 0 && (
                                        <div className="lg:col-span-5">
                                            <TimetableCard data={timetableInfo} />
                                        </div>
                                    )}

                                    {!studentInfo && !tuitionInfo && !timetableInfo && !graduationInfo && (
                                        <div className="lg:col-span-5 flex h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                            <p className="text-zinc-500">Failed to load academic information.</p>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                <p className="text-zinc-500 text-center px-4">Please login to access student info.</p>
                                <a
                                    href="/login"
                                    className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
                                >
                                    Login
                                </a>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
