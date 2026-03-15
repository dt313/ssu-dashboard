'use client';

import { useEffect, useState } from 'react';

import { AppLayout } from '@/app/app-layout';
import { useAuthStore } from '@/store/use-auth-store';
import { useToastStore } from '@/store/use-toast-store';
import { useUsaintStore } from '@/store/use-usaint-store';
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
    } = useUsaintStore();
    const [isLoading, setIsLoading] = useState(false);
    const showToast = useToastStore((s) => s.show);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isHydrated, router]);

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
        <AppLayout
            title="SSU Dashboard"
            subtitle="Manage your academic information in one place."
            showBackgroundSelector
        >
            {!isHydrated ? (
                <DashboardSkeleton />
            ) : isAuthenticated ? (
                isLoading ? (
                    <DashboardSkeleton />
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
        </AppLayout>
    );
}
