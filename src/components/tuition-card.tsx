'use client';

import { useState } from 'react';

import { useToastStore } from '@/store/use-toast-store';
import { TuitionInfo, TuitionNotice } from '@/types/api';
import { Calendar, Check, ChevronRight, Copy, CreditCard, Landmark } from 'lucide-react';

import { cn } from '@/utils/cn';

import { TuitionInstallmentsModal } from './tuition-installments-modal';

interface TuitionCardProps {
    data: TuitionInfo[];
    noticeData?: TuitionNotice;
    className?: string;
}

export function TuitionCard({ data, noticeData, className }: TuitionCardProps) {
    const showToast = useToastStore((s) => s.show);
    const [isCopied, setIsCopied] = useState(false);

    const parseCurrency = (value: string) => {
        return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    };

    const handleCopy = (text: string) => {
        if (isCopied) return;

        navigator.clipboard.writeText(text);
        setIsCopied(true);

        showToast({
            title: '복사 완료',
            message: '계좌번호가 클립보드에 복사되었습니다.',
            type: 'success',
        });

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    const latest = data.length > 0 ? data[data.length - 1] : null;

    let percentage = 0;
    let netPaid = 0;
    let baselineTotal = 0;
    let rawAmount = 0;
    let scholarship = 0;

    if (latest) {
        rawAmount = parseCurrency(latest.amount);
        scholarship = parseCurrency(latest.scholarship);
        netPaid = parseCurrency(latest.netAmount);

        // Latest Total = Amount - Scholarship
        baselineTotal = rawAmount - scholarship;

        percentage = baselineTotal > 0 ? (netPaid / baselineTotal) * 100 : 0;
    }

    // SVG Circle properties
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div
            className={cn(
                'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            {/* Header */}
            <div className="flex flex-col border-b border-zinc-100 p-5 dark:border-zinc-900/50 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-indigo-900/20 dark:text-emerald-400">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">등록금 정보</h3>
                            {noticeData && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-widest">
                                    고지서 확인됨
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">등록금 및 납부 내역</p>
                    </div>
                </div>
            </div>

            {/* Main Stats Section */}
            <div className="flex flex-col md:flex-row p-6 gap-8 items-center border-b border-zinc-100 dark:border-zinc-900">
                {latest && (
                    <>
                        <div className="relative flex items-center justify-center">
                            <svg className="h-32 w-32 -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="transparent"
                                    className="text-zinc-100 dark:text-zinc-800"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                                    {Math.round(percentage)}%
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                    납부 완료
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 shadow-sm">
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                                    최종 실납부액
                                </p>
                                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none mb-2 tabular-nums">
                                    ₩{baselineTotal.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-zinc-500 font-bold tabular-nums">
                                    {latest.amount} - {latest.scholarship}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-primary/5 p-5 dark:bg-primary/10 border border-primary/10 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 shadow-sm">
                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
                                    학년/학기
                                </p>
                                <p className="text-2xl font-black text-primary leading-none tabular-nums">
                                    {latest.year} - {latest.semester}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Notice Cards (Integrated if exists) */}
            {noticeData && noticeData.bankNumber && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900">
                    {/* Bank Info Card */}
                    <div className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-indigo-900/30 dark:bg-zinc-950 dark:hover:border-indigo-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <div className="rounded-lg bg-indigo-50 p-1.5 dark:bg-indigo-900/50">
                                    <Landmark className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">가상계좌 정보</span>
                            </div>
                            <button
                                onClick={() => handleCopy(noticeData.bankNumber)}
                                className={cn(
                                    'flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all shadow-sm cursor-pointer',
                                    isCopied
                                        ? 'bg-emerald-500 text-white dark:bg-emerald-600 shadow-emerald-200'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900',
                                )}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        복사됨
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        복사
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                {noticeData.bankBrand}{' '}
                                <span className="text-indigo-600 dark:text-indigo-400">{noticeData.bankNumber}</span>
                            </p>
                            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                예금주: {noticeData.bankAccountName}
                            </p>
                        </div>
                    </div>

                    {/* Payment Period Card */}
                    <div className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 transition-all hover:border-amber-200 hover:shadow-sm dark:border-amber-900/30 dark:bg-zinc-950 dark:hover:border-indigo-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <div className="rounded-lg bg-amber-50 p-1.5 dark:bg-amber-900/50">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">납부 기간</span>
                            </div>
                            {noticeData.optional && noticeData.optional.length > 0 && (
                                <TuitionInstallmentsModal
                                    data={noticeData}
                                    trigger={
                                        <button className="flex items-center gap-1 rounded-lg bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">
                                            분할 납부 상세
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    }
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                                        정기
                                    </span>
                                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                        {noticeData.bankTime}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-50 uppercase">
                                        추가
                                    </span>
                                    <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 tabular-nums">
                                        {noticeData.additionalTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Past Records */}
            <div className="flex-1 overflow-x-auto p-6">
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">과거 납부 내역</p>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900 text-xs md:text-sm font-black uppercase text-zinc-400 tracking-widest">
                            <th className="pb-3 pr-2 font-black">학기</th>
                            <th className="pb-3 px-2 font-black text-center">등록금액</th>
                            <th className="pb-3 px-2 font-black text-center">장학금액</th>
                            <th className="pb-3 pl-2 text-right font-black">실납부액</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {[...data].reverse().map((item, idx) => (
                            <tr
                                key={`${item.year}-${item.semester}-${idx}`}
                                className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                            >
                                <td className="py-4 pr-2 font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap text-sm">
                                    {item.year} - {item.semester}
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-bold text-center tabular-nums text-sm">
                                    {item.amount}
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-bold text-center tabular-nums text-sm">
                                    {item.scholarship}
                                </td>
                                <td className="py-4 pl-2 text-right font-black text-zinc-900 dark:text-zinc-50 tabular-nums text-sm">
                                    {item.netAmount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
