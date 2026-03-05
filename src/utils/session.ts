import { redis } from './redis';

const SESSION_TTL = 60 * 60 * 24; // 24 hours in seconds

export async function createSession(cookieJar: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    await redis.set(sessionId, cookieJar, 'EX', SESSION_TTL);
    console.log(`Session created in Redis: ${sessionId}`);
    return sessionId;
}

export async function getSession(sessionId: string): Promise<string | null> {
    const session = await redis.get(sessionId);
    if (!session) {
        console.warn(`Session not found in Redis for ID: ${sessionId}`);
    }
    return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
    await redis.del(sessionId);
    console.log(`Session deleted from Redis: ${sessionId}`);
}
