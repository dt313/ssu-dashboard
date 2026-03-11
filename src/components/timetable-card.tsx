'use client';

import { BookOpen, Clock, MapPin, User } from 'lucide-react';

import { cn } from '@/utils/cn';

interface TimetableCardProps {
    data: string[][] | null;
    className?: string;
}

const parseCell = (text: string) => {
    if (!text || text.trim() === '') return null;

    // Regex to find time pattern (e.g., 09:00-10:15)
    const timeRegex = /(\d{2}:\d{2}-\d{2}:\d{2})/;
    const parts = text.split(timeRegex);

    if (parts.length >= 3) {
        return {
            subject: parts[0].trim(),
            time: parts[1].trim(),
            location: parts[2].trim(),
        };
    }

    return { subject: text, time: '', location: '' };
};

interface TimetableContentProps {
    data: string[][] | null;
}

function TimetableContent({ data }: TimetableContentProps) {
    if (!data || data.length <= 1) {
        return (
            <div className="flex h-full min-h-[200px] items-center justify-center p-8 text-center">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        No timetable records found for this term.
                    </p>
                    <p className="text-xs text-zinc-400">Your classes will appear here once registered.</p>
                </div>
            </div>
        );
    }

    const headers = data[0];
    const rows = data.slice(1);

    return (
        <table className="w-full text-left text-[12px] sm:text-xs table-fixed">
            <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    {headers.map((header, idx) => (
                        <th key={idx} className={cn('pb-2 font-semibold text-zinc-500', idx === 0 ? 'w-[70px]' : '')}>
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        {row.map((cell, cellIdx) => {
                            const parsed = parseCell(cell);
                            return (
                                <td
                                    key={cellIdx}
                                    className="py-2 pr-1.5 text-zinc-900 dark:text-zinc-50 break-words align-top"
                                >
                                    {cellIdx === 0 ? (
                                        <span className="font-bold text-zinc-400 dark:text-zinc-500 text-[12px]">
                                            {cell.match(/\d{2}:\d{2}-\d{2}:\d{2}/)?.[0] || cell}
                                        </span>
                                    ) : parsed ? (
                                        <div className="flex flex-col gap-1 rounded-lg bg-zinc-50/50 p-1.5 dark:bg-zinc-900/50">
                                            <div className="flex items-start gap-1">
                                                <BookOpen className="mt-0.5 h-2.5 w-2.5 shrink-0 text-blue-500" />
                                                <span className="font-bold text-[12px] leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                                    {parsed.subject}
                                                </span>
                                            </div>
                                            {parsed.location && (
                                                <div className="flex items-start gap-1">
                                                    <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-zinc-400" />
                                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-tight line-clamp-2">
                                                        {parsed.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        cell
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function TimetableCard({ data, className }: TimetableCardProps) {
    return (
        <div
            className={cn(
                'w-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex items-center gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800 shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Clock className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Weekly Timetable</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Your scheduled classes</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
                <TimetableContent data={data} />
            </div>
        </div>
    );
}
