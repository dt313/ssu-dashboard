'use client';

import { useEffect, useState } from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { useToastStore } from '@/store/use-toast-store';
import { useUsaintStore } from '@/store/use-usaint-store';

import { CategoryGradeCard } from '@/components/category-grade-card';
import { ChapelCard } from '@/components/chapel-card';
import { GraduationCard } from '@/components/graduation-card';
import { ScholarshipCard } from '@/components/scholarship-card';
import { SemesterGradeCard } from '@/components/semester-grade-card';
import { StudentInfoCard } from '@/components/student-info';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { TimetableCard } from '@/components/timetable-card';
import { TuitionCard } from '@/components/tuition-card';
import { Loader } from '@/components/ui/loader';

import { usaintService } from '@/services';

import { getErrorMessage } from '@/utils/get-error-message';

export default function Home() {
    const { appSessionId, isAuthenticated, logout } = useAuthStore();
    const {
        studentInfo,
        tuitionInfo,
        tuitionNotice,
        timetableInfo,
        graduationInfo,
        chapelInfo,
        categoryGrade,
        semesterGrade,
        scholarshipInfo,
    } = useUsaintStore();
    const [isLoading, setIsLoading] = useState(false);
    const showToast = useToastStore((s) => s.show);

    useEffect(() => {
        const fetchUsaintData = async () => {
            if (!appSessionId || !isAuthenticated) return;

            // If we don't have any data yet, show the loader
            if (
                !studentInfo &&
                !tuitionInfo &&
                !tuitionNotice &&
                !timetableInfo &&
                !graduationInfo &&
                !chapelInfo &&
                !categoryGrade &&
                !semesterGrade &&
                !scholarshipInfo
            ) {
                setIsLoading(true);
            }

            try {
                // Fetch all data in parallel
                const results = await Promise.allSettled([
                    usaintService.callStudentInfoApi({ appSessionId }),
                    usaintService.callTuitionApi({ appSessionId }),
                    usaintService.callTuitionNoticeApi({ appSessionId }),
                    usaintService.callTimetableApi({ appSessionId }),
                    usaintService.callGraduationApi({ appSessionId }),
                    usaintService.callChapelApi({ appSessionId }),
                    usaintService.callCategoryGrade({ appSessionId }),
                    usaintService.callSemesterGradeApi({ appSessionId }),
                    usaintService.callSemesterGradeOldVersionApi({ appSessionId }),
                    usaintService.callScholarshipApi({ appSessionId }),
                ]);

                // Check for failures and show toasts
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        const error = result.reason;
                        const apiNames = [
                            'Student Info',
                            'Tuition History',
                            'Tuition Notice',
                            'Timetable',
                            'Graduation Audit',
                            'Chapel Attendance',
                            'Category Grade',
                            'Semester Grade',
                        ];

                        console.error(`Error fetching ${apiNames[index]}:`, error);

                        if (error?.error === 'Session expired or invalid. Please login again.') {
                            logout();
                            return;
                        }

                        // Only show toast for critical failures or if we have no cached data
                        showToast({
                            title: `${apiNames[index]} Failed`,
                            message: getErrorMessage(error, `Failed to fetch ${apiNames[index]}`),
                            type: 'error',
                        });
                    }
                });
            } catch (error: any) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsaintData();
    }, [appSessionId, isAuthenticated, logout, showToast]);

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
                                <div className="flex flex-col gap-6">
                                    {/* Left Column (Student Info + Tuition): Takes 2/5 width */}
                                    <div className="flex gap-6  flex-col lg:flex-row">
                                        <div className="flex flex-col gap-6 lg:max-w-100">
                                            {studentInfo && <StudentInfoCard data={studentInfo} />}
                                            <ChapelCard data={chapelInfo} studentId={studentInfo?.studentId} />
                                        </div>
                                        {/* Right Column (Graduation Audit): Takes 3/5 width */}
                                        <div className="flex-1 lg:min-w-150">
                                            <TimetableCard data={timetableInfo} className="h-full" />
                                        </div>
                                    </div>

                                    <div className="flex gap-6 flex-col lg:flex-row">
                                        <div className={'flex-1 lg:min-w-150'}>
                                            {graduationInfo && <GraduationCard data={graduationInfo} />}
                                        </div>
                                        <div className="gap-6 w-full flex-1 flex flex-col">
                                            {tuitionInfo && (
                                                <TuitionCard
                                                    data={tuitionInfo}
                                                    noticeData={tuitionNotice ?? undefined}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {categoryGrade && <CategoryGradeCard data={categoryGrade} />}
                                    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                                        <div className="flex-1">
                                            {semesterGrade && <SemesterGradeCard data={semesterGrade} className="h-full" />}
                                        </div>
                                        <div className="flex-1">
                                            {scholarshipInfo && <ScholarshipCard data={scholarshipInfo} className="h-full" />}
                                        </div>
                                    </div>
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
