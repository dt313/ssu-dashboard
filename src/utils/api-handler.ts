import { NextResponse } from 'next/server';
import { getErrorMessage } from './get-error-message';
import { ApiErrorResponse } from '@/types/api';

export type ApiHandler = (request: Request) => Promise<NextResponse>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
    return async (request: Request) => {
        try {
            return await handler(request);
        } catch (error) {
            console.error('API Error handled by wrapper:', error);
            
            // Chuyển đổi error về kiểu mà getErrorMessage có thể chấp nhận mà không dùng keyword 'unknown' hay 'any'
            const safeError = error instanceof Error || typeof error === 'string' ? error : null;
            const message = getErrorMessage(safeError, 'Internal Server Error');
            
            // Tự động xác định status code dựa trên nội dung lỗi
            let status = 500;
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('required') || lowerMessage.includes('missing')) {
                status = 400;
            } else if (
                lowerMessage.includes('expired') || 
                lowerMessage.includes('login') || 
                lowerMessage.includes('invalid') ||
                lowerMessage.includes('failed')
            ) {
                status = 401;
            }

            return NextResponse.json<ApiErrorResponse>(
                { error: message },
                { status }
            );
        }
    };
}
