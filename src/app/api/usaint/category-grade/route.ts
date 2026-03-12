// app/api/grades/category/route.ts
import { ozDecode, ozEncode } from '@/lib/oz-protocol';
import { ApiErrorResponse, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

// tách ra file riêng bên dưới

async function getGradeByCategory(studentId: string): Promise<Array<Record<string, string>>> {
    const body = ozEncode('zcmw8030secu.odi', {
        ADMIN: '000000000000',
        UNAME: studentId,
    });

    const res = await fetch('https://office.ssu.ac.kr/oz70/server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: new Uint8Array(body) as unknown as BodyInit,
    });

    if (!res.ok) throw new Error(`OZ server error: ${res.status}`);

    const responseBytes = Buffer.from(await res.arrayBuffer());
    const decoded = ozDecode(responseBytes);
    return decoded['ITAB']?.[0] ?? [];
}

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId } = await request.json();
    if (!appSessionId) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Missing session ID' }, { status: 400 });
    }

    const storedCookie = await getSession(appSessionId);
    if (!storedCookie) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Session expired.' }, { status: 401 });
    }

    // 1️⃣ SAP WDA → lấy ozId (code cũ của bạn, giữ nguyên)
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW8030n', storedCookie);
    const initResult = await wda.initialize();
    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Failed to initialize.' }, { status: 401 });
    }

    const printButton = wda.getControlById<SapButton>('ZCMW8030.ID_0001:MAIN.BTN_PRINT');
    if (!printButton) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Print button not found.' }, { status: 500 });
    }

    const result = await printButton.press();
    const ozUrl = (result as { isSuccess: boolean; newWindowUrl: string }).newWindowUrl;
    if (!ozUrl) {
        return NextResponse.json<ApiErrorResponse>({ error: 'OZ URL not found.' }, { status: 500 });
    }

    const pValue = new URL(ozUrl).searchParams.get('pValue');
    const ozId = pValue?.split(',')[1]; // studentId = index 1
    if (!ozId) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Cannot parse ozId from pValue.' }, { status: 500 });
    }

    // 2️⃣ OZ binary protocol → data (theo Dart: OzViewerRequest.getGradeByCategory)
    const rows = await getGradeByCategory(ozId);

    // 3️⃣ Map fields (theo Dart code)
    const subjects = rows.map((row) => {
        const [yearStr, semRaw] = (row['HUKGI'] ?? '').split('―');
        return {
            yearSemester: { year: parseInt(yearStr) || 0, semester: semRaw ?? '' },
            code: row['SM_ID'] ?? '',
            name: row['SM_TEXT'] ?? '',
            credit: parseFloat(row['CPATTEMP'] ?? '0'),
            grade: row['GRADE'] ?? '',
            score: row['GRADESYMBOL'] ?? '',
            category: row['COMPL_TEXT'] ?? '',
            isPassFail: row['GRADESCALE'] === 'PF',
            info: row['SM_INFO'] ?? '',
        };
    });

    // 4️⃣ Group by semester
    const bySemester = subjects.reduce(
        (acc, s) => {
            const key = `${s.yearSemester.year}-${s.yearSemester.semester}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(s);
            return acc;
        },
        {} as Record<string, typeof subjects>,
    );

    return NextResponse.json<UsaintApiResponse<any>>({
        success: true,
        data: { subjects, bySemester, total: subjects.length },
    });
});
