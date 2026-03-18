import { ApiErrorResponse, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapComboBox, SapTable, SapWdaClient } from 'usaint-lib';

import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';

const YEAR_COMBOBOX_ID = 'ZCMW_PERIOD_RE.ID_0DC742680F42DA9747594D1AE51A0C69:VIW_MAIN.PERYR';
const PREV_BTN_ID = 'ZCMW_PERIOD_RE.ID_0DC742680F42DA9747594D1AE51A0C69:VIW_MAIN.BUTTON_PREV';
const MAIN_TABLE_ID = 'ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1';
const DETAIL_TABLE_ID = 'ZCMB3W0017.ID_0001:V_DETAIL.TABLE';
const DETAIL_BTN_PREFIX = 'ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1_BUTTON';
const DETAIL_CLOSE_BTN_ID = 'ZCMB3W0017.ID_0001:W_POPUP.WDBUTTON_5';

type SapComboBoxElement = SapComboBox & { el?: { attribs: { value: string } }[] };

function getCurrentYear(wda: SapWdaClient) {
    const yearCombobox = wda.getControlById<SapComboBoxElement>(YEAR_COMBOBOX_ID);
    const yearText = yearCombobox?.el?.[0]?.attribs?.value ?? '';
    const year = yearText.replace('학년도', '').trim();
    return year || null;
}

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId, admissionYear, graduatedYear } = await request.json();

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
            { error: 'Failed to initialize grade session.', html: wda.$.html() },
            { status: 401 },
        );
    }

    // If graduatedYear is provided and current year > graduatedYear, select to graduatedYear
    if (graduatedYear) {
        const currentYear = getCurrentYear(wda);
        if (currentYear && parseInt(currentYear) > parseInt(graduatedYear)) {
            const yearCombo = wda.getControlById<SapComboBox>(YEAR_COMBOBOX_ID);
            if (yearCombo) {
                await yearCombo.selectByKey(graduatedYear);
            }
        }
    }

    const results: { header: string[]; data: string[][] }[] = [];

    while (true) {
        // 1. Check current year — stop if below admission year or above graduated year
        const year = getCurrentYear(wda);

        if (!year || parseInt(year) < Number(admissionYear)) break;
        if (graduatedYear && parseInt(year) > parseInt(graduatedYear)) break;

        // 2. Get main table — skip year if table is missing or empty
        const table = wda.getControlById<SapTable>(MAIN_TABLE_ID);
        if (!table) {
            await wda.getControlById<SapButton>(PREV_BTN_ID)?.press();
            continue;
        }

        // 3. Fetch all rows once — reuse for both length and data
        const { rows } = await table.getAllRows();
        if (rows.length === 0) {
            await wda.getControlById<SapButton>(PREV_BTN_ID)?.press();
            continue;
        }

        // 4. Iterate each row's detail button sequentially (SAP WDA is stateful)
        for (let i = 1; i <= rows.length; i++) {
            const detailBtn = wda.getControlById<SapButton>(`${DETAIL_BTN_PREFIX}.${i}`);
            if (!detailBtn) continue;

            await detailBtn.press();

            const detailTable = wda.getControlById<SapTable>(DETAIL_TABLE_ID);
            if (!detailTable) {
                console.warn(`No detail table at row ${i}`);
                continue;
            }

            const detailData = await detailTable.getAllRows();
            if (detailData) {
                const header = detailTable.getHeaders();
                const data = detailData.rows.map((row) => row.cells.map((cell) => cell.text));

                results.push({ header, data });
            }

            await wda.getControlById<SapButton>(DETAIL_CLOSE_BTN_ID)?.press();
        }

        await wda.getControlById<SapButton>(PREV_BTN_ID)?.press();
    }

    return NextResponse.json<UsaintApiResponse<{ header: string[]; data: string[][] }[]>>({
        success: true,
        data: results,
    });
});
