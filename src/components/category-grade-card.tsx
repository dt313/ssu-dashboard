'use client';

import { useMemo, useState } from 'react';

import { useUsaintStore } from '@/store/use-usaint-store';
import { CategoryGradeInfo, GradeSubject, SubjectGradeDetail } from '@/types/api';
import { ArrowDown, ArrowUp, ChevronDown, ClipboardCheck, FileText, Filter, Search, X } from 'lucide-react';

import { cn } from '@/utils';

import { SubjectDetailModal } from './subject-detail-modal';
import { SubjectsByGradeModal } from './subjects-by-grade-modal';

interface CategoryGradeCardProps {
    data: CategoryGradeInfo;
    className?: string;
}

const GRADE_ORDER = ['A+', 'A0', 'A-', 'B+', 'B0', 'B-', 'C+', 'C0', 'C-', 'D+', 'D0', 'D-', 'F', 'P', 'N/A'] as const;

const GRADE_COLORS: Record<string, string> = {
    A: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/20',
    B: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/20',
    C: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/20',
    D: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-900/20',
    F: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/20',
    P: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-900/20',
    N: 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
};

function getGradeColor(grade: string): string {
    return GRADE_COLORS[grade.charAt(0).toUpperCase()] || GRADE_COLORS.N;
}

function SortIcon({
    field,
    currentField,
    direction,
}: {
    field: string;
    currentField: string;
    direction: 'asc' | 'desc';
}) {
    if (field !== currentField) return null;
    return direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

function FilterSelect({
    value,
    options,
    onChange,
    selectedClass,
}: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    selectedClass: string;
}) {
    return (
        <div className="group relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    'appearance-none rounded-full border px-4 py-1.5 text-xs font-black outline-none transition-all cursor-pointer pr-8 pl-4 shadow-sm',
                    selectedClass,
                )}
            >
                {options.map((opt) => (
                    <option key={opt} value={opt} className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {opt}
                    </option>
                ))}
            </select>
            <ChevronDown
                className={cn(
                    'absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none transition-transform group-hover:translate-y-[-40%]',
                    value !== options[0] ? 'text-white' : 'text-zinc-400',
                )}
            />
        </div>
    );
}

function StatsBar({
    stats,
    onGradeClick,
}: {
    stats: { totalCredits: number; count: number; gradeCounts: Record<string, number> };
    onGradeClick: (grade: string) => void;
}) {
    return (
        <div className="flex items-center flex-wrap gap-6">
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-tight">Courses</span>
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
            {Object.keys(stats.gradeCounts).length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-tight">Grades</span>
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(stats.gradeCounts)
                            .sort(
                                ([a], [b]) =>
                                    GRADE_ORDER.indexOf(a as (typeof GRADE_ORDER)[number]) -
                                    GRADE_ORDER.indexOf(b as (typeof GRADE_ORDER)[number]),
                            )
                            .map(([grade, count]) => (
                                <button
                                    key={grade}
                                    onClick={() => onGradeClick(grade)}
                                    className={cn(
                                        'text-xs font-black px-1.5 py-0.5 rounded transition-transform hover:scale-105',
                                        getGradeColor(grade),
                                    )}
                                >
                                    {grade}: {count}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function GradeCell({ grade }: { grade: string }) {
    return (
        <span
            className={cn(
                'inline-flex min-w-[2.2rem] justify-center rounded-lg px-2 py-1 text-md md:text-lg font-black tabular-nums shadow-sm border',
                getGradeColor(grade),
            )}
        >
            {grade || '-'}
        </span>
    );
}

export function CategoryGradeCard({ data, className }: CategoryGradeCardProps) {
    const { subjectGradeDetail } = useUsaintStore();
    const semesters = ['All Semesters', ...Object.keys(data.bySemester).sort((a, b) => b.localeCompare(a))];

    const categories = [
        'All Categories',
        ...Array.from(new Set(data.subjects.map((s) => s.category || 'Un-updated'))).sort((a, b) => {
            if (a === 'Un-updated') return 1;
            if (b === 'Un-updated') return -1;
            return a.localeCompare(b);
        }),
    ];

    const [selectedSemester, setSelectedSemester] = useState('All Semesters');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'semester' | 'name' | 'grade'>('grade');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [subjectsForGrade, setSubjectsForGrade] = useState<{ grade: string; subjects: GradeSubject[] } | null>(null);
    const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectGradeDetail | null>(null);

    const handleSort = (field: 'semester' | 'name' | 'grade') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handleGradeClick = (grade: string) => {
        const subjectsWithGrade = data.subjects.filter((s) => (s.grade || 'N/A') === grade);
        setSubjectsForGrade({ grade, subjects: subjectsWithGrade });
    };

    const handleSubjectDetailClick = (subjectCode: string) => {
        const detail = subjectGradeDetail?.find((item) => item.data[0]?.[1] === subjectCode);
        if (detail) {
            setSelectedSubjectDetail(detail);
        }
    };

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
                if (sortField === 'grade') {
                    const gradeA = a.grade || 'N/A';
                    const gradeB = b.grade || 'N/A';
                    const idxA = GRADE_ORDER.indexOf(gradeA as (typeof GRADE_ORDER)[number]);
                    const idxB = GRADE_ORDER.indexOf(gradeB as (typeof GRADE_ORDER)[number]);
                    return sortDirection === 'asc' ? idxB - idxA : idxA - idxB;
                }
                if (sortField === 'name') {
                    return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }
                const semA = `${a.yearSemester.year}-${a.yearSemester.semester}`;
                const semB = `${b.yearSemester.year}-${b.yearSemester.semester}`;
                if (semA !== semB) return sortDirection === 'asc' ? semA.localeCompare(semB) : semB.localeCompare(semA);
                return a.name.localeCompare(b.name);
            });
    }, [data.subjects, selectedSemester, selectedCategory, searchQuery, sortField, sortDirection]);

    const stats = useMemo(() => {
        const totalCredits = filteredSubjects.reduce((acc, sub) => acc + sub.credit, 0);
        const gradeCounts = filteredSubjects.reduce(
            (acc, sub) => {
                const grade = sub.grade || 'N/A';
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
        return { totalCredits, count: filteredSubjects.length, gradeCounts };
    }, [filteredSubjects]);

    const isFiltered =
        selectedSemester !== 'All Semesters' || selectedCategory !== 'All Categories' || searchQuery !== '';
    const resetFilters = () => {
        setSelectedSemester('All Semesters');
        setSelectedCategory('All Categories');
        setSearchQuery('');
    };

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

            <div className="flex flex-col gap-5 p-6 bg-zinc-50/40 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                        <Filter className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Filter by</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5 items-center">
                        <FilterSelect
                            value={selectedSemester}
                            options={semesters}
                            onChange={setSelectedSemester}
                            selectedClass={
                                selectedSemester !== 'All Semesters'
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700'
                            }
                        />
                        <FilterSelect
                            value={selectedCategory}
                            options={categories}
                            onChange={setSelectedCategory}
                            selectedClass={
                                selectedCategory !== 'All Categories'
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700'
                            }
                        />
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
                        {isFiltered && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1.5 rounded-full bg-zinc-200/50 hover:bg-zinc-200 px-3 py-1.5 text-[10px] font-black text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="h-3 w-3" />
                                RESET
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between px-1">
                    <StatsBar stats={stats} onGradeClick={handleGradeClick} />
                </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[500px]">
                <table className="w-full text-left text-sm relative">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 text-sm font-black uppercase text-zinc-400 tracking-widest">
                            <th className="py-4 pl-6 pr-2">
                                <div className="flex items-center gap-2">
                                    <span>과목명</span>
                                    {subjectGradeDetail && subjectGradeDetail.length > 0 && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            DETAIL
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="py-4 px-2 text-center cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                onClick={() => handleSort('semester')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <span>학년-학기</span>
                                    <SortIcon field="semester" currentField={sortField} direction={sortDirection} />
                                </div>
                            </th>
                            <th className="py-4 px-2 text-center">구분</th>
                            <th className="py-4 px-2 text-center">과목학점</th>
                            <th
                                className="py-4 pr-6 pl-2 text-right cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                onClick={() => handleSort('grade')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    <span>등급</span>
                                    <SortIcon field="grade" currentField={sortField} direction={sortDirection} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                        {filteredSubjects.map((subject, idx) => {
                            const hasCategory = !!subject.category;
                            const hasDetail = subjectGradeDetail?.some((item) => item.data[0]?.[1] === subject.code);
                            return (
                                <tr
                                    key={`${subject.code}-${idx}`}
                                    className="group transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                                >
                                    <td className="py-4 pl-6 pr-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-0.5 flex-1">
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
                                            {hasDetail && (
                                                <button
                                                    onClick={() => handleSubjectDetailClick(subject.code)}
                                                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary dark:hover:text-primary shadow-sm border border-zinc-200 dark:border-zinc-700 cursor-pointer transition-all"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                </button>
                                            )}
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
                                        <GradeCell grade={subject.grade} />
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
                            onClick={resetFilters}
                            className="text-[10px] font-black text-primary hover:underline underline-offset-4"
                        >
                            CLEAR ALL FILTERS
                        </button>
                    </div>
                )}
            </div>

            {subjectsForGrade && (
                <SubjectsByGradeModal
                    open={!!subjectsForGrade}
                    onOpenChange={() => setSubjectsForGrade(null)}
                    grade={subjectsForGrade.grade}
                    subjects={subjectsForGrade.subjects}
                />
            )}

            <SubjectDetailModal
                detail={selectedSubjectDetail}
                onOpenChange={(open) => !open && setSelectedSubjectDetail(null)}
            />
        </div>
    );
}
