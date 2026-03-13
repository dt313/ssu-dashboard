'use client';

import { useMemo, useState } from 'react';

import { CategoryGradeInfo, GradeSubject } from '@/types/api';
import { Check, ChevronDown, ClipboardCheck, Filter, ListFilter, Search, X } from 'lucide-react';

import { cn } from '@/utils';

interface CategoryGradeCardProps {
    data: CategoryGradeInfo;
    className?: string;
}

export function CategoryGradeCard({ data, className }: CategoryGradeCardProps) {
    const semesters = useMemo(() => {
        return ['All Semesters', ...Object.keys(data.bySemester).sort((a, b) => b.localeCompare(a))];
    }, [data.bySemester]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(data.subjects.map((s) => s.category || 'Un-updated'));
        return [
            'All Categories',
            ...Array.from(uniqueCategories).sort((a, b) => {
                if (a === 'Un-updated') return 1;
                if (b === 'Un-updated') return -1;
                return a.localeCompare(b);
            }),
        ];
    }, [data.subjects]);

    const [selectedSemester, setSelectedSemester] = useState<string>('All Semesters');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredSubjects = useMemo(() => {
        return data.subjects
            .filter((subject) => {
                const semesterKey = `${subject.yearSemester.year}-${subject.yearSemester.semester}`;
                const matchesSemester = selectedSemester === 'All Semesters' || semesterKey === selectedSemester;

                const displayCategory = subject.category || 'Un-updated';
                const matchesCategory = selectedCategory === 'All Categories' || displayCategory === selectedCategory;

                const matchesSearch =
                    searchQuery === '' ||
                    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    subject.code.toLowerCase().includes(searchQuery.toLowerCase());

                return matchesSemester && matchesCategory && matchesSearch;
            })
            .sort((a, b) => {
                const semA = `${a.yearSemester.year}-${a.yearSemester.semester}`;
                const semB = `${b.yearSemester.year}-${b.yearSemester.semester}`;
                if (semA !== semB) return semB.localeCompare(semA);
                return a.name.localeCompare(b.name);
            });
    }, [data.subjects, selectedSemester, selectedCategory, searchQuery]);

    const stats = useMemo(() => {
        const totalCredits = filteredSubjects.reduce((acc, sub) => acc + sub.credit, 0);
        return {
            totalCredits,
            count: filteredSubjects.length,
        };
    }, [filteredSubjects]);

    const isFiltered =
        selectedSemester !== 'All Semesters' || selectedCategory !== 'All Categories' || searchQuery !== '';

    return (
        <div
            className={cn(
                'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-900/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        <ClipboardCheck className="h-5.5 w-5.5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                            Category Grades
                        </h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Academic Record</p>
                    </div>
                </div>
            </div>

            {/* Enhanced Filter Section */}
            <div className="flex flex-col gap-5 p-6 bg-zinc-50/40 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                        <Filter className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Filter by</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5 items-center">
                        {/* Semester Filter Pill */}
                        <div className="group relative">
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className={cn(
                                    'appearance-none rounded-full border px-4 py-1.5 text-xs font-black outline-none transition-all cursor-pointer pr-8 pl-4 shadow-sm',
                                    selectedSemester !== 'All Semesters'
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700',
                                )}
                            >
                                {semesters.map((sem) => (
                                    <option
                                        key={sem}
                                        value={sem}
                                        className="text-zinc-900 dark:text-zinc-100 font-medium"
                                    >
                                        {sem}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className={cn(
                                    'absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none transition-transform group-hover:translate-y-[-40%]',
                                    selectedSemester !== 'All Semesters' ? 'text-white' : 'text-zinc-400',
                                )}
                            />
                        </div>

                        {/* Category Filter Pill */}
                        <div className="group relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className={cn(
                                    'appearance-none rounded-full border px-4 py-1.5 text-xs font-black outline-none transition-all cursor-pointer pr-8 pl-4 shadow-sm',
                                    selectedCategory !== 'All Categories'
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700',
                                )}
                            >
                                {categories.map((cat) => (
                                    <option
                                        key={cat}
                                        value={cat}
                                        className="text-zinc-900 dark:text-zinc-100 font-medium"
                                    >
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className={cn(
                                    'absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none transition-transform group-hover:translate-y-[-40%]',
                                    selectedCategory !== 'All Categories' ? 'text-white' : 'text-zinc-400',
                                )}
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    'w-44 rounded-full border bg-white dark:bg-black py-1.5 pl-9 pr-4 text-xs font-black outline-none transition-all placeholder:text-zinc-400',
                                    searchQuery
                                        ? 'border-primary text-zinc-900 dark:text-zinc-100'
                                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700',
                                )}
                            />
                        </div>

                        {/* Reset Button */}
                        {isFiltered && (
                            <button
                                onClick={() => {
                                    setSelectedSemester('All Semesters');
                                    setSelectedCategory('All Categories');
                                    setSearchQuery('');
                                }}
                                className="flex items-center gap-1.5 rounded-full bg-zinc-200/50 hover:bg-zinc-200 px-3 py-1.5 text-[10px] font-black text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="h-3 w-3" />
                                RESET
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <span className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-tight">
                                Courses
                            </span>
                            <span className="text-xs md:text-sm font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                {stats.count}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-tight">
                                Total Credits
                            </span>
                            <span className="text-xs md:text-sm font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                {stats.totalCredits}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[500px]">
                <table className="w-full text-left text-sm relative">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 text-sm font-black uppercase text-zinc-400 tracking-widest">
                            <th className="py-4 pl-6 pr-2">과목명</th>
                            <th className="py-4 px-2 text-center">학년-학기</th>
                            <th className="py-4 px-2 text-center">Category</th>
                            <th className="py-4 px-2 text-center">과목학점</th>
                            <th className="py-4 pr-6 pl-2 text-right">등급</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                        {filteredSubjects.map((subject, idx) => {
                            const isHighGrade = ['A+', 'A0', 'A-'].includes(subject.grade);
                            const hasCategory = !!subject.category;

                            return (
                                <tr
                                    key={`${subject.code}-${idx}`}
                                    className="group transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                                >
                                    <td className="py-4 pl-6 pr-2">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-50 text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                {subject.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-zinc-400 tabular-nums bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                                                    {subject.code}
                                                </span>
                                                {subject.info && (
                                                    <span className="text-xs text-zinc-400 font-medium truncate">
                                                        {subject.info}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <span className="text-xs md:text-sm font-black text-zinc-500 dark:text-zinc-400 tabular-nums">
                                            {subject.yearSemester.year}-{subject.yearSemester.semester}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <span
                                            className={cn(
                                                'inline-flex rounded-md px-2 py-0.5 text-xs font-black whitespace-nowrap tracking-tight',
                                                hasCategory
                                                    ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20',
                                            )}
                                        >
                                            {subject.category || 'UN-UPDATED'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-center font-bold text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
                                        {subject.credit}
                                    </td>
                                    <td className="py-4 pr-6 pl-2 text-right">
                                        <span
                                            className={cn(
                                                'inline-flex min-w-[2.2rem] justify-center rounded-lg px-2 py-1 text-md md:text-lg font-black tabular-nums shadow-sm border',
                                                isHighGrade
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/20'
                                                    : subject.grade === 'F'
                                                      ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/20'
                                                      : subject.grade === 'P'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/20'
                                                        : 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
                                            )}
                                        >
                                            {subject.grade || '-'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredSubjects.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                            <Filter className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">
                            No matching results
                        </p>
                        <button
                            onClick={() => {
                                setSelectedSemester('All Semesters');
                                setSelectedCategory('All Categories');
                            }}
                            className="text-[10px] font-black text-primary hover:underline underline-offset-4"
                        >
                            CLEAR ALL FILTERS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
