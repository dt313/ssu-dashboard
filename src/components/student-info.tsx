'use client';

import React, { useState } from 'react';

import { StudentInfo } from '@/types/api';
import { Check, Copy } from 'lucide-react';

import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { cn } from '@/utils/cn';

interface StudentInfoProps {
    data: StudentInfo;
    className?: string;
}

export function StudentInfoCard({ data, className }: StudentInfoProps) {
    const { name, studentId, faculty, department, year, semester, englishName, avatar, admissionDate } = data;
    const [copied, setCopied] = useState(false);

    const initials = name?.slice(0, 2).toUpperCase() || 'ST';

    const handleCopy = () => {
        const info = `
                Name: ${name}
                Student ID: ${studentId}
                Faculty: ${faculty}
                Department: ${department}
                Term: ${year}학년 ${semester}학기
                English Name: ${englishName}
                Admission Date: ${admissionDate}
                        `.trim();

        navigator.clipboard.writeText(info).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div
            className={cn(
                'group relative w-full flex flex-col py-2 pb-4 bg-white rounded-2xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md',
                className,
            )}
        >
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex items-center justify-between p-4 px-8">
                <Avatar
                    className="relative h-24 w-24 mr-4 border-2 border-white dark:border-zinc-900 shadow-sm md:h-32 md:w-32"
                    size={60}
                    fallback={initials}
                    src={avatar}
                />
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {name}님, 환영합니다
                </h2>
            </div>

            <div className="flex items-center justify-between p-2 px-8">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">학년/학기</span>
                <p className="text-sm font-semibold text-primary tracking-tight">
                    {year}학년 {semester}학기
                </p>
            </div>

            {data.englishName && (
                <div className="flex items-center justify-between p-2 px-8">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">영어 이름</span>
                    <p className="text-sm font-semibold text-primary tracking-tight">{englishName}</p>
                </div>
            )}

            <div className="flex items-center justify-between p-2 px-8">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">학번</span>
                <p className="text-sm font-semibold text-primary tracking-tight">{studentId}</p>
            </div>

            <div className="flex items-center justify-between p-2 px-8">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">대학(원)</span>
                <p className="text-sm font-semibold text-primary tracking-tight">{faculty}</p>
            </div>

            <div className="flex items-center justify-between p-2 px-8">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">소속</span>
                <p className="text-sm font-semibold text-primary tracking-tight">{department}</p>
            </div>

            <div className="flex items-center justify-between p-2 px-8">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">입학일자</span>
                <p className="text-sm font-semibold font-medium text-primary tracking-tight">{admissionDate}</p>
            </div>
        </div>
    );
}
