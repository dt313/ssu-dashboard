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
export interface StudentInfo {
    studentId: string;
    name: string;
    status: string;
    faculty: string;
    department: string;
    class: string;
    year: string;
    semester: string;
    englishName: string;
    hanjaName: string;
    avatar?: string;
}

export interface TuitionInfo {
    year: string;
    semester: string;
    amount: string;
    scholarship: string;
    netAmount: string;
}

export interface TimetableInfo {
    code: string;
    name: string;
    professor: string;
    time: string;
    location: string;
    credit: string;
    type: string;
}

export interface GraduationCategory {
    domain: string;
    requirement: string;
    referenceValue: string;
    calculatedValue: string;
    difference: string;
    result: string;
    subjects: string;
}

export interface GraduationInfo {
    graduationCredits: string;
    recognizedCredits: string;
    graduationResult: string;
    graduationAuditDate: string;
    categories: GraduationCategory[];
}

export interface ChapelInfo {
    subjectName: string;
    section: string;
    professor: string;
    location: string;
    floor: string;
    seatNumber: string;
    totalAttendance: string;
    attendedAttendance: string;
    lateAttendance: string;
    absentAttendance: string;
    result: string;
    remarks: string;
}

export interface UsaintApiResponse<T = Record<string, never>> {
    success: boolean;
    data: T;
}

export interface ApiErrorResponse {
    error: string;
    html?: string;
}
