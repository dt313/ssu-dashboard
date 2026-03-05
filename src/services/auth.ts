import axios, { isAxiosError } from 'axios';
import { UsaintLoginRequest, UsaintLoginResponse } from '@/types/api';

export const loginWithUsaint = async (data: UsaintLoginRequest): Promise<UsaintLoginResponse> => {
    try {
        const response = await axios.post<UsaintLoginResponse>('/api/auth/usaint', data);
        return response.data;
    } catch (error) {
        console.error('Error logging in with u-SAINT:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};
