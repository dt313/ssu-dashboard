import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeProvider } from '@/components/providers/theme-provider';
import ToastProvider from '@/components/providers/toast-provider';

import { AppLayout } from './app-layout';
import './styles/globals.css';

export const metadata = {
    title: 'SSU Dashboard - Student Academic Information',
    description:
        'Manage your Soongsil Software University academic information in one page. View grades, tuition, timetable, chapel attendance, scholarship, and graduation audit.',
    keywords: [
        'SSU',
        'Soongsil University',
        'student dashboard',
        'academic info',
        'grades',
        'tuition',
        'timetable',
        '숭실대',
        '숭실대학교',
        '학점',
        '학생 정보',
        '등록금',
        '등록금 내역',
        '졸업사정표',
        '학비',
        '성적',
    ],
    openGraph: {
        title: 'SSU Dashboard - Student Academic Information',
        description: 'Manage your Soongsil Software University academic information in one page.',
        type: 'website',
        images: [
            {
                url: '/images/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SSU Dashboard',
            },
        ],
    },
};
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <AppLayout>
                        {children}
                        <ToastProvider />
                    </AppLayout>
                </ThemeProvider>
            </body>
        </html>
    );
}
