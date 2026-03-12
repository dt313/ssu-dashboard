import { ApiErrorResponse, SemesterGrade, SemesterGradeInfo, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';
import { getControlValue } from '@/utils/usaint-parser';

const GRADE_IDS = {
    TABLE: 'ZCMB3W0017.ID_0001:VIW_MAIN.TABLE',
    SEARCH_BTN: 'ZCMB3W0017.ID_0001:VIW_MAIN.BTN_SEARCH',
    // Academic Record Summary (학적부)
    ACAD_APPLIED: 'ZCMB3W0017.ID_0001:VIW_MAIN.ATTM_CRD1',
    ACAD_EARNED: 'ZCMB3W0017.ID_0001:VIW_MAIN.EARN_CRD1',
    ACAD_SCORE_SUM: 'ZCMB3W0017.ID_0001:VIW_MAIN.GT_GPA1',
    ACAD_GPA: 'ZCMB3W0017.ID_0001:VIW_MAIN.CGPA1',
    ACAD_AVG: 'ZCMB3W0017.ID_0001:VIW_MAIN.AVG1',
    ACAD_PF: 'ZCMB3W0017.ID_0001:VIW_MAIN.PF_EARN_CRD',
    // Proof Summary (증명)
    PROOF_APPLIED: 'ZCMB3W0017.ID_0001:VIW_MAIN.ATTM_CRD2',
    PROOF_EARNED: 'ZCMB3W0017.ID_0001:VIW_MAIN.EARN_CRD2',
    PROOF_SCORE_SUM: 'ZCMB3W0017.ID_0001:VIW_MAIN.GT_GPA2',
    PROOF_GPA: 'ZCMB3W0017.ID_0001:VIW_MAIN.CGPA2',
    PROOF_AVG: 'ZCMB3W0017.ID_0001:VIW_MAIN.AVG2',
    PROOF_PF: 'ZCMB3W0017.ID_0001:VIW_MAIN.T_PF_ERN_CRD1',
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

    // Press search button to ensure data is loaded
    const searchBtn = wda.getControlById<SapButton>(GRADE_IDS.SEARCH_BTN);
    if (searchBtn) {
        await searchBtn.press();
    }

    // Extract table data
    const table = wda.getControlById<SapTable>(GRADE_IDS.TABLE);
    let grades: SemesterGrade[] = [];

    if (table) {
        const tableData = await table.getAllRows();
        grades = tableData.rows.map((row) => ({
            year: (row.cells[0]?.text || '').trim(),
            semester: (row.cells[1]?.text || '').trim(),
            appliedCredits: (row.cells[2]?.text || '').trim(),
            earnedCredits: (row.cells[3]?.text || '').trim(),
            pfCredits: (row.cells[4]?.text || '').trim(),
            gpa: (row.cells[5]?.text || '').trim(),
            scoreSum: (row.cells[6]?.text || '').trim(),
            arithmeticAverage: (row.cells[7]?.text || '').trim(),
            semesterRank: (row.cells[8]?.text || '').trim(),
            totalRank: (row.cells[9]?.text || '').trim(),
            academicWarning: (row.cells[10]?.text || '').trim(),
            counseling: (row.cells[11]?.text || '').trim(),
            repeat: (row.cells[12]?.text || '').trim(),
        }));
    }

    // Extract summary information
    const data: SemesterGradeInfo = {
        grades,
        summary: {
            academicRecord: {
                appliedCredits: getControlValue(wda, GRADE_IDS.ACAD_APPLIED),
                earnedCredits: getControlValue(wda, GRADE_IDS.ACAD_EARNED),
                scoreSum: getControlValue(wda, GRADE_IDS.ACAD_SCORE_SUM),
                gpa: getControlValue(wda, GRADE_IDS.ACAD_GPA),
                arithmeticAverage: getControlValue(wda, GRADE_IDS.ACAD_AVG),
                pfCredits: getControlValue(wda, GRADE_IDS.ACAD_PF),
            },
            proof: {
                appliedCredits: getControlValue(wda, GRADE_IDS.PROOF_APPLIED),
                earnedCredits: getControlValue(wda, GRADE_IDS.PROOF_EARNED),
                scoreSum: getControlValue(wda, GRADE_IDS.PROOF_SCORE_SUM),
                gpa: getControlValue(wda, GRADE_IDS.PROOF_GPA),
                arithmeticAverage: getControlValue(wda, GRADE_IDS.PROOF_AVG),
                pfCredits: getControlValue(wda, GRADE_IDS.PROOF_PF),
            },
        },
    };

    return NextResponse.json<UsaintApiResponse<SemesterGradeInfo>>({
        success: true,
        data,
    });
});
