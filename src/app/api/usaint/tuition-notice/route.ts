import { ApiErrorResponse, TuitionNotice, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapInput, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const TUITION_NOTICE_ID = {
    MANI_TABLE: 'ZCMW6530.ID_0001:VIEW_LIST.TABLE',
    BANK_TIME: 'ZCMW6530.ID_0001:VIEW_LIST.TV_PERID',
    ADDTIONAL_TIME: 'ZCMW6530.ID_0001:VIEW_LIST.IN_ZDATE_ADD',
    BANK_BRAND: 'ZCMW6530.ID_0001:VIEW_LIST.IN_BANKA',
    BANK_NUMBER: 'ZCMW6530.ID_0001:VIEW_LIST.IN_ACCT',
    BANK_ACCOUNT_NAME: 'ZCMW6530.ID_0001:VIEW_LIST.IN_ACCI',
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

    // Initialize WDA for Tuition Notice (ZCMW6530)
    const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMW6530', storedCookie);
    const initResult = await wda.initialize();

    if (!initResult.isSuccess) {
        return NextResponse.json<ApiErrorResponse>(
            {
                error: 'Failed to initialize tuition notice session.',
                html: wda.$.html(),
            },
            { status: 401 },
        );
    }

    const table = wda.getControlById<SapTable>(TUITION_NOTICE_ID.MANI_TABLE);

    if (!table) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Tuition table not found.' }, { status: 500 });
    }

    const tableData = await table.getVisibleRows();
    const final: {
        mandatory: string[];
        optional: string[];
    } = {
        mandatory: [],
        optional: [],
    };

    tableData.rows.map((r) => {
        if (r.index === 4) {
            final.mandatory = r.cells.slice(3).map((c) => c.text);
        }
        if (r.index === 5) {
            final.optional = r.cells.map((c) => c.text);
        }
    });

    const bankTime = wda.getControlById<SapInput>(TUITION_NOTICE_ID.BANK_TIME)?.value || '';
    const additionalTime = wda.getControlById<SapInput>(TUITION_NOTICE_ID.ADDTIONAL_TIME)?.value || '';
    const bankBrand = wda.getControlById<SapInput>(TUITION_NOTICE_ID.BANK_BRAND)?.value || '';
    const bankNumber = wda.getControlById<SapInput>(TUITION_NOTICE_ID.BANK_NUMBER)?.value || '';
    const bankAccountName = wda.getControlById<SapInput>(TUITION_NOTICE_ID.BANK_ACCOUNT_NAME)?.value || '';

    const result = {
        ...final,
        bankTime,
        additionalTime,
        bankBrand,
        bankNumber,
        bankAccountName,
    };

    return NextResponse.json<UsaintApiResponse<TuitionNotice>>({
        success: true,
        data: result ?? null,
    });
});
