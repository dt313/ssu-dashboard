'use client';

import { StudentInfo } from '@/types/api';

import Avatar from '@/components/ui/avatar';

import { cn } from '@/utils/cn';

interface StudentInfoProps {
    data: StudentInfo;
    className?: string;
}

export function StudentInfoCard({ data, className }: StudentInfoProps) {
    const { name, studentId, faculty, department, year, semester, englishName, avatar } = data;

    const initials = name?.slice(0, 2).toUpperCase() || 'ST';

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80',
                className,
            )}
        >
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                    <Avatar
                        className="relative h-24 w-24 border-2 border-white dark:border-zinc-900 shadow-sm md:h-32 md:w-32"
                        size={128}
                        fallback={initials}
                        src={avatar}
                    />
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col gap-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
                                    {name}
                                </h2>
                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    Student
                                </span>
                            </div>
                            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                                {englishName} • {studentId}
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-1 sm:items-end">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                Current Term
                            </span>
                            <div className="text-xl font-black text-primary dark:text-primary">
                                {year}학년 {semester}학기
                            </div>
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:grid-cols-2">
                        <div className="relative overflow-hidden rounded-xl bg-zinc-50/50 p-4 dark:bg-zinc-900/50">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Faculty
                            </p>
                            <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">{faculty}</p>
                        </div>
                        <div className="relative overflow-hidden rounded-xl bg-zinc-50/50 p-4 dark:bg-zinc-900/50">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Department
                            </p>
                            <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">{department}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
