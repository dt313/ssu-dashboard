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
} from '@/types/api';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UsaintState {
    studentInfo: StudentInfo | null;
    tuitionInfo: TuitionInfo[] | null;
    tuitionNotice: TuitionNotice | null;
    timetableInfo: string[][] | null;
    graduationInfo: GraduationInfo | null;
    chapelInfo: ChapelInfo | null;
    categoryGrade: CategoryGradeInfo | null;
    semesterGrade: SemesterGradeInfo | null;
    scholarshipInfo: ScholarshipInfo[] | null;
    subjectGradeDetail: SubjectGradeDetailList | null;

    setStudentInfo: (info: StudentInfo | null) => void;
    setTuitionInfo: (info: TuitionInfo[] | null) => void;
    setTuitionNotice: (info: TuitionNotice | null) => void;
    setTimetableInfo: (info: string[][] | null) => void;
    setGraduationInfo: (info: GraduationInfo | null) => void;
    setChapelInfo: (info: ChapelInfo | null) => void;
    setCategoryGrade: (info: CategoryGradeInfo | null) => void;
    setSemesterGrade: (info: SemesterGradeInfo | null) => void;
    setScholarshipInfo: (info: ScholarshipInfo[] | null) => void;
    setSubjectGradeDetail: (info: SubjectGradeDetailList | null) => void;

    clearUsaintData: () => void;
}

export const useUsaintStore = create<UsaintState>()(
    persist(
        (set) => ({
            studentInfo: null,
            tuitionInfo: null,
            tuitionNotice: null,
            timetableInfo: null,
            graduationInfo: null,
            chapelInfo: null,
            categoryGrade: null,
            semesterGrade: null,
            scholarshipInfo: null,
            subjectGradeDetail: null,

            setStudentInfo: (studentInfo) => set({ studentInfo }),
            setTuitionInfo: (tuitionInfo) => set({ tuitionInfo }),
            setTuitionNotice: (tuitionNotice) => set({ tuitionNotice }),
            setTimetableInfo: (timetableInfo) => set({ timetableInfo }),
            setGraduationInfo: (graduationInfo) => set({ graduationInfo }),
            setChapelInfo: (chapelInfo) => set({ chapelInfo }),
            setCategoryGrade: (categoryGrade) => set({ categoryGrade }),
            setSemesterGrade: (semesterGrade) => set({ semesterGrade }),
            setScholarshipInfo: (scholarshipInfo) => set({ scholarshipInfo }),
            setSubjectGradeDetail: (subjectGradeDetail) => set({ subjectGradeDetail }),

            clearUsaintData: () =>
                set({
                    studentInfo: null,
                    tuitionInfo: null,
                    tuitionNotice: null,
                    timetableInfo: null,
                    graduationInfo: null,
                    chapelInfo: null,
                    categoryGrade: null,
                    semesterGrade: null,
                    scholarshipInfo: null,
                    subjectGradeDetail: null,
                }),
        }),
        {
            name: 'usaint-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
