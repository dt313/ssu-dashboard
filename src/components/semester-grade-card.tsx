'use client';

import { SemesterGradeInfo } from '@/types/api';
import { Award, BarChart3, GraduationCap, TrendingUp } from 'lucide-react';

import { cn } from '@/utils';

interface SemesterGradeCardProps {
    data: SemesterGradeInfo;
    className?: string;
}

export function SemesterGradeCard({ data, className }: SemesterGradeCardProps) {
    const academicSummary = data.summary.academicRecord;
    const proofSummary = data.summary.proof;

    return (
        <div
            className={cn(
                'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-900/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <TrendingUp className="h-5.5 w-5.5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                            하기별 성적
                        </h3>
                        <p className="text-sm text-zinc-400 tracking-wider">Semester grades overview</p>
                    </div>
                </div>
            </div>

            {/* Total Summary Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-zinc-50/40 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">증명평점평균</span>
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                            {academicSummary.gpa}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                        학적부취득학점
                    </span>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                            {academicSummary.earnedCredits}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                        학적부산술평균
                    </span>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                            {academicSummary.arithmeticAverage}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 text-sm font-black uppercase text-zinc-400 tracking-widest">
                            <th className="py-4 pl-6 pr-2 text-center">학년-학기</th>
                            <th className="py-4 px-2 text-center">GPA</th>
                            <th className="py-4 px-2 text-center">취득학점</th>
                            <th className="py-4 px-2 text-center">학기별석차</th>
                            <th className="py-4 pr-6 pl-2 text-right">학사경고여부</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                        {data.grades.map((grade, idx) => {
                            const gpaValue = parseFloat(grade.gpa);
                            const isHighGpa = gpaValue >= 4.0;

                            return (
                                <tr
                                    key={`${grade.year}-${grade.semester}-${idx}`}
                                    className="group transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                                >
                                    <td className="py-4 pl-6 pr-2 text-center">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tabular-nums">
                                                {grade.year}- {grade.semester}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <span
                                            className={cn(
                                                'inline-flex rounded-lg px-2 py-1 text-sm font-black tabular-nums border',
                                                isHighGpa
                                                    ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/20 shadow-sm shadow-amber-500/5'
                                                    : 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
                                            )}
                                        >
                                            {grade.gpa}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 tabular-nums">
                                            {grade.earnedCredits}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                                {grade.semesterRank}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-400 tabular-nums">
                                                Total: {grade.totalRank}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 pl-2 text-right">
                                        {grade.academicWarning && grade.academicWarning.trim() ? (
                                            <span className="inline-flex rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-black text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-900/20">
                                                WARNING
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700">
                                                -
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
