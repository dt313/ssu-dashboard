import { ApiErrorResponse, ScholarshipInfo, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const SCHOLARSHIP_IDS = {
    TABLE: 'ZCMW7530.ID_0001:VIW_MAIN.TABLE_2',
};

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId }: UsaintApiRequest = await request.json();

    if (!appSessionId) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Missing session ID' }, { status: 400 });
    }

    const storedCookie = await getSession(appSessionId);
    if (!storedCookie) {
        return NextResponse.json<ApiErrorResponse>(
            { error: 'Session expired or invalid. Please login again.' },
            { status: 401 },
        );
    }

    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW7530n', storedCookie);

    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize Scholarship session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    const table = wda.getControlById<SapTable>(SCHOLARSHIP_IDS.TABLE);
    const scholarships: ScholarshipInfo[] = [];

    if (table) {
        const tableData = await table.getAllRows();

        scholarships.push(
            ...tableData.rows.map((row) => ({
                year: (row.cells[0]?.text || '').trim(),
                semester: (row.cells[1]?.text || '').trim(),
                type: (row.cells[2]?.text || '').trim(),
                name: (row.cells[3]?.text || '').trim(),
                status: (row.cells[4]?.text || '').trim(),
                rejectReason: (row.cells[6]?.text || '').trim(),
                amount: (row.cells[8]?.text || '').trim(),
                actualAmount: (row.cells[9]?.text || '').trim(),
                processDate: (row.cells[7]?.text || '').trim(),
            })),
        );
    }

    return NextResponse.json<UsaintApiResponse<ScholarshipInfo[]>>({
        success: true,
        data: scholarships,
    });
});
