import { NextResponse } from 'next/server';
import redis from '@/utils/redis';
import { withErrorHandling } from '@/utils/api-handler';

export const GET = withErrorHandling(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
        return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
    }

    const syncKey = `grade_sync_status:${studentId}`;
    const progressKey = `grade_sync_progress:${studentId}`;
    const dataKey = `grade_sync_data:${studentId}`;

    const [status, progress, rawData] = await Promise.all([
        redis.get(syncKey),
        redis.get(progressKey),
        redis.get(dataKey)
    ]);

    return NextResponse.json({
        success: true,
        data: {
            status: status || 'idle',
            progress: progress || '',
            result: rawData ? JSON.parse(rawData) : null
        }
    });
});
