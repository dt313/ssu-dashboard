'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { useToastStore } from '@/store/use-toast-store';
import { useUIStore } from '@/store/use-ui-store';
import { useUsaintStore } from '@/store/use-usaint-store';
import { toPng } from 'html-to-image';
import { Camera, Github, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CategoryGradeCard } from '@/components/category-grade-card';
import { ChapelCard } from '@/components/chapel-card';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { GraduationCard } from '@/components/graduation-card';
import { ScholarshipCard } from '@/components/scholarship-card';
import { SemesterGradeCard } from '@/components/semester-grade-card';
import { StudentInfoCard } from '@/components/student-info';
import { TimetableCard } from '@/components/timetable-card';
import { TuitionCard } from '@/components/tuition-card';

import { usaintService } from '@/services';

import { getErrorMessage } from '@/utils/get-error-message';

import { cn } from '@/utils';

export default function Main() {
    const router = useRouter();
    const { appSessionId, isAuthenticated, isHydrated, logout } = useAuthStore();
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
        subjectGradeDetail,
    } = useUsaintStore();
    const { blurEffect } = useUIStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isFetchingGradeDetail, setIsFetchingGradeDetail] = useState(false);
    const showToast = useToastStore((s) => s.show);
    const initialFetchDone = useRef(false);
    const captureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isHydrated, router]);

    const handleCapture = async () => {
        if (!captureRef.current) return;

        setIsCapturing(true);
        try {
            // Get current background color to ensure capture matches theme
            const bgColor = window.getComputedStyle(document.body).backgroundColor;

            const dataUrl = await toPng(captureRef.current, {
                cacheBust: true,
                backgroundColor: bgColor,
                pixelRatio: 3, // Higher quality
            });

            const link = document.createElement('a');
            link.download = `ssu-dashboard-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();

            showToast({ title: 'Captured', message: 'Screenshot saved successfully', type: 'success' });
        } catch (error) {
            console.error('Capture failed:', error);
            showToast({ title: 'Capture Failed', message: 'Failed to capture screenshot', type: 'error' });
        } finally {
            setIsCapturing(false);
        }
    };

    const fetchUsaintData = useCallback(
        async (isManualRefresh = false) => {
            if (!appSessionId || !isAuthenticated) return;

            const hasNoData =
                !studentInfo &&
                !tuitionInfo &&
                !tuitionNotice &&
                !timetableInfo &&
                !graduationInfo &&
                !chapelInfo &&
                !categoryGrade &&
                !semesterGrade &&
                !scholarshipInfo;

            if (isManualRefresh) {
                setIsRefreshing(true);
                setIsLoading(true);
                showToast({
                    title: 'Syncing Data',
                    message: 'Fetching latest information from uSAINT...',
                    type: 'info',
                });
            } else if (hasNoData) {
                setIsLoading(true);
            }

            try {
                const fetchTasks = [
                    usaintService.callStudentInfoApi({ appSessionId }),
                    usaintService.callTuitionApi({ appSessionId }),
                    usaintService.callTuitionNoticeApi({ appSessionId }),
                    usaintService.callTimetableApi({ appSessionId }),
                    usaintService.callGraduationApi({ appSessionId }),
                    usaintService.callCategoryGrade({ appSessionId }),
                    usaintService.callSemesterGradeApi({ appSessionId }),
                    usaintService.callSemesterGradeOldVersionApi({ appSessionId }),
                    usaintService.callChapelApi({ appSessionId }),
                    usaintService.callScholarshipApi({ appSessionId }),
                ];
                const apiNames: string[] = [
                    'Student Info',
                    'Tuition History',
                    'Tuition Notice',
                    'Timetable',
                    'Graduation Audit',
                    'Category Grade',
                    'Semester Grade',
                    'Semester Grade (Old)',
                    'Chapel Attendance',
                    'Scholarship',
                ];

                const results = await Promise.allSettled(fetchTasks);

                if (isManualRefresh && studentInfo?.studentId) {
                    const admissionYear = studentInfo.admissionDate.substring(0, 4);
                    const graduatedYear = studentInfo.degreeConferralDate?.substring(0, 4);
                    setIsFetchingGradeDetail(true);
                    usaintService
                        .callSubjectGradeDetailApi({ appSessionId, admissionYear, graduatedYear })
                        .finally(() => setIsFetchingGradeDetail(false))
                        .catch((err) => console.error('Error refetching grade detail:', err));
                }

                let hasLoggedOut = false;
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        const error = result.reason;
                        const name = apiNames[index];

                        console.error(`Error fetching ${name}:`, error);

                        const isUnauthorized =
                            error?.status === 401 ||
                            error?.response?.status === 401 ||
                            error?.error === 'Session expired or invalid. Please login again.' ||
                            getErrorMessage(error).toLowerCase().includes('session expired') ||
                            getErrorMessage(error).toLowerCase().includes('login again');

                        if (isUnauthorized) {
                            if (!hasLoggedOut) {
                                logout();
                                hasLoggedOut = true;
                            }
                            return;
                        }

                        showToast({
                            title: `${name} Failed`,
                            message: getErrorMessage(error, `Failed to fetch ${name}`),
                            type: 'error',
                        });
                    }
                });

                if (isManualRefresh) {
                    showToast({
                        title: 'Sync Complete',
                        message: 'All data has been updated successfully.',
                        type: 'success',
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [
            appSessionId,
            isAuthenticated,
            studentInfo,
            tuitionInfo,
            tuitionNotice,
            timetableInfo,
            graduationInfo,
            chapelInfo,
            categoryGrade,
            semesterGrade,
            scholarshipInfo,
            subjectGradeDetail,
            setIsFetchingGradeDetail,
            logout,
            showToast,
        ],
    );

    useEffect(() => {
        if (!initialFetchDone.current && isHydrated && isAuthenticated && appSessionId) {
            fetchUsaintData();
            initialFetchDone.current = true;
        }
    }, [isHydrated, isAuthenticated, appSessionId, fetchUsaintData]);

    return (
        <div>
            <header className="flex items-center flex-wrap justify-between gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <Link href="/" className="w-fit">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity">
                            SSU Information in one page
                        </h1>
                    </Link>
                    <p className="text-zinc-500 dark:text-zinc-400"> Manage your academic information in one place.</p>
                </div>

                <div className="flex gap-4 items-center">
                    {isFetchingGradeDetail && (
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
                            Fetching grade details...
                        </span>
                    )}
                    <button
                        onClick={() => fetchUsaintData(true)}
                        disabled={isRefreshing || isLoading}
                        className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white dark:bg-zinc-950 px-4 text-sm font-black text-zinc-900 dark:text-zinc-50 transition-all hover:bg-accent disabled:opacity-50"
                    >
                        <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                        <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                    <button
                        onClick={handleCapture}
                        disabled={isCapturing}
                        className="flex h-10 items-center justify-center rounded-xl border border-border bg-white dark:bg-zinc-950 px-3 text-sm font-black text-zinc-900 dark:text-zinc-50 transition-all hover:bg-accent disabled:opacity-50"
                        title="Capture Screenshot"
                    >
                        <Camera className={cn('h-4 w-4', isCapturing && 'animate-spin')} />
                    </button>
                    {/* <div className="relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex h-10 items-center justify-center rounded-xl border border-border bg-white dark:bg-zinc-950 px-3 text-sm font-black text-zinc-900 dark:text-zinc-50 transition-all hover:bg-accent"
                            title="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                        {showSettings && (
                            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-white dark:bg-zinc-950 p-3 shadow-lg z-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Blur Effect
                                    </span>
                                    <Switch checked={blurEffect} onCheckedChange={setBlurEffect} />
                                </div>
                                <p className="mt-1 text-xs text-zinc-400">Liquid glass effect for cards</p>
                            </div>
                        )}
                    </div> */}
                </div>
            </header>

            {!isHydrated ? (
                <DashboardSkeleton />
            ) : isAuthenticated ? (
                isLoading ? (
                    <DashboardSkeleton />
                ) : (
                    <div
                        ref={captureRef}
                        className={cn(
                            'flex flex-col gap-6',
                            blurEffect &&
                                '[&>div]:[&>div>div]:backdrop-blur-md [&>div]:[&>div>div]:bg-white/70 [&>div]:[&>div>div]:dark:bg-zinc-950/70 [&>div]:[&>div>div]:border-white/20 [&>div]:[&>div>div]:dark:border-white/10',
                        )}
                    >
                        <div className="flex gap-6  flex-col lg:flex-row">
                            <div className="flex flex-col gap-6 lg:max-w-100">
                                {studentInfo && <StudentInfoCard data={studentInfo} />}
                                <ChapelCard data={chapelInfo} studentId={studentInfo?.studentId} />
                            </div>
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
                                    <TuitionCard data={tuitionInfo} noticeData={tuitionNotice ?? undefined} />
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

            <footer className="mt-12 py-6 text-center">
                <a
                    href="https://github.com/dt313/ssu-dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                    <Github className="h-4 w-4" />
                    GitHub
                </a>
            </footer>
        </div>
    );
}
