'use client';

import { cn } from '@/utils';

function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            {children}
        </div>
    );
}

function SkeletonLine({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800', className)} />;
}

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {/* First Row: StudentInfo + Chapel | Timetable */}
            <div className="flex gap-6 flex-col lg:flex-row">
                <div className="flex flex-col gap-6 lg:max-w-100">
                    {/* Student Info Skeleton */}
                    <SkeletonCard className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <div className="flex-1 space-y-3">
                                <SkeletonLine className="h-6 w-32" />
                                <SkeletonLine className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <SkeletonLine className="h-4 w-20" />
                                    <SkeletonLine className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>

                    {/* Chapel Card Skeleton */}
                    <SkeletonCard className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                                <SkeletonLine className="h-5 w-24" />
                            </div>
                            <div className="flex justify-between items-center">
                                <SkeletonLine className="h-8 w-16" />
                                <SkeletonLine className="h-8 w-16" />
                                <SkeletonLine className="h-8 w-16" />
                            </div>
                        </div>
                    </SkeletonCard>
                </div>

                {/* Timetable Skeleton */}
                <div className="flex-1 lg:min-w-150">
                    <SkeletonCard className="p-6 h-full min-h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                            <SkeletonLine className="h-5 w-28" />
                        </div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-2">
                                    <SkeletonLine className="h-16 flex-1" />
                                    <SkeletonLine className="h-16 flex-1" />
                                    <SkeletonLine className="h-16 flex-1" />
                                    <SkeletonLine className="h-16 flex-1" />
                                    <SkeletonLine className="h-16 flex-1" />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>
                </div>
            </div>

            {/* Second Row: Graduation | Tuition */}
            <div className="flex gap-6 flex-col lg:flex-row">
                <div className="flex-1 lg:min-w-150">
                    <SkeletonCard className="p-6 min-h-[200px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                            <SkeletonLine className="h-5 w-32" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <SkeletonLine className="h-3 w-16" />
                                    <SkeletonLine className="h-6 w-12" />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>
                </div>

                <div className="gap-6 w-full flex-1 flex flex-col">
                    <SkeletonCard className="p-6 min-h-[200px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                            <SkeletonLine className="h-5 w-24" />
                        </div>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <SkeletonLine className="h-4 w-20" />
                                    <SkeletonLine className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>
                </div>
            </div>

            {/* Category Grade Skeleton */}
            <SkeletonCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                        <SkeletonLine className="h-5 w-28" />
                    </div>
                    <div className="flex gap-2">
                        <SkeletonLine className="h-8 w-24 rounded-full" />
                        <SkeletonLine className="h-8 w-24 rounded-full" />
                        <SkeletonLine className="h-8 w-24 rounded-full" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                        <SkeletonLine className="h-4 flex-1" />
                        <SkeletonLine className="h-4 w-16" />
                        <SkeletonLine className="h-4 w-20" />
                        <SkeletonLine className="h-4 w-12" />
                        <SkeletonLine className="h-4 w-12" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <SkeletonLine className="h-12 flex-1" />
                            <SkeletonLine className="h-12 w-16" />
                            <SkeletonLine className="h-12 w-20" />
                            <SkeletonLine className="h-12 w-12" />
                            <SkeletonLine className="h-12 w-12" />
                        </div>
                    ))}
                </div>
            </SkeletonCard>

            {/* Third Row: Semester Grade | Scholarship */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                <div className="flex-1">
                    <SkeletonCard className="p-6 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                                <SkeletonLine className="h-5 w-24" />
                            </div>
                            <SkeletonLine className="h-8 w-32 rounded-full" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <SkeletonLine className="h-3 w-16" />
                                    <SkeletonLine className="h-7 w-12" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <SkeletonLine key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    </SkeletonCard>
                </div>

                <div className="flex-1">
                    <SkeletonCard className="p-6 min-h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                            <SkeletonLine className="h-5 w-24" />
                        </div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50"
                                >
                                    <SkeletonLine className="h-4 w-24" />
                                    <SkeletonLine className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>
                </div>
            </div>
        </div>
    );
}
