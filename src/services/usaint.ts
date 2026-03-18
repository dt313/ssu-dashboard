import { useUsaintStore } from '@/store/use-usaint-store';
import {
    CategoryGradeInfo,
    ChapelInfo,
    GraduationInfo,
    ScholarshipInfo,
    SemesterGradeInfo,
    StudentInfo,
    SubjectGradeDetailList,
    TuitionInfo,
    TuitionNotice,
    UsaintApiRequest,
    UsaintApiResponse,
} from '@/types/api';
import axios, { isAxiosError } from 'axios';

const handleApiError = (error: unknown, apiName: string) => {
    console.error(`Error calling ${apiName}:`, error);
    if (isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData && typeof responseData === 'object') {
            throw { ...responseData, status: error.response?.status };
        }
        throw error;
    }
    throw error;
};

export const callStudentInfoApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<StudentInfo>> => {
    try {
        const response = await axios.post<UsaintApiResponse<StudentInfo>>('/api/usaint/info', data);
        if (response.data.success) {
            useUsaintStore.getState().setStudentInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT API');
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
        throw handleApiError(error, 'u-SAINT Tuition API');
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
        throw handleApiError(error, 'u-SAINT Tuition Notice API');
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
        throw handleApiError(error, 'u-SAINT Timetable API');
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
        throw handleApiError(error, 'u-SAINT Graduation API');
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
        throw handleApiError(error, 'u-SAINT Chapel API');
    }
};

export const callCategoryGrade = async (data: UsaintApiRequest): Promise<UsaintApiResponse<CategoryGradeInfo>> => {
    try {
        const response = await axios.post<UsaintApiResponse<CategoryGradeInfo>>('/api/usaint/category-grade', data);
        if (response.data.success) {
            useUsaintStore.getState().setCategoryGrade(response.data.data);
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT category Grade API');
    }
};

export const callSemesterGradeApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<SemesterGradeInfo>> => {
    try {
        const response = await axios.post<UsaintApiResponse<SemesterGradeInfo>>('/api/usaint/grade-by-semester', data);
        if (response.data.success) {
            useUsaintStore.getState().setSemesterGrade(response.data.data);
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT Semester Grade API');
    }
};

export const callSemesterGradeOldVersionApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<unknown>> => {
    try {
        const response = await axios.post<UsaintApiResponse<unknown>>('/api/usaint/grade-by-semester-old', data);

        return response.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT Semester Grade Old Version API');
    }
};

export const callScholarshipApi = async (data: UsaintApiRequest): Promise<UsaintApiResponse<ScholarshipInfo[]>> => {
    try {
        const response = await axios.post<UsaintApiResponse<ScholarshipInfo[]>>('/api/usaint/scholarship', data);
        if (response.data.success) {
            useUsaintStore.getState().setScholarshipInfo(response.data.data);
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT Scholarship API');
    }
};

export const callGradeBySemesterDetailApi = async ({
    appSessionId,
    year,
    semester,
    subjectCode,
}: {
    appSessionId: string;
    year: string;
    semester: string;
    subjectCode: string;
}): Promise<UsaintApiResponse<unknown>> => {
    try {
        const response = await axios.post<UsaintApiResponse<unknown>>('/api/usaint/grade-by-semester-detail', {
            appSessionId,
            year,
            semester,
            subjectCode,
        });

        return response.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT Grade Detail API');
    }
};

export const callSubjectGradeDetailApi = async ({
    appSessionId,
    admissionYear,
    graduatedYear,
}: {
    appSessionId: string;
    admissionYear: string;
    graduatedYear?: string;
}): Promise<SubjectGradeDetailList> => {
    try {
        const response = await axios.post<UsaintApiResponse<SubjectGradeDetailList>>(
            '/api/usaint/subject-grade-detail',
            {
                appSessionId,
                admissionYear,
                graduatedYear,
            },
        );

        if (response.data.success) {
            useUsaintStore.getState().setSubjectGradeDetail(response.data.data);
        }

        return response.data.data;
    } catch (error) {
        throw handleApiError(error, 'u-SAINT Subject Grade Detail API');
    }
};
