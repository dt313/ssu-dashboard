'use client';

import { useState } from 'react';

import { useUIStore } from '@/store/use-ui-store';
import { Palette } from 'lucide-react';

import { cn } from '@/utils';

export type BackgroundType = 'dashed-grid' | 'dots' | 'gradient' | 'solid' | 'none';

const options: { value: BackgroundType; label: string }[] = [
    { value: 'dashed-grid', label: 'Dashed Grid' },
    { value: 'dots', label: 'Dots' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'solid', label: 'Solid Color' },
];

export function BackgroundSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { bgType, setBgType } = useUIStore();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white dark:bg-zinc-950 transition-colors hover:bg-accent"
                aria-label="Change background"
            >
                <Palette className="h-4 w-4 text-zinc-500" />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-10 mt-2 w-44 rounded-lg border border-border bg-white dark:bg-zinc-800 shadow-lg py-1 z-50">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Background Style
                        </div>
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setBgType(opt.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between px-3 py-2 text-xs font-bold outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700',
                                    bgType === opt.value
                                        ? 'bg-zinc-50 text-primary dark:bg-zinc-700'
                                        : 'text-zinc-600 dark:text-zinc-400',
                                )}
                            >
                                <span>{opt.label}</span>
                                {bgType === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export function DashedGridBackground() {
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-20"
            style={{
                backgroundImage: `
                    linear-gradient(to right, #e7e5e4 1px, transparent 1px),
                    linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 0',
                maskImage: `
                    repeating-linear-gradient(
                        to right,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px
                    ),
                    repeating-linear-gradient(
                        to bottom,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px
                    )
                `,
                WebkitMaskImage: `
                    repeating-linear-gradient(
                        to right,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px
                    ),
                    repeating-linear-gradient(
                        to bottom,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px
                    )
                `,
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in',
            }}
        />
    );
}

export function DotsBackground() {
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 0)',
                backgroundSize: '20px 20px',
            }}
        />
    );
}

export function GradientBackground() {
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                background: `
                    radial-gradient(ellipse at 20% 20%, rgba(7, 147, 179, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.04) 0%, transparent 60%),
                    linear-gradient(180deg, var(--gradient-from) 0%, var(--gradient-to) 100%)
                `,
            }}
        />
    );
}

export function SolidBackground() {
    return <div className="absolute inset-0 z-0 bg-zinc-50/50 dark:bg-zinc-900/50" />;
}
