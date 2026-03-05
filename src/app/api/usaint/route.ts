import { NextResponse } from 'next/server';
import { SapWdaClient } from 'usaint-lib';

import { UsaintApiRequest, UsaintApiResponse, ApiErrorResponse } from '@/types/api';
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
        return NextResponse.json<ApiErrorResponse>({ error: 'Session expired or invalid. Please login again.' }, { status: 401 });
    }

    console.log('Waking up SSO session for appSessionId:', appSessionId);

    // 2️⃣ Trigger SSO Exchange for the ECC domain
    const ssoResponse = await fetch('https://saint.ssu.ac.kr/webSSO/sso.jsp', {
        headers: {
            Cookie: storedCookie,
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
    });

    // Collect new/refreshed cookies
    const setCookieHeader = ssoResponse.headers.get('set-cookie');
    const activeCookie = setCookieHeader ? `${storedCookie}; ${setCookieHeader}` : storedCookie;

    // 3️⃣ Initialize WDA (Tuition program ID)
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW6520n', activeCookie);

    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        console.error('WDA Initialization failed.');
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize SAP session. The session might be restricted or expired.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    console.log('WDA initialized successfully');

    return NextResponse.json<UsaintApiResponse>({
        success: true,
        data: {},
    });
});
