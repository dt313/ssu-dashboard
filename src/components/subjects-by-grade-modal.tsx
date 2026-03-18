'use client';

import { GradeSubject } from '@/types/api';
import { X } from 'lucide-react';

import { DialogClose, DialogDescription, DialogTitle, DialogWrapper } from './ui/dialog';

interface SubjectsByGradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grade: string;
    subjects: GradeSubject[];
}

export function SubjectsByGradeModal({ open, onOpenChange, grade, subjects }: SubjectsByGradeModalProps) {
    return (
        <DialogWrapper open={open} onOpenChange={onOpenChange}>
            <div className="p-6 relative">
                <DialogTitle className="text-xl font-black mb-1">
                    Subjects with Grade <span className="text-primary">{grade}</span>
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500 mb-4">
                    Showing {subjects.length} course{subjects.length > 1 ? 's' : ''}.
                </DialogDescription>

                <DialogClose className="absolute top-4 right-4 rounded-full p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5 text-zinc-500" />
                </DialogClose>

                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <ul className="space-y-3">
                        {subjects.map((subject, index) => (
                            <li
                                key={`${subject.code}-${index}`}
                                className="flex gap-4 justify-between items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                                        {subject.name}
                                    </span>
                                    <span className="text-xs text-zinc-500">{subject.code}</span>
                                </div>
                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                    {subject.credit} 학점
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </DialogWrapper>
    );
}
