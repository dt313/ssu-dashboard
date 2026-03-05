export interface UsaintLoginRequest {
    studentId: string;
    password: string;
}

export interface UsaintLoginResponse {
    message: string;
    appSessionId: string;
}

export interface UsaintApiRequest {
    appSessionId: string;
}

export interface UsaintApiResponse<T = Record<string, never>> {
    success: boolean;
    data: T;
}

export interface ApiErrorResponse {
    error: string;
    html?: string;
}
