'use client';

import { TuitionNotice } from '@/types/api';
import { X } from 'lucide-react';

import { DialogClose, DialogTitle, DialogWrapper } from '@/components/ui/dialog';

interface TuitionInstallmentsModalProps {
    data: TuitionNotice;

    trigger?: React.ReactNode;
}

export function TuitionInstallmentsModal({ data, trigger }: TuitionInstallmentsModalProps) {
    return (
        <DialogWrapper trigger={trigger ?? <div />}>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        분할 납부 상세 정보
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 cursor-pointer">
                            <X className="h-5 w-5" />
                        </button>
                    </DialogClose>
                </div>
                <div className="overflow-x-auto py-4">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                <th className="pb-3 pr-2">구분</th>
                                <th className="pb-3 px-2">1차</th>
                                <th className="pb-3 px-2">2차</th>
                                <th className="pb-3 px-2">3차</th>
                                <th className="pb-3 pl-2 text-right">4차</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            <tr className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td className="py-4 pr-2 font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                                    필수납부 (A)
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                    {data.mandatory?.[2] || '-'}
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                    {data.mandatory?.[3] || '-'}
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                    {data.mandatory?.[4] || '-'}
                                </td>
                                <td className="py-4 pl-2 text-right font-black text-zinc-900 dark:text-zinc-50">
                                    {data.mandatory?.[5] || '-'}
                                </td>
                            </tr>
                            <tr className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td className="py-4 pr-2 font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                                    선택포함 (B)
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                    {data.optional?.[2] || '-'}
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                    {data.optional?.[3] || '-'}
                                </td>
                                <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                    {data.optional?.[4] || '-'}
                                </td>
                                <td className="py-4 pl-2 text-right font-black text-zinc-900 dark:text-zinc-50">
                                    {data.optional?.[5] || '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </DialogWrapper>
    );
}
