'use client';

import { useState } from 'react';

import { ChapelAttendance } from '@/types/api';
import { Bookmark, CheckCircle2, Info, LayoutGrid, MapPin, Tag, User, X, XCircle } from 'lucide-react';

import { cn } from '@/utils/cn';

import { DialogClose, DialogDescription, DialogTitle, DialogWrapper } from './ui/dialog';

interface ChapelAttendanceModalProps {
    attendanceDetails: ChapelAttendance[];
    totalAttendance: number;
    attendedAttendance: number;
    absentAttendance: number;
}

export function ChapelAttendanceModal({
    attendanceDetails,
    totalAttendance,
    attendedAttendance,
    absentAttendance,
}: ChapelAttendanceModalProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    const selectedDetail = selectedIndex !== null ? attendanceDetails[selectedIndex] : null;

    return (
        <DialogWrapper
            trigger={
                <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>출결 현황</span>
                </button>
            }
        >
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div>
                        <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            출결 현황 상세
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            Click a session to see details
                        </DialogDescription>
                    </div>
                    <DialogClose asChild>
                        <button className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 cursor-pointer">
                            <X className="h-5 w-5" />
                        </button>
                    </DialogClose>
                </div>

                {/* Grid of sessions */}
                <div className="flex flex-wrap gap-2.5">
                    {attendanceDetails.map((detail, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                'relative flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-90',
                                selectedIndex === idx
                                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-md'
                                    : '',
                                detail.status === '출석'
                                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : detail.status === '결석'
                                      ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400'
                                      : 'border-zinc-100 bg-zinc-100/50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-500',
                            )}
                        >
                            <span className="text-[10px] leading-tight opacity-60">{idx + 1}</span>
                            {detail.status === '출석' ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : detail.status === '결석' ? (
                                <XCircle className="h-4 w-4" />
                            ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-current opacity-20" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Details Panel */}
                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {selectedDetail ? (
                        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
                                        #{selectedIndex! + 1}
                                    </span>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                        {selectedDetail.date}
                                    </h4>
                                </div>
                                <span
                                    className={cn(
                                        'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm',
                                        selectedDetail.status === '출석'
                                            ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                                            : 'bg-red-500 text-white dark:bg-red-600',
                                    )}
                                >
                                    {selectedDetail.status || '미정'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {selectedDetail.title && (
                                    <div className="flex items-start gap-3">
                                        <Bookmark className="mt-0.5 h-4 w-4 text-indigo-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                주제 / 제목
                                            </span>
                                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                                {selectedDetail.title}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <User className="mt-0.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                강사
                                            </span>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {selectedDetail.lecturer || '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Tag className="mt-0.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                구분
                                            </span>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {selectedDetail.type || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                소속
                                            </span>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                                                {selectedDetail.department || '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                평가
                                            </span>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {selectedDetail.evaluation || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedDetail.remarks && (
                                    <div className="flex items-start gap-3 border-t border-zinc-200/50 pt-4 dark:border-zinc-800/50">
                                        <Info className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                비고
                                            </span>
                                            <span className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-snug">
                                                {selectedDetail.remarks}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                            <p className="text-sm text-zinc-400 dark:text-zinc-500">Select a session to view details</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                            총 강의
                        </p>
                        <p className="text-base font-black text-zinc-900 dark:text-zinc-50">{totalAttendance}</p>
                    </div>
                    <div className="text-center border-x border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">출석</p>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            {attendedAttendance}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">결석</p>
                        <p className="text-base font-black text-red-600 dark:text-red-400">{absentAttendance}</p>
                    </div>
                </div>
            </div>
        </DialogWrapper>
    );
}
