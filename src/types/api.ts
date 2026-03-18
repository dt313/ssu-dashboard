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
    admissionDate: string;
    avatar?: string;
    // Graduation info
    graduationCount?: string;
    graduationCertificateNumber?: string;
    graduationYear?: string;
    graduationSemester?: string;
    degreeConferralDate?: string;
    degreeNumber?: string;
    degreeName?: string;
    isEarlyGraduation?: string;
    totalGraduationRank?: string;
    totalGraduationHeadcount?: string;
    // Major info
    doubleMajor?: string;
    minor?: string;
    integratedMajor?: string;
    deepMajor?: string;
}

export interface TuitionInfo {
    year: string;
    semester: string;
    amount: string;
    scholarship: string;
    netAmount: string;
}

export interface TuitionNotice {
    mandatory: string[];
    optional: string[];
    bankTime: string;
    additionalTime: string;
    bankBrand: string;
    bankNumber: string;
    bankAccountName: string;
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

export interface ChapelAttendance {
    section: string;
    date: string;
    type: string;
    lecturer: string;
    department: string;
    title: string;
    status: string;
    evaluation: string;
    remarks: string;
}

export interface ChapelInfo {
    year: string;
    semester: string;
    subjectName: string;
    section: string;
    timetable: string;
    location: string;
    floor: string;
    seatNumber: string;
    totalAttendance: string;
    attendedAttendance: string;
    absentAttendance: string;
    result: string;
    remarks: string;
    attendanceDetails: ChapelAttendance[];
}
export interface SemesterGrade {
    year: string;
    semester: string;
    appliedCredits: string;
    earnedCredits: string;
    pfCredits: string;
    gpa: string;
    scoreSum: string;
    arithmeticAverage: string;
    semesterRank: string;
    totalRank: string;
    academicWarning: string;
    counseling: string;
    repeat: string;
}

export interface SemesterGradeSummary {
    appliedCredits: string;
    earnedCredits: string;
    scoreSum: string;
    gpa: string;
    arithmeticAverage: string;
    pfCredits: string;
}

export interface SemesterGradeInfo {
    grades: SemesterGrade[];
    summary: {
        academicRecord: SemesterGradeSummary;
        proof: SemesterGradeSummary;
    };
}

export interface GradeSubject {
    yearSemester: {
        year: number;
        semester: string;
    };
    code: string;
    name: string;
    credit: number;
    grade: string;
    score: string;
    category: string;
    isPassFail: boolean;
    info: string;
}

export interface CategoryGradeInfo {
    subjects: GradeSubject[];
    bySemester: Record<string, GradeSubject[]>;
    total: number;
}

export interface UsaintApiResponse<T = Record<string, never>> {
    success: boolean;
    data: T;
}

export interface ApiErrorResponse {
    error: string;
    html?: string;
}

export interface ScholarshipInfo {
    year: string;
    semester: string;
    type: string;
    name: string;
    status: string;
    rejectReason: string;
    amount: string;
    actualAmount: string;
    processDate: string;
}

export interface SubjectGradeDetail {
    header: string[];
    data: string[][];
}

export type SubjectGradeDetailList = SubjectGradeDetail[];
