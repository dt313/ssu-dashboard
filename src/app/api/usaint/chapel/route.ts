import { ApiErrorResponse, ChapelAttendance, ChapelInfo, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapComboBox, SapInput, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const CHAPEL_IDS = {
    INFO: 'ZCMW3681.ID_0001:V_MAIN.TABLE',
    ATTENDANCE: 'ZCMW3681.ID_0001:V_MAIN.TABLE_A',
};

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId, year: targetYear, semester: targetSemester } = await request.json();

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

    // 3️⃣ If year and semester are provided, update search criteria and click Search
    if (targetYear || targetSemester) {
        if (targetYear) {
            const yearCombo = wda.getControlById<SapComboBox>('ZCMW3681.ID_0001:V_MAIN.TC_SEL_PERYR');
            if (yearCombo) await yearCombo.selectByKey(targetYear);
        }
        if (targetSemester) {
            const semesterCombo = wda.getControlById<SapComboBox>('ZCMW3681.ID_0001:V_MAIN.TC_SEL_PERID');
            if (semesterCombo) await semesterCombo.selectByKey(targetSemester);
        }

        const searchBtn = wda.getControlById<SapButton>('ZCMW3681.ID_0001:V_MAIN.BTN_SEL');
        if (searchBtn) {
            await searchBtn.press();
        }
    }

    // 4️⃣ Get the chapel summary table
    const tableId = CHAPEL_IDS.INFO;
    const table = wda.getControlById<SapTable>(tableId);

    if (!table) {
        console.warn(`Table not found: ${tableId}`);
        return NextResponse.json<UsaintApiResponse<ChapelInfo | null>>({
            success: true,
            data: null,
        });
    }

    const infoTableHeaders = await table.getHeaders();
    const infoTableData = await table.getAllRows();

    const chapelInfo = infoTableData.rows.map((row) => {
        const cellTexts = row.cells.map((c: any) => c.text.trim());
        const info: any = {};
        infoTableHeaders.forEach((header, idx) => {
            info[header] = cellTexts[idx] || '';
        });
        return info;
    });

    const year = wda.getControlById<SapComboBox>('ZCMW3681.ID_0001:V_MAIN.TC_SEL_PERYR')?.selectedKey || '';
    const semester = wda.getControlById<SapComboBox>('ZCMW3681.ID_0001:V_MAIN.TC_SEL_PERID')?.selectedKey || '';

    const attendanceTable = wda.getControlById<SapTable>(CHAPEL_IDS.ATTENDANCE);
    const attendanceData = await attendanceTable?.getVisibleRows();

    const attendanceDetails: ChapelAttendance[] = (attendanceData?.rows ?? []).map((row, i) => {
        const cells = row.cells;
        const type = cells[2]?.controls[0] as SapComboBox;
        const finalType = (type as any)?.el?.[0]?.attribs?.value || '';

        return {
            section: cells[0]?.text ?? '',
            date: cells[1]?.text ?? '',
            type: finalType || '',
            lecturer: cells[4]?.text ?? '',
            department: cells[5]?.text ?? '',
            title: cells[6]?.text ?? '',
            status: cells[7]?.text ?? '',
            evaluation: cells[8]?.text ?? '',
            remarks: cells[10]?.text ?? '',
        };
    });

    const result: ChapelInfo = {
        year,
        semester,
        section: chapelInfo[0]?.['분반'] || '',
        subjectName: '채플',
        timetable: chapelInfo[0]?.['시간표'] || '',
        location: chapelInfo[0]?.['강의실'] || '',
        floor: chapelInfo[0]?.['층수'] || '',
        seatNumber: chapelInfo[0]?.['좌석번호'] || '',
        absentAttendance: chapelInfo[0]?.['결석일수'] || '',
        result: chapelInfo[0]?.['성적'] || '',
        remarks: chapelInfo[0]?.['비고'] || '',
        totalAttendance: attendanceDetails ? attendanceDetails.length.toString() : '0',
        attendedAttendance: attendanceDetails
            ? attendanceDetails.filter((a) => a.status === '출석').length.toString()
            : '0',
        attendanceDetails: attendanceDetails || [],
    };

    return NextResponse.json<UsaintApiResponse<ChapelInfo | null>>({
        success: true,
        data: result ?? null,
    });
});
