import { ApiErrorResponse, ChapelInfo, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapComboBox, SapInput, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

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
    const tableId = 'ZCMW3681.ID_0001:V_MAIN.TABLE';
    const table = wda.getControlById<SapTable>(tableId);

    if (!table) {
        console.warn(`Table not found: ${tableId}`);
        return NextResponse.json<UsaintApiResponse<ChapelInfo[]>>({
            success: true,
            data: [],
        });
    }

    // 5️⃣ Get year and semester info from search conditions using library value property
    const yearInput = wda.getControlById<SapInput>('ZCMW3681.ID_0001:V_MAIN.TC_SEL_PERYR');
    const semesterInput = wda.getControlById<SapInput>('ZCMW3681.ID_0001:V_MAIN.TC_SEL_PERID');

    const year = yearInput?.value || '';
    const semester = semesterInput?.value || '';

    // 6️⃣ Fetch all rows from the summary table
    const tableData = await table.getAllRows();

    // 7️⃣ Get attendance details table
    const attendanceTableId = 'ZCMW3681.ID_0001:V_MAIN.TABLE_A';
    const attendanceTable = wda.getControlById<SapTable>(attendanceTableId);
    let attendanceDetails: any[] = [];

    if (attendanceTable) {
        const attendanceData = await attendanceTable.getAllRows();
        attendanceDetails = attendanceData.rows.map((row) => {
            const getAttendCellText = (headerName: string) => {
                const idx = attendanceData.headers.findIndex((h) => h.includes(headerName));
                if (idx === -1) return '';

                const extractFromCell = (cellIdx: number) => {
                    if (!row.cells[cellIdx]) return '';
                    const text = (row.cells[cellIdx].text || '').trim();
                    if (text) return text;

                    const html = row.cells[cellIdx].html;
                    if (html && html.includes('<input')) {
                        const valueMatch = html.match(/value="([^"]*)"/);
                        if (valueMatch) return valueMatch[1].trim();
                    }
                    return '';
                };

                // Standard extraction
                let val = extractFromCell(idx);

                // Handle common SAP table shift (if current cell is empty but next one has data for specific headers)
                // Offset happens because of hidden columns or selection columns not mapped to headers correctly
                if (!val && idx > 1 && ['강의구분', '강사', '소속', '제목', '출결상태'].some((h) => headerName.includes(h))) {
                    val = extractFromCell(idx + 1);
                }

                return val;
            };

            return {
                section: getAttendCellText('분반'),
                date: getAttendCellText('수업일자'),
                type: getAttendCellText('강의구분'),
                lecturer: getAttendCellText('강사'),
                department: getAttendCellText('소속'),
                title: getAttendCellText('제목'),
                status: getAttendCellText('출결상태'),
                evaluation: getAttendCellText('평가'),
                remarks: getAttendCellText('비고'),
            };
        });
    }

    const getCellText = (row: any, headerName: string, headers: string[]) => {
        const idx = headers.findIndex((h) => h.includes(headerName));
        if (idx !== -1 && row.cells[idx]) {
            return (row.cells[idx].text || '').trim();
        }
        return '';
    };

    const chapelList: ChapelInfo[] = tableData.rows
        .map((row) => {
            const timeRoom = getCellText(row, '시간표', tableData.headers);
            const section = getCellText(row, '분반', tableData.headers);

            // Extract professor from something like "수 13:30-14:20 (08110-반광준)"
            const profMatch = timeRoom.match(/\(([^)]+)\)/);
            let professor = '';
            if (profMatch && profMatch[1]) {
                const parts = profMatch[1].split('-');
                professor = parts[parts.length - 1] || profMatch[1];
            }

            // Filter attendance details for this specific section
            const filteredAttendance = attendanceDetails.filter((detail) => detail.section === section);

            const attendedCount = filteredAttendance.filter((a) => a.status === '출석').length;
            const absentCount = filteredAttendance.filter((a) => a.status === '결석').length;
            const totalCount = filteredAttendance.length;

            return {
                year,
                semester,
                subjectName: '채플',
                section,
                professor: professor,
                timetable: timeRoom,
                location: getCellText(row, '강의실', tableData.headers),
                floor: getCellText(row, '층수', tableData.headers),
                seatNumber: getCellText(row, '좌석번호', tableData.headers),
                totalAttendance: totalCount.toString(),
                attendedAttendance: attendedCount.toString(),
                absentAttendance: getCellText(row, '결석일수', tableData.headers) || absentCount.toString(),
                result: getCellText(row, '성적', tableData.headers) || '진행중',
                remarks: getCellText(row, '비고', tableData.headers),
                attendanceDetails: filteredAttendance,
            };
        })
        .filter((item) => item.section !== '');

    return NextResponse.json<UsaintApiResponse<ChapelInfo | null>>({
        success: true,
        data: chapelList[0] || null,
    });
});
