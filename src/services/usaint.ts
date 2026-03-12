import { useUsaintStore } from '@/store/use-usaint-store';
import {
    ChapelInfo,
    GraduationInfo,
    StudentInfo,
    TimetableInfo,
    TuitionInfo,
    TuitionNotice,
    UsaintApiRequest,
    UsaintApiResponse,
} from '@/types/api';
import axios, { isAxiosError } from 'axios';

export const callStudentInfoApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<StudentInfo>> => {
    try {
        const response = await axios.post<UsaintApiResponse<StudentInfo>>('/api/usaint/info', data);
        if (response.data.success) {
            useUsaintStore.getState().setStudentInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};

export const callTuitionApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<TuitionInfo[]>> => {
    try {
        const response = await axios.post<UsaintApiResponse<TuitionInfo[]>>('/api/usaint/tuition', data);
        if (response.data.success) {
            useUsaintStore.getState().setTuitionInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT Tuition API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};

export const callTuitionNoticeApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<TuitionNotice>> => {
    try {
        const response = await axios.post<UsaintApiResponse<TuitionNotice>>('/api/usaint/tuition-notice', data);
        if (response.data.success) {
            useUsaintStore.getState().setTuitionNotice(response.data.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT Tuition Notice API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};

export const callTimetableApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<string[][]>> => {
    try {
        const response = await axios.post<UsaintApiResponse<string[][]>>('/api/usaint/timetable', data);
        if (response.data.success) {
            useUsaintStore.getState().setTimetableInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT Timetable API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};

export const callGraduationApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<GraduationInfo>> => {
    try {
        const response = await axios.post<UsaintApiResponse<GraduationInfo>>('/api/usaint/graduation', data);
        if (response.data.success) {
            useUsaintStore.getState().setGraduationInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT Graduation API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};

export const callChapelApi = async ({
    appSessionId,
    year,
    semester,
}: {
    appSessionId: string;
    year?: string;
    semester?: string;
}): Promise<UsaintApiResponse<ChapelInfo | null>> => {
    try {
        const response = await axios.post<UsaintApiResponse<ChapelInfo | null>>('/api/usaint/chapel', {
            appSessionId,
            year,
            semester,
        });
        if (response.data.success) {
            useUsaintStore.getState().setChapelInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT Chapel API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};

export const callCategoryGrade = async (data: UsaintApiRequest): Promise<UsaintApiResponse<any>> => {
    try {
        console.log('App session', { data });
        const response = await axios.post<UsaintApiResponse<any>>('/api/usaint/category-grade', data);
        if (response.data.success) {
            useUsaintStore.getState().setCategoryGrade(response.data.data);
        }

        console.log({ data: response.data });
        return response.data;
    } catch (error) {
        console.error('Error calling u-SAINT category Grade API:', error);
        if (isAxiosError(error)) {
            throw error.response?.data || error;
        }
        throw error;
    }
};
