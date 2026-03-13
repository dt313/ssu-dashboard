'use client';

import { useState } from 'react';

import { useAuthStore } from '@/store/use-auth-store';
import { ChapelInfo } from '@/types/api';
import {
    AlertCircle,
    Armchair,
    Calendar,
    ChevronDown,
    Clock,
    Info,
    Loader2,
    MapPin,
    RotateCw,
    Search,
    Tag,
    User,
} from 'lucide-react';

import { usaintService } from '@/services';

import { cn } from '@/utils/cn';

import { ChapelAttendanceModal } from './chapel-attendance-modal';

interface ChapelCardProps {
    data: ChapelInfo | null;
    studentId?: string;
    className?: string;
}

export function ChapelCard({ data, studentId, className }: ChapelCardProps) {
    const { appSessionId } = useAuthStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Current date for determining current year and semester
    const now = new Date();
    const currentYear = now.getFullYear();

    // Selection state (default to current if data is not available or just use what's in data)
    const initialYear = data?.year || currentYear.toString();
    const initialSemester = data?.semester;

    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedSemester, setSelectedSemester] = useState(initialSemester);

    // Calculate years from admission year (from studentId) to current year
    const admissionYear = studentId ? parseInt(studentId.substring(0, 4)) : currentYear - 4;
    const years = [];
    for (let y = currentYear; y >= admissionYear; y--) {
        years.push(y.toString());
    }

    const semesters = [
        { label: '1학기', value: '090' },
        { label: '2학기', value: '092' },
    ];

    const handleFetchData = async (type: 'refresh' | 'search') => {
        if (!appSessionId) return;

        if (type === 'refresh') setIsRefreshing(true);
        else setIsSearching(true);

        try {
            await usaintService.callChapelApi({
                appSessionId,
                year: type === 'refresh' ? '' : selectedYear,
                semester: type === 'refresh' ? '' : selectedSemester,
            });
        } catch (error) {
            console.error('Failed to fetch chapel data:', error);
        } finally {
            if (type === 'refresh') setIsRefreshing(false);
            else setIsSearching(false);
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(e.target.value);
    };

    const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSemester(e.target.value);
    };

    const isLoading = isRefreshing || isSearching;

    // Attendance summary for the chapel item
    const totalAttendance = data ? parseInt(data.totalAttendance) || 0 : 0;
    const attendedAttendance = data ? parseInt(data.attendedAttendance) || 0 : 0;
    const absentAttendance = data ? parseInt(data.absentAttendance) || 0 : 0;

    // Custom requirement: 7/8 for 8 sessions, 2/3 for others
    const requiredAttendance = totalAttendance === 8 ? 7 : Math.ceil(totalAttendance * (2 / 3));
    const isPassed = attendedAttendance >= requiredAttendance;

    return (
        <div
            className={cn(
                'w-full h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950',
                className,
            )}
        >
            <div className="flex border-b border-zinc-100 p-5 dark:border-zinc-900/50 items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">채플</h3>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">채플 정보 및 출석 현황</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleFetchData('refresh')}
                        disabled={isLoading}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        title="Refresh"
                    >
                        <RotateCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900/50 min-h-[100px] relative">
                <div className="flex  items-center justify-start gap-4 p-5">
                    <div className="flex items-center rounded-xl border border-zinc-100 bg-zinc-50/50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                disabled={isLoading}
                                className="appearance-none bg-transparent pl-3 pr-7 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none dark:text-zinc-300"
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
                        </div>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

                        <div className="relative cursor-pointer">
                            <select
                                value={selectedSemester}
                                onChange={handleSemesterChange}
                                disabled={isLoading}
                                className="appearance-none bg-transparent pl-3 pr-7 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none dark:text-zinc-300"
                            >
                                {semesters.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
                        </div>
                    </div>

                    <button
                        onClick={() => handleFetchData('search')}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto "
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                </div>

                {data?.attendanceDetails && data.attendanceDetails.length >= 8 && (
                    <div className="p-5 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                                        Pass까지 남은 출석
                                    </span>
                                    <span
                                        className={cn(
                                            'text-lg font-black',
                                            isPassed
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-amber-600 dark:text-amber-400',
                                        )}
                                    >
                                        {attendedAttendance}/{requiredAttendance}
                                    </span>
                                </div>

                                <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full transition-all duration-500',
                                            isPassed ? 'bg-emerald-500' : 'bg-amber-500',
                                        )}
                                        style={{
                                            width: `${totalAttendance > 0 ? Math.min(100, (attendedAttendance / requiredAttendance) * 100) : 0}%`,
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    {data?.attendanceDetails && data.attendanceDetails.length > 0 && (
                                        <ChapelAttendanceModal
                                            attendanceDetails={data.attendanceDetails}
                                            totalAttendance={totalAttendance}
                                            attendedAttendance={attendedAttendance}
                                            absentAttendance={absentAttendance}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        결석 횟수
                                    </p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-xl font-black text-red-600 dark:text-red-400">
                                            {absentAttendance}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400">회</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        강의 횟수
                                    </p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                                            {totalAttendance}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400">회</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    </div>
                )}

                {data?.section ? (
                    <div className="group p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 space-y-3.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                        {data.subjectName}
                                    </span>

                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase',
                                            data.result === '이수' || data.result === 'P'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : data.result === '진행중'
                                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                  : 'hidden bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                        )}
                                    >
                                        {data.result}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                        <Tag className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm font-medium">분반: {data.section}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                        <Clock className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm">{data.timetable}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                        <MapPin className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm">{data.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                        <Armchair className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm">
                                            Seat {data.seatNumber}{' '}
                                            <span className="text-xs text-zinc-400">(Floor {data.floor})</span>
                                        </span>
                                    </div>
                                </div>

                                {data.remarks && (
                                    <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900/50">
                                        <span className="mt-0.5">
                                            <Info className="h-3.5 w-3.5 text-zinc-400" />
                                        </span>
                                        <p className="text-sm text-zinc-500 italic dark:text-zinc-400">
                                            {data.remarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-1 h-32 items-center justify-center p-8 text-center">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                No chapel records found for this term.
                            </p>
                            <p className="text-xs text-zinc-400">Try selecting a different year or semester.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-zinc-100 bg-zinc-50/30 px-6 py-4 dark:border-zinc-900/50 dark:bg-zinc-900/20">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-2">
                    {totalAttendance === 8 ? (
                        <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                            <p>
                                1. 총 8회 중 7회 이상 출석하여야 PASS로 인정됩니다(10분 이내 입장시 2회까지 지각 인정).
                            </p>
                            <p>
                                2. 휴강 시 온라인으로 보강이 진행됩니다. 공휴일로 인한 휴강도 온라인 보강이 있으니
                                반드시 LMS 공지사항을 확인하여 이수하시기 바랍니다.
                            </p>
                        </div>
                    ) : (
                        <p className="text-zinc-600 dark:text-zinc-400">
                            * 채플의 이수 기준은 2/3 이상의 출석입니다. Absence limit may apply for passing (P) grade.
                        </p>
                    )}
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">
                        * Records are updated periodically.
                    </p>
                </div>
            </div>
        </div>
    );
}
