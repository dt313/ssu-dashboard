import { NextResponse } from 'next/server';
import { SapSsoClient } from 'usaint-lib';

import { UsaintLoginRequest, UsaintLoginResponse, ApiErrorResponse } from '@/types/api';
import { withErrorHandling } from '@/utils/api-handler';
import { createSession } from '@/utils/session';

export const POST = withErrorHandling(async (request: Request) => {
    const { studentId, password }: UsaintLoginRequest = await request.json();

    if (!studentId || !password) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Student ID and password are required' }, { status: 400 });
    }

    const ssoClient = new SapSsoClient();
    const sessionString = await ssoClient.login(studentId, password);

    // Store the sensitive cookies in Redis and get a non-sensitive UUID
    const appSessionId = await createSession(sessionString);

    console.log(`Login success for ${studentId}. Created appSessionId: ${appSessionId}`);

    return NextResponse.json<UsaintLoginResponse>({
        message: 'Login successful',
        appSessionId: appSessionId,
    });
});
