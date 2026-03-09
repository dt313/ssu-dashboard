'use client';

import { ChapelInfo } from '@/types/api';
import { cn } from '@/utils/cn';
import { Calendar, AlertCircle } from 'lucide-react';

interface ChapelCardProps {
    data: ChapelInfo[];
    className?: string;
}

export function ChapelCard({ data, className }: ChapelCardProps) {
    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-900/50">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Chapel Attendance</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Detailed semester records</p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900/50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Section</th>
                            <th className="px-6 py-4">Professor</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4 text-center">Seat</th>
                            <th className="px-6 py-4 text-center">Absences</th>
                            <th className="px-6 py-4 text-center">Result</th>
                            <th className="px-6 py-4">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
                        {data.map((item, idx) => (
                            <tr 
                                key={`${item.section}-${idx}`}
                                className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                            >
                                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">
                                    {item.subjectName}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {item.section}
                                </td>
                                <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                                    {item.professor}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {item.location}
                                </td>
                                <td className="px-6 py-4 text-center text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                                    {item.seatNumber} <span className="text-zinc-300 dark:text-zinc-600 ml-1">(F{item.floor})</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                                        parseInt(item.absentAttendance) > 2 
                                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                            : parseInt(item.absentAttendance) > 0
                                            ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                    )}>
                                        <AlertCircle className="h-3 w-3" />
                                        {item.absentAttendance}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase',
                                            item.result === '이수' || item.result === 'P'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : item.result === '진행중'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                        )}
                                    >
                                        {item.result}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-zinc-400 italic">
                                    {item.remarks || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="border-t border-zinc-100 bg-zinc-50/30 px-6 py-3 dark:border-zinc-900/50 dark:bg-zinc-900/20">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    * Records are updated periodically. Absence limit may apply for passing (P) grade.
                </p>
            </div>
        </div>
    );
}
