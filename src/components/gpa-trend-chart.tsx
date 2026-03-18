'use client';

import { useRef, useState } from 'react';

import { SemesterGrade } from '@/types/api';

import { cn } from '@/utils';

interface GPATrendChartProps {
    grades: SemesterGrade[];
}

export function GPATrendChart({ grades }: GPATrendChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Prepare chart data: reverse to show chronological order
    const chartGrades = [...grades].reverse();
    const gpaPoints = chartGrades.map((g) => parseFloat(g.gpa) || 0);

    if (gpaPoints.length <= 4) return null;

    // Dynamic scale: find min/max and add a small buffer
    const rawMin = Math.min(...gpaPoints);
    const rawMax = Math.max(...gpaPoints);
    const gpaRange = rawMax - rawMin;

    // Add padding to the range to make it look better, but keep within 0-4.5
    const chartMin = Math.max(0, rawMin - (gpaRange * 0.2 || 0.5));
    const chartMax = Math.min(4.5, rawMax + (gpaRange * 0.2 || 0.5));
    const displayRange = chartMax - chartMin;

    // SVG dimensions
    const width = 400;
    const height = 40;
    const paddingX = 20; // More space for edges
    const paddingY = 5;

    // Calculate all X coordinates first
    const xCoords = gpaPoints.map((_, i) =>
        gpaPoints.length > 1 ? (i / (gpaPoints.length - 1)) * (width - paddingX * 2) + paddingX : width / 2,
    );

    const points = gpaPoints
        .map((gpa, i) => {
            const x = xCoords[i];
            const y = height - ((gpa - chartMin) / displayRange) * (height - paddingY * 2) - paddingY;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="px-6 py-4 bg-zinc-50/20 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GPA Trend</span>
                <div className="flex gap-2 text-[9px] font-bold">
                    <span className="text-zinc-400">Min {rawMin.toFixed(2)}</span>
                    <span className="text-primary">Max {rawMax.toFixed(2)}</span>
                </div>
            </div>

            <div className="relative h-full w-full mt-2" ref={containerRef}>
                {/* Tooltip Overlay */}
                {hoveredIndex !== null && (
                    <div
                        className={cn(
                            'absolute z-20 -top-14 pointer-events-none transition-all duration-200 ease-out',
                            hoveredIndex === 0
                                ? 'translate-x-0'
                                : hoveredIndex === gpaPoints.length - 1
                                  ? '-translate-x-full'
                                  : '-translate-x-1/2',
                        )}
                        style={{
                            left: `${(xCoords[hoveredIndex] / width) * 100}%`,
                        }}
                    >
                        <div className="bg-zinc-900/95 backdrop-blur-sm text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl border border-white/10 flex flex-col items-center whitespace-nowrap min-w-[80px]">
                            <span className="text-zinc-400 text-[8px] uppercase tracking-tighter mb-0.5">
                                {chartGrades[hoveredIndex].year} {chartGrades[hoveredIndex].semester}
                            </span>
                            <div className="flex flex-col items-center">
                                <span className="text-primary text-xs">{chartGrades[hoveredIndex].gpa} GPA</span>
                                <span className="text-blue-400 text-[9px]">
                                    {chartGrades[hoveredIndex].earnedCredits}학점 취득
                                </span>
                            </div>
                            {/* Pointer arrow */}
                            <div
                                className={cn(
                                    'absolute top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-zinc-900/95',
                                    hoveredIndex === 0
                                        ? 'left-2'
                                        : hoveredIndex === gpaPoints.length - 1
                                          ? 'right-2'
                                          : 'left-1/2 -translate-x-1/2',
                                )}
                            />
                        </div>
                    </div>
                )}

                <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
                    {/* Grid lines */}
                    {[chartMin, (chartMin + chartMax) / 2, chartMax].map((level) => {
                        const y = height - ((level - chartMin) / displayRange) * (height - paddingY * 2) - paddingY;
                        return (
                            <line
                                key={level}
                                x1="0"
                                y1={y}
                                x2={width}
                                y2={y}
                                stroke="currentColor"
                                className="text-zinc-100 dark:text-zinc-800"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Gradient Area */}
                    <defs>
                        <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {gpaPoints.length > 1 && (
                        <polyline
                            points={`${xCoords[0]},${height} ${points} ${xCoords[xCoords.length - 1]},${height}`}
                            fill="url(#gpaGradient)"
                        />
                    )}

                    {/* Line Path */}
                    <polyline
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="drop-shadow-[0_2px_4px_rgba(7,146,179,0.3)]"
                    />

                    {/* Data Points */}
                    {gpaPoints.map((gpa, i) => {
                        const x = xCoords[i];
                        const y = height - ((gpa - chartMin) / displayRange) * (height - paddingY * 2) - paddingY;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={hoveredIndex === i ? '4' : '3'}
                                fill="white"
                                stroke="var(--primary)"
                                strokeWidth={hoveredIndex === i ? '3' : '2'}
                                className="transition-all duration-200"
                            />
                        );
                    })}

                    {/* Hit Zones (Invisible Vertical Bars) */}
                    {gpaPoints.map((_, i) => {
                        const barWidth = width / gpaPoints.length;
                        const x = xCoords[i] - barWidth / 2;
                        return (
                            <rect
                                key={`hit-${i}`}
                                x={x}
                                y={0}
                                width={barWidth}
                                height={height}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
