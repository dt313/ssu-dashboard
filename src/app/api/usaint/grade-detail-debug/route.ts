import { ApiErrorResponse, UsaintApiRequest, UsaintApiResponse } from '@/types/api';
import fs from 'fs';
import { NextResponse } from 'next/server';
import { SapButton, SapComboBox, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const GRADE_IDS = {
    TABLE: 'ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1',
    SEARCH_BTN: 'ZCMB3W0017.ID_0001:VIW_MAIN.BTN_SEARCH',
    DETAIL_BTN: (rowIndex: number) => `ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1_BTN_EDITOR.${rowIndex}`,
};

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId, admissionYear } = await request.json();

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

    const preButton = wda.getControlById<SapButton>(
        'ZCMW_PERIOD_RE.ID_0DC742680F42DA9747594D1AE51A0C69:VIW_MAIN.BUTTON_PREV',
    );
    const results = [];
    let detailHeader: string[] | undefined = [];

    while (true) {
        const yearCombobox = wda.getControlById<SapComboBox>(
            'ZCMW_PERIOD_RE.ID_0DC742680F42DA9747594D1AE51A0C69:VIW_MAIN.PERYR',
        );
        const yearText = (yearCombobox as any)?.el?.[0]?.attribs?.value || '';
        const year = yearText.replace('학년도', '');

        if (!year || parseInt(year) < Number(admissionYear)) break;

        const table = wda.getControlById<SapTable>('ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1');

        if (!table) {
            preButton?.press();
            continue;
        }

        const tableLength = (await table.getAllRows()).rows.length;

        if (tableLength === 0) {
            preButton?.press();
            continue;
        }

        for (let i = 1; i <= tableLength; i++) {
            const detailBtn = wda.getControlById<SapButton>(`ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1_BUTTON.${i}`);
            if (!detailBtn) {
                continue;
            }
            await detailBtn?.press();

            const detailTable = wda.getControlById<SapTable>('ZCMB3W0017.ID_0001:V_DETAIL.TABLE');
            const detailData = await detailTable?.getVisibleRows();

            if (!detailHeader) {
                detailHeader = await detailTable?.getHeaders();
            }

            if (!detailData) continue;

            const result = detailData.rows.map((r) => {
                return r.cells.map((c) => {
                    return c.text;
                });
            });

            results.push(result);
        }

        console.log({ results });
        await preButton?.press();
    }

    return NextResponse.json<UsaintApiResponse<any>>({
        success: true,

        data: {
            results,
            detailHeader,
        },
    });
});
