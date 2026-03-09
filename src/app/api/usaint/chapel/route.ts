import { ApiErrorResponse, ChapelInfo, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId }: UsaintApiRequest = await request.json();

    if (!appSessionId) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1️⃣ Retrieve the raw SAP cookies from Redis
    const storedCookie = await getSession(appSessionId);

    if (!storedCookie) {
        return NextResponse.json<ApiErrorResponse>(
            { error: 'Session expired or invalid. Please login again.' },
            { status: 401 },
        );
    }

    // 2️⃣ Initialize WDA (Chapel program ID: ZCMW3681)
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW3681', storedCookie);

    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize chapel session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    // 3️⃣ Get the chapel summary table
    const tableId = 'ZCMW3681.ID_0001:V_MAIN.TABLE';
    const table = wda.getControlById<SapTable>(tableId);

    if (!table) {
        console.warn(`Table not found: ${tableId}`);
        return NextResponse.json<UsaintApiResponse<ChapelInfo[]>>({
            success: true,
            data: [],
        });
    }

    // 4️⃣ Fetch all rows from the table
    const tableData = await table.getAllRows();

    const getCellText = (row: any, headerName: string) => {
        const idx = tableData.headers.findIndex((h) => h.includes(headerName));
        if (idx !== -1 && row.cells[idx]) {
            return (row.cells[idx].text || '').trim();
        }
        return '';
    };

    const chapelList: ChapelInfo[] = tableData.rows
        .map((row) => {
            const timeRoom = getCellText(row, '시간표');
            // Extract professor from something like "수 13:30-14:20 (08110-반광준)"
            const profMatch = timeRoom.match(/\(([^)]+)\)/);
            let professor = '';
            if (profMatch && profMatch[1]) {
                const parts = profMatch[1].split('-');
                professor = parts[parts.length - 1] || profMatch[1];
            }

            return {
                subjectName: '채플', // App name context
                section: getCellText(row, '분반'),
                professor: professor,
                location: getCellText(row, '강의실'),
                floor: getCellText(row, '층수'),
                seatNumber: getCellText(row, '좌석번호'),
                totalAttendance: '-', // Not directly in this table
                attendedAttendance: '-', // Not directly in this table
                lateAttendance: '-', // Not directly in this table
                absentAttendance: getCellText(row, '결석일수'),
                result: getCellText(row, '성적') || '진행중',
                remarks: getCellText(row, '비고'),
            };
        })
        .filter((item) => item.section !== '');

    return NextResponse.json<UsaintApiResponse<ChapelInfo[]>>({
        success: true,
        data: chapelList,
    });
});
