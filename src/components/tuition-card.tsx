'use client';

import { TuitionInfo } from '@/types/api';

import { cn } from '@/utils/cn';

interface TuitionCardProps {
    data: TuitionInfo[];
    className?: string;
}

export function TuitionCard({ data, className }: TuitionCardProps) {
    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Tuition History</h3>
            </div>
            <div className="overflow-x-auto p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900">
                            <th className="pb-3 font-semibold text-zinc-500">Term</th>
                            <th className="pb-3 font-semibold text-zinc-500">Amount</th>
                            <th className="pb-3 font-semibold text-zinc-500">Scholarship</th>
                            <th className="pb-3 text-right font-semibold text-zinc-500">Net</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {data.reverse().map((item, idx) => (
                            <tr key={`${item.year}-${item.semester}-${idx}`}>
                                <td className="py-4 font-medium text-zinc-900 dark:text-zinc-50">
                                    {item.year} - {item.semester}
                                </td>
                                <td className="py-4 text-zinc-600 dark:text-zinc-400">{item.amount}</td>
                                <td className="py-4 text-zinc-600 dark:text-zinc-400">{item.scholarship}</td>
                                <td className="py-4 text-right font-semibold text-zinc-900 dark:text-zinc-50">
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
