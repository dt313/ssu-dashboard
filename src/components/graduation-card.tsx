'use client';

import { useState } from 'react';

import { GraduationInfo } from '@/types/api';
import { BookOpen, Search, X } from 'lucide-react';

import { cn } from '@/utils';

import { DialogClose, DialogDescription, DialogTitle, DialogWrapper } from './ui/dialog';

interface GraduationCardProps {
    data: GraduationInfo;
    className?: string;
}

type FilterStatus = 'all' | 'satisfied' | 'insufficient';

export function GraduationCard({ data, className }: GraduationCardProps) {
    const { graduationCredits, recognizedCredits, graduationResult, graduationAuditDate, categories } = data;
    const [filter, setFilter] = useState<FilterStatus>('all');

    const filteredCategories = categories.filter((cat) => {
        if (filter === 'all') return true;
        const isSatisfied =
            cat.result.includes('Pass') ||
            cat.result.includes('P') ||
            cat.result.includes('합격') ||
            cat.result.includes('충족');
        const isInsufficient = cat.result.includes('부족');

        if (filter === 'satisfied') return isSatisfied;
        if (filter === 'insufficient') return isInsufficient;
        return true;
    });

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Graduation Audit</h3>
                        <p className="text-xs text-zinc-500">Last updated: {graduationAuditDate}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Requirement</p>
                    <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">{graduationCredits}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Recognized</p>
                    <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">{recognizedCredits}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-4 dark:bg-primary/20">
                    <p className="text-xs font-medium text-primary uppercase">Result</p>
                    <p className="mt-1 text-lg font-bold text-primary">{graduationResult}</p>
                </div>
            </div>

            <div className="overflow-x-auto px-6 pb-6 pt-2">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900 text-xs text-zinc-500 uppercase">
                            <th className="pb-3 font-semibold">Domain</th>
                            <th className="pb-3 font-semibold">Requirement</th>
                            <th className="pb-3 font-semibold text-center">Req.</th>
                            <th className="pb-3 font-semibold text-center">Earned</th>
                            <th className="pb-3 text-right font-semibold min-w-[140px]">
                                <div className="flex items-center justify-end gap-2">
                                    <span>Result</span>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as FilterStatus)}
                                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-black outline-none transition-all hover:bg-white focus:ring-1 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                    >
                                        <option value="all">전체</option>
                                        <option value="satisfied">충족</option>
                                        <option value="insufficient">부족</option>
                                    </select>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {filteredCategories.map((cat, idx) => {
                            const isFirstInDomain = idx === 0 || cat.domain !== filteredCategories[idx - 1].domain;
                            const isSatisfied =
                                cat.result.includes('Pass') ||
                                cat.result.includes('P') ||
                                cat.result.includes('합격') ||
                                cat.result.includes('충족');
                            const isInsufficient = cat.result.includes('부족');
                            const hasSubjects = cat.subjects && cat.subjects.trim().length > 0;

                            return (
                                <tr
                                    key={idx}
                                    className={cn(
                                        'group transition-colors',
                                        isSatisfied ? 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10' : '',
                                        isInsufficient ? 'hover:bg-red-50/50 dark:hover:bg-red-900/10' : '',
                                    )}
                                >
                                    <td className="py-3 pr-2 text-zinc-500 text-[10px] font-bold align-top leading-tight w-[100px]">
                                        {isFirstInDomain ? cat.domain : ''}
                                    </td>
                                    <td className="py-3 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                                {cat.requirement}
                                            </span>
                                            {hasSubjects && (
                                                <DialogWrapper
                                                    trigger={
                                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary dark:hover:text-primary shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                                                            <Search className="h-3 w-3" />
                                                        </button>
                                                    }
                                                >
                                                    <div className="p-6">
                                                        <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                                                            <div>
                                                                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                                                    이수 과목 상세
                                                                </DialogTitle>
                                                                <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                                    {cat.requirement}
                                                                </DialogDescription>
                                                            </div>
                                                            <DialogClose asChild>
                                                                <button className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                                                                    <X className="h-5 w-5" />
                                                                </button>
                                                            </DialogClose>
                                                        </div>
                                                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                            <div className="space-y-2">
                                                                {cat.subjects.split(',').map((subject, sIdx) => (
                                                                    <div
                                                                        key={sIdx}
                                                                        className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30"
                                                                    >
                                                                        <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                                                            <BookOpen className="h-4 w-4 text-primary" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                                            {subject.trim()}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogWrapper>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 text-zinc-600 dark:text-zinc-400 text-center font-medium">
                                        {cat.referenceValue}
                                    </td>
                                    <td className="py-3 text-zinc-600 dark:text-zinc-400 text-center font-medium">
                                        {cat.calculatedValue}
                                    </td>
                                    <td className="py-3 text-right">
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                                                isSatisfied
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : isInsufficient
                                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                            )}
                                        >
                                            {cat.result}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredCategories.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">해당하는 항목이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
