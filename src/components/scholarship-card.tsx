'use client';

import { useState } from 'react';

import { ScholarshipInfo } from '@/types/api';
import { Award, Info } from 'lucide-react';

import { cn } from '@/utils/cn';

interface ScholarshipCardProps {
    data: ScholarshipInfo[];
    className?: string;
}

export function ScholarshipCard({ data, className }: ScholarshipCardProps) {
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

    const totalAmount = data.reduce((sum, item) => {
        const amount = parseInt(item.amount.replace(/[^0-9]/g, ''), 10) || 0;
        return sum + amount;
    }, 0);

    const isRejected = (status: string) => status.includes('탈락');

    return (
        <div
            className={cn(
                'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex flex-col border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">장학금 내역</h3>
                            {data.length > 0 && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-widest">
                                    {data.length}건
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Scholarship records</p>
                    </div>
                </div>
            </div>

            {data.length > 0 && (
                <div className="border-b border-zinc-100 bg-amber-50/50 p-6 dark:bg-amber-900/10">
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">
                        총 수혜 금액
                    </p>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                        ₩{totalAmount.toLocaleString()}
                    </p>
                </div>
            )}

            <div className="flex-1 overflow-x-auto p-6">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Award className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-3" />
                        <p className="text-sm font-bold text-zinc-400">장학금 내역이 없습니다</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-900 text-xs md:text-sm font-black uppercase text-zinc-400 tracking-widest">
                                <th className="pb-3 pr-2 font-black">학기</th>
                                <th className="pb-3 px-2 font-black">장학명</th>
                                <th className="pb-3 px-2 font-black text-center">구분</th>
                                <th className="pb-3 px-2 font-black text-center">금액</th>
                                <th className="pb-3 pl-2 text-right font-black">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {[...data].reverse().map((item, idx) => (
                                <tr
                                    key={`${item.year}-${item.semester}-${item.name}-${idx}`}
                                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                                >
                                    <td className="py-4 pr-2 font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap text-xs md:text-sm">
                                        {item.year}-{item.semester}
                                    </td>
                                    <td className="py-4 px-2 font-bold text-zinc-900 dark:text-zinc-50 text-xs md:text-sm max-w-[200px] truncate">
                                        {item.name}
                                    </td>
                                    <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-bold text-center tabular-nums text-xs md:text-sm">
                                        {item.type}
                                    </td>
                                    <td className="py-4 px-2 text-right font-black text-zinc-900 dark:text-zinc-50 tabular-nums text-xs md:text-sm">
                                        {item.amount}
                                    </td>
                                    <td className="py-4 pl-2 text-right relative">
                                        <div className="flex justify-end">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold cursor-pointer transition-colors',
                                                    isRejected(item.status)
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                        : item.status.includes('지급') || item.status.includes('완료')
                                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                          : item.status.includes('대기') || item.status.includes('진행')
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
                                                )}
                                                onMouseEnter={() => isRejected(item.status) && setTooltipIndex(idx)}
                                                onMouseLeave={() => setTooltipIndex(null)}
                                            >
                                                {item.status}
                                                {isRejected(item.status) && <Info className="h-3 w-3" />}
                                            </span>
                                        </div>
                                        {isRejected(item.status) && tooltipIndex === idx && item.rejectReason && (
                                            <div className="absolute right-0 bottom-full z-50 mb-2 w-56 animate-fade-in animate-zoom-in">
                                                <div className="relative rounded-xl bg-zinc-900 p-3.5 shadow-2xl ring-1 ring-white/10 dark:bg-zinc-800 dark:ring-white/20">
                                                    {/* Arrow */}
                                                    <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-zinc-900 dark:bg-zinc-800" />

                                                    <div className="flex items-start flex-col gap-2.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                                                                <Info className="h-3.5 w-3.5" />
                                                            </div>
                                                            <p className="text-xs font-black uppercase tracking-widest text-red-400">
                                                                탈락 사유
                                                            </p>
                                                        </div>

                                                        <p className="text-sm font-medium leading-relaxed text-zinc-200">
                                                            {item.rejectReason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}{' '}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
