import { ApiErrorResponse, UsaintApiResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { SapButton, SapComboBox, SapTable, SapWdaClient } from 'usaint-lib';
import { withErrorHandling } from '@/utils/api-handler';
import { getSession } from '@/utils/session';
import redis from '@/utils/redis';

/**
 * Background worker logic - Fire and Forget
 * This function handles the slow sequential scraping
 */
async function performBackgroundSync(appSessionId: string, admissionYear: string, studentId: string) {
    const syncKey = `grade_sync_status:${studentId}`;
    const progressKey = `grade_sync_progress:${studentId}`;
    const dataKey = `grade_sync_data:${studentId}`;

    try {
        await redis.set(syncKey, 'processing', 'EX', 1800); // 1 hour timeout
        await redis.set(progressKey, 'Initializing SAP session...', 'EX', 1800);

        const storedCookie = await getSession(appSessionId);
        if (!storedCookie) throw new Error('Session cookie expired');

        const wda = new SapWdaClient('https://ecc.ssu.ac.kr:8443', 'ZCMB3W0017', storedCookie);
        const initResult = await wda.initialize();
        if (!initResult.isSuccess) throw new Error('Failed to initialize SAP');

        const preButtonId = 'ZCMW_PERIOD_RE.ID_0DC742680F42DA9747594D1AE51A0C69:VIW_MAIN.BUTTON_PREV';
        const peryrId = 'ZCMW_PERIOD_RE.ID_0DC742680F42DA9747594D1AE51A0C69:VIW_MAIN.PERYR';
        
        const allResults = [];
        let detailHeader: string[] | undefined = [];

        while (true) {
            const yearCombobox = wda.getControlById<SapComboBox>(peryrId);
            const yearText = (yearCombobox as any)?.el?.[0]?.attribs?.value || '';
            const year = yearText.replace('학년도', '').trim();

            if (!year || parseInt(year) < Number(admissionYear)) break;

            await redis.set(progressKey, `Processing year ${year}...`);

            const table = wda.getControlById<SapTable>('ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1');
            if (!table) {
                const preButton = wda.getControlById<SapButton>(preButtonId);
                await preButton?.press();
                continue;
            }

            const tableData = await table.getAllRows();
            const tableLength = tableData.rows.length;

            if (tableLength === 0) {
                const preButton = wda.getControlById<SapButton>(preButtonId);
                await preButton?.press();
                continue;
            }

            const semesterResults = [];
            for (let i = 1; i <= tableLength; i++) {
                const detailBtn = wda.getControlById<SapButton>(`ZCMB3W0017.ID_0001:VIW_MAIN.TABLE_1_BUTTON.${i}`);
                if (!detailBtn) continue;

                await redis.set(progressKey, `Fetching details for subject ${i}/${tableLength} in ${year}`);
                await detailBtn?.press();

                const detailTable = wda.getControlById<SapTable>('ZCMB3W0017.ID_0001:V_DETAIL.TABLE');
                const detailData = await detailTable?.getVisibleRows();

                if (!detailHeader || detailHeader.length === 0) {
                    detailHeader = await detailTable?.getHeaders();
                }

                if (detailData) {
                    const mappedRows = detailData.rows.map(r => r.cells.map(c => c.text));
                    semesterResults.push({
                        index: i,
                        details: mappedRows
                    });
                }
            }

            allResults.push({
                year,
                subjects: semesterResults
            });

            // Go to previous year
            const preButton = wda.getControlById<SapButton>(preButtonId);
            await preButton?.press();
        }

        // Save final data and mark as completed
        await redis.set(dataKey, JSON.stringify({ results: allResults, headers: detailHeader }), 'EX', 3600);
        await redis.set(syncKey, 'completed', 'EX', 3600);
        await redis.set(progressKey, 'Sync finished successfully');

    } catch (error: any) {
        console.error('Background Sync Error:', error);
        await redis.set(syncKey, 'failed', 'EX', 3600);
        await redis.set(progressKey, `Error: ${error.message}`);
    }
}

export const POST = withErrorHandling(async (request: Request) => {
    const { appSessionId, admissionYear, studentId } = await request.json();

    if (!appSessionId || !studentId) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Missing required parameters' }, { status: 400 });
    }

    const currentStatus = await redis.get(`grade_sync_status:${studentId}`);
    if (currentStatus === 'processing') {
        return NextResponse.json({ success: true, message: 'Sync is already running' });
    }

    // FIRE AND FORGET
    // We start the promise but DON'T await it
    performBackgroundSync(appSessionId, admissionYear, studentId);

    return NextResponse.json<UsaintApiResponse<any>>({
        success: true,
        data: {
            message: 'Background sync started',
            studentId
        },
    });
});
