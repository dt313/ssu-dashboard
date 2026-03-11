import { ApiErrorResponse, StudentInfo, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';
import { getControlValue } from '@/utils/usaint-parser';

const CONTROL_IDS = {
    STUDENT_ID: 'ZCMW1001.ID_0001:VIW_DEFAULT.STUDENT12',
    LAST_NAME: 'ZCMW1001.ID_0001:VIW_DEFAULT.NACHN',
    FIRST_NAME: 'ZCMW1001.ID_0001:VIW_DEFAULT.VORNA',
    STATUS: 'ZCMW1001.ID_0001:VIW_DEFAULT.STAT',
    FACULTY: 'ZCMW1001.ID_0001:VIW_DEFAULT.COLEG_TXT',
    DEPARTMENT: 'ZCMW1001.ID_0001:VIW_DEFAULT.DEPT_TXT',
    CLASS: 'ZCMW1001.ID_0001:VIW_DEFAULT.TITEL',
    YEAR: 'ZCMW1001.ID_0001:VIW_DEFAULT.CMSTYEAR',
    SEMESTER: 'ZCMW1001.ID_0001:VIW_DEFAULT.ZSCHTERM',
    ENGLISH_NAME: 'ZCMW1001.ID_0001:VIW_DEFAULT.RUFNM',
    HANJA_NAME: 'ZCMW1001.ID_0001:VIW_DEFAULT.BIRTHNAME',
    EMAIL: 'ZCMW1001.ID_0001:VIW_DEFAULT.SMTP_ADDR',
    AVATAR: 'ZCMW1001.ID_0001:VIW_DEFAULT.ST_IMAGE',
    ADMISSION_DATE: 'ZCMW1001.ID_0001:VIW_DEFAULT.TC_DEFAULT_APPLY_DT',
};

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId }: UsaintApiRequest = await request.json();

    if (!appSessionId) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1️⃣ Get cookies from Redis
    const storedCookie = await getSession(appSessionId);
    if (!storedCookie) {
        return NextResponse.json<ApiErrorResponse>(
            { error: 'Session expired or invalid. Please login again.' },
            { status: 401 },
        );
    }

    // 2️⃣ Initialize WDA Client for ZCMW1001n (Student Info)
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW1001n', storedCookie);

    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize Student Info session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    // // write html to file for debugging
    const fs = require('fs');
    fs.writeFileSync('student-info.html', wda.$.html());

    // 3️⃣ Extract data
    const lastName = getControlValue(wda, CONTROL_IDS.LAST_NAME);
    const firstName = getControlValue(wda, CONTROL_IDS.FIRST_NAME);

    // Extract avatar URL from lsdata
    let avatarUrl = '';
    const avatarSelector = `img[id="${CONTROL_IDS.AVATAR}"]`;
    const avatarEl = wda.$(avatarSelector);
    if (avatarEl.length > 0) {
        const lsDataStr = avatarEl.attr('lsdata') || '';
        // lsdata is like "{1:'100px',2:'110px',3:'http\x3a\x2f\x2f...',19:'TOP'}"
        // We can use a regex to extract the URL in field 3
        const urlMatch = lsDataStr.match(/3:'([^']+)'/);
        if (urlMatch && urlMatch[1]) {
            avatarUrl = urlMatch[1].replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        }
    }

    const studentInfo: StudentInfo = {
        studentId: getControlValue(wda, CONTROL_IDS.STUDENT_ID),
        name: `${lastName}${firstName}`.trim(),
        status: getControlValue(wda, CONTROL_IDS.STATUS),
        faculty: getControlValue(wda, CONTROL_IDS.FACULTY),
        department: getControlValue(wda, CONTROL_IDS.DEPARTMENT),
        class: getControlValue(wda, CONTROL_IDS.CLASS),
        year: getControlValue(wda, CONTROL_IDS.YEAR),
        semester: getControlValue(wda, CONTROL_IDS.SEMESTER),
        englishName: getControlValue(wda, CONTROL_IDS.ENGLISH_NAME),
        hanjaName: getControlValue(wda, CONTROL_IDS.HANJA_NAME),
        admissionDate: getControlValue(wda, CONTROL_IDS.ADMISSION_DATE),
        avatar: avatarUrl,
    };

    // 4️⃣ Return the data
    return NextResponse.json<UsaintApiResponse<StudentInfo>>({
        success: true,
        data: studentInfo,
    });
});
