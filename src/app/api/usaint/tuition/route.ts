import { ApiErrorResponse, TuitionInfo, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapTable, SapTableRowData, SapWdaClient } from 'usaint-lib';

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

    // 2️⃣ Initialize WDA (Tuition program ID: ZCMW6520n)
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW6520n', storedCookie);

    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize tuition session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    // 3️⃣ Get the tuition table
    const tableId = 'ZCMW6520.ID_0001:VIW_MAIN.TABLE';
    const table = wda.getControlById<SapTable>(tableId);

    if (!table) {
        console.warn(`Table not found: ${tableId}`);
        return NextResponse.json<UsaintApiResponse<TuitionInfo[]>>({
            success: true,
            data: [],
        });
    }

    // 4️⃣ Fetch all rows from the table
    const tableData = await table.getAllRows();

    if (tableData.rows.length > 0) {
        console.log(`First row cells count: ${tableData.rows[0].cells.length}`);
    }

    const getCellText = (row: SapTableRowData, headerName: string) => {
        const idx = tableData.headers.findIndex((h) => h.includes(headerName));
        if (idx !== -1 && row.cells[idx]) {
            return row.cells[idx].text;
        }
        return '';
    };

    const tuitionList: TuitionInfo[] = tableData.rows
        .map((row) => ({
            year: getCellText(row, '학년도'),
            semester: getCellText(row, '학기'),
            amount: getCellText(row, '등록금액'),
            scholarship: getCellText(row, '사전감면'),
            netAmount: getCellText(row, '납부금액'),
        }))
        .filter((item) => item.year !== '');

    return NextResponse.json<UsaintApiResponse<TuitionInfo[]>>({
        success: true,
        data: tuitionList,
    });
});
