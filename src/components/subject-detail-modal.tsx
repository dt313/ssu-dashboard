'use client';

import { SubjectGradeDetail } from '@/types/api';
import { X } from 'lucide-react';

import { cn } from '@/utils';

import { DialogClose, DialogDescription, DialogTitle, DialogWrapper } from './ui/dialog';

interface SubjectDetailModalProps {
    detail: SubjectGradeDetail | null;
    onOpenChange: (open: boolean) => void;
}

export function SubjectDetailModal({ detail, onOpenChange }: SubjectDetailModalProps) {
    if (!detail) return null;

    return (
        <DialogWrapper open={!!detail} onOpenChange={onOpenChange}>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div>
                        <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            {detail.data[0]?.[0] || '과목 상세'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {detail.data[0]?.[1]} • {detail.data[0]?.[2]} • {detail.data[0]?.[3]}학점
                        </DialogDescription>
                    </div>
                    <DialogClose asChild>
                        <button className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 cursor-pointer">
                            <X className="h-5 w-5" />
                        </button>
                    </DialogClose>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-black uppercase text-zinc-400 tracking-widest">
                                {detail.header.slice(4).map((h, idx) => (
                                    <th key={idx} className="pb-3 pr-4 last:pr-0 text-center">
                                        {h.replace(/\.000/, '')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {detail.data.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className={cn(
                                        'border-b border-zinc-50 dark:border-zinc-900',
                                        rowIdx % 2 === 0 ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : '',
                                    )}
                                >
                                    {row.slice(4).map((cell, cellIdx) => (
                                        <td key={cellIdx} className="py-3 pr-4 last:pr-0 text-center">
                                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">
                                                {cell}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DialogWrapper>
    );
}
