import axios, { isAxiosError } from 'axios';
import { UsaintApiRequest, UsaintApiResponse } from '@/types/api';

export const callUsaintApi = async <T = Record<string, never>>(data: UsaintApiRequest): Promise<UsaintApiResponse<T>> => {
    try {
        const response = await axios.post<UsaintApiResponse<T>>('/api/usaint', data);
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};
