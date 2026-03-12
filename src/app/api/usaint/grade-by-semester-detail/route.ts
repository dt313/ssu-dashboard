import { ApiErrorResponse, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const GRADE_IDS = {
    TABLE: 'ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1',
    SEARCH_BTN: 'ZCMB3W0017.ID_0001:VIW_MAIN.BTN_SEARCH',
    DETAIL_BTN: (rowIndex: number) => `ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1_BTN_EDITOR.${rowIndex}`,
};

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId, year, semester } = await request.json();

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

    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMB3W0017', storedCookie);

    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize grade session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    const searchBtn = wda.getControlById<SapButton>(GRADE_IDS.SEARCH_BTN);
    if (searchBtn) {
        await searchBtn.press();
    }

    const table = wda.getControlById<SapTable>(GRADE_IDS.TABLE);
    if (!table) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Grade table not found' }, { status: 404 });
    }

    const tableData = await table.getAllRows();
    const subjects: any[] = [];

    for (let i = 0; i < tableData.rows.length; i++) {
        const row = tableData.rows[i];
        const subjectCode = (row.cells[8]?.text || '').trim();
        const subjectName = (row.cells[3]?.text || '').trim();

        const detailBtn = wda.getControlById<SapButton>(GRADE_IDS.DETAIL_BTN(i));

        let detailData: Record<string, string> = {};

        if (detailBtn) {
            await detailBtn.press();

            await new Promise((resolve) => setTimeout(resolve, 500));

            detailData = extractDetailFromHtml(wda.$.html());

            const closeBtn = wda.getControlById<SapButton>('ZCMB3W0017.ID_0001:VIW_MAIN.BTN_CANCEL');
            if (closeBtn) {
                await closeBtn.press();
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
        }

        subjects.push({
            code: subjectCode,
            name: subjectName,
            grade: (row.cells[1]?.text || '').trim(),
            gradeSymbol: (row.cells[2]?.text || '').trim(),
            credit: (row.cells[5]?.text || '').trim(),
            professor: (row.cells[6]?.text || '').trim(),
            remark: (row.cells[7]?.text || '').trim(),
            detail: detailData,
        });
    }

    return NextResponse.json<UsaintApiResponse<any>>({
        success: true,
        data: {
            year,
            semester,
            subjects,
        },
    });
});

function extractDetailFromHtml(html: string): Record<string, string> {
    const detail: Record<string, string> = {};

    const patterns = [
        /<span[^>]*id="[^"]*_TITLE[^"]*"[^>]*>([^<]*)<\/span>/g,
        /<span[^>]*id="[^"]*_EDITOR[^"]*"[^>]*>([^<]*)<\/span>/g,
    ];

    return detail;
}
