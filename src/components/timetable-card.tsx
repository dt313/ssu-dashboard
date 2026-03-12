'use client';

import { useMemo } from 'react';

import { BookOpen, Clock, MapPin } from 'lucide-react';

import { cn } from '@/utils/cn';
import { parseTimetableCell } from '@/utils/usaint-parser';

interface TimetableCardProps {
    data: string[][] | null;
    className?: string;
}

const colorPalettes = [
    {
        bg: 'bg-blue-50/50 dark:bg-blue-900/20',
        border: 'border-blue-100 dark:border-blue-800/50',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'text-blue-500',
    },
    {
        bg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
        border: 'border-indigo-100 dark:border-indigo-800/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        icon: 'text-indigo-500',
    },
    {
        bg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
        border: 'border-emerald-100 dark:border-emerald-800/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: 'text-emerald-500',
    },
    {
        bg: 'bg-amber-50/50 dark:bg-amber-900/20',
        border: 'border-amber-100 dark:border-amber-800/50',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-500',
    },
    {
        bg: 'bg-rose-50/50 dark:bg-rose-900/20',
        border: 'border-rose-100 dark:border-rose-800/50',
        text: 'text-rose-700 dark:text-rose-300',
        icon: 'text-rose-500',
    },
    {
        bg: 'bg-violet-50/50 dark:bg-violet-900/20',
        border: 'border-violet-100 dark:border-violet-800/50',
        text: 'text-violet-700 dark:text-violet-300',
        icon: 'text-violet-500',
    },
    {
        bg: 'bg-cyan-50/50 dark:bg-cyan-900/20',
        border: 'border-cyan-100 dark:border-cyan-800/50',
        text: 'text-cyan-700 dark:text-cyan-300',
        icon: 'text-cyan-500',
    },
    {
        bg: 'bg-orange-50/50 dark:bg-orange-900/20',
        border: 'border-orange-100 dark:border-orange-800/50',
        text: 'text-orange-700 dark:text-orange-300',
        icon: 'text-orange-500',
    },
];

interface TimetableContentProps {
    data: string[][] | null;
    subjectColorMap: Map<string, (typeof colorPalettes)[0]>;
}

function TimetableContent({ data, subjectColorMap }: TimetableContentProps) {
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
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[12px] sm:text-xs table-fixed min-w-[600px] border-separate border-spacing-y-0">
                <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900">
                        {headers.map((header, idx) => (
                            <th
                                key={idx}
                                className={cn(
                                    'pb-3 font-black text-zinc-400 uppercase tracking-widest',
                                    idx === 0 ? 'w-[70px]' : '',
                                )}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {rows.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className="group transition-all duration-300 ease-in-out hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20"
                        >
                            {row.map((cell, cellIdx) => {
                                const parsed = parseTimetableCell(cell);
                                const palette = parsed ? subjectColorMap.get(parsed.subject) : null;

                                return (
                                    <td
                                        key={cellIdx}
                                        className="py-3 pr-2 text-zinc-900 dark:text-zinc-50 break-words align-top relative border-b border-zinc-100 dark:border-zinc-900"
                                    >
                                        {cellIdx === 0 ? (
                                            <span className="font-black text-zinc-400 dark:text-zinc-500 text-[11px] tabular-nums whitespace-nowrap transition-colors duration-300 group-hover:text-zinc-500 dark:group-hover:text-zinc-400">
                                                {cell.match(/\d{2}:\d{2}-\d{2}:\d{2}/)?.[0] || cell}
                                            </span>
                                        ) : parsed && palette ? (
                                            <div className="relative min-h-[70px] w-full">
                                                <div
                                                    className={cn(
                                                        'group/subject absolute inset-x-0 top-0 flex flex-col gap-1.5 rounded-xl border p-2.5 transition-all duration-300 ease-in-out z-0 hover:z-50 hover:shadow-xl hover:bg-white dark:hover:bg-zinc-900 hover:-translate-y-1',
                                                        palette.bg,
                                                        palette.border,
                                                    )}
                                                >
                                                    <div className="flex items-start gap-1.5">
                                                        <BookOpen
                                                            className={cn('mt-0.5 h-3 w-3 shrink-0', palette.icon)}
                                                        />
                                                        <span
                                                            className={cn(
                                                                'font-black text-[11px] leading-tight line-clamp-2 group-hover/subject:line-clamp-none transition-all duration-300',
                                                                palette.text,
                                                            )}
                                                        >
                                                            {parsed.subject}
                                                        </span>
                                                    </div>
                                                    {parsed.location && (
                                                        <div className="flex items-start gap-1.5">
                                                            <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-zinc-400 dark:text-zinc-50" />
                                                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight line-clamp-1 group-hover/subject:line-clamp-none transition-all duration-300">
                                                                {parsed.location}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full min-h-[70px]" />
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Add some bottom padding to ensure absolute subjects in the last row aren't cut off when expanded */}
            <div className="h-20" />
        </div>
    );
}

export function TimetableCard({ data, className }: TimetableCardProps) {
    const subjectColorMap = useMemo(() => {
        if (!data) return new Map();
        const uniqueSubjects = new Set<string>();
        data.slice(1).forEach((row) => {
            row.slice(1).forEach((cell) => {
                const parsed = parseTimetableCell(cell);
                if (parsed?.subject) uniqueSubjects.add(parsed.subject);
            });
        });

        const map = new Map<string, (typeof colorPalettes)[0]>();
        Array.from(uniqueSubjects).forEach((subject, index) => {
            map.set(subject, colorPalettes[index % colorPalettes.length]);
        });
        return map;
    }, [data]);

    const nextClass = useMemo(() => {
        if (!data || data.length <= 1) return null;

        const now = new Date();
        const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        if (currentDay === 0) return null;

        const dayIdx = currentDay;
        const classesToday: { subject: string; time: string; location: string; startTimeMinutes: number }[] = [];

        data.slice(1).forEach((row) => {
            const cell = row[dayIdx];
            const parsed = parseTimetableCell(cell);
            if (parsed && parsed.time) {
                const startTimeStr = parsed.time.split('-')[0];
                const [h, m] = startTimeStr.split(':').map(Number);
                const startTimeMinutes = h * 60 + m;

                if (startTimeMinutes > currentMinutes) {
                    classesToday.push({ ...parsed, startTimeMinutes });
                }
            }
        });

        if (classesToday.length > 0) {
            classesToday.sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);
            const classInfo = classesToday[0];
            const palette = subjectColorMap.get(classInfo.subject);
            return { ...classInfo, palette };
        }

        return null;
    }, [data, subjectColorMap]);

    return (
        <div
            className={cn(
                'w-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex flex-col border-b border-zinc-100 p-5 dark:border-zinc-900/50 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Weekly Timetable</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your scheduled classes</p>
                    </div>
                </div>

                {nextClass && (
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2 border transition-all animate-in fade-in slide-in-from-right-2 duration-500',
                            nextClass.palette?.bg,
                            nextClass.palette?.border,
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-lg bg-white/50 dark:bg-black/20',
                                nextClass.palette?.text,
                            )}
                        >
                            <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={cn(
                                        'text-[10px] font-black uppercase tracking-widest leading-none opacity-70',
                                        nextClass.palette?.text,
                                    )}
                                >
                                    Next Class
                                </span>
                                {nextClass.location && (
                                    <div className="flex items-center gap-1 opacity-60">
                                        <MapPin className={cn('h-2.5 w-2.5', nextClass.palette?.text)} />
                                        <span
                                            className={cn('text-[9px] font-bold leading-none', nextClass.palette?.text)}
                                        >
                                            {nextClass.location}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn('text-xs font-black leading-none', nextClass.palette?.text)}>
                                    {nextClass.subject}
                                </span>
                                <span
                                    className={cn(
                                        'text-[10px] font-bold tabular-nums opacity-80',
                                        nextClass.palette?.text,
                                    )}
                                >
                                    {nextClass.time.split('-')[0]}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-hidden p-5">
                <TimetableContent data={data} subjectColorMap={subjectColorMap} />
            </div>
        </div>
    );
}
