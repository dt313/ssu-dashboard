import { ApiErrorResponse, SemesterGrade, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const OLD_GRADE_IDS = {
    TABLE: 'ZCMW5002.ID_0001:VIW_MAIN.TABLE',
    DEGREE_TYPE: 'ZCMW5002.ID_0001:VIW_MAIN.PROGC_VAR',
};

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId } = await request.json();

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

    // Initialize with ZCMW5002
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW5002', storedCookie);
    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize old version grade session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    const fs = require('fs');
    fs.writeFileSync('grade-by-semester-old.html', wda.$.html());

    // Extract table data
    const table = wda.getControlById<SapTable>(OLD_GRADE_IDS.TABLE);
    let grades: SemesterGrade[] = [];

    if (table) {
        const tableData = await table.getAllRows();
        // Indexing based on ZCMW5002 column structure
        grades = tableData.rows.map((row) => ({
            year: (row.cells[1]?.text || '').trim(),
            semester: (row.cells[2]?.text || '').trim(),
            appliedCredits: (row.cells[3]?.text || '').trim(),
            earnedCredits: (row.cells[4]?.text || '').trim(),
            pfCredits: (row.cells[5]?.text || '').trim(),
            gpa: (row.cells[6]?.text || '').trim(),
            scoreSum: (row.cells[7]?.text || '').trim(),
            arithmeticAverage: (row.cells[8]?.text || '').trim(),
            semesterRank: (row.cells[9]?.text || '').trim(),
            totalRank: (row.cells[10]?.text || '').trim(),
            academicWarning: (row.cells[11]?.text || '').trim(),
            counseling: (row.cells[12]?.text || '').trim(),
            repeat: (row.cells[13]?.text || '').trim(),
        }));
    }

    return NextResponse.json<UsaintApiResponse<SemesterGrade[]>>({
        success: true,
        data: grades,
    });
});
