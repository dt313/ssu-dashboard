import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ChapelInfo, GraduationInfo, StudentInfo, TuitionInfo, TuitionNotice, CategoryGradeInfo } from '@/types/api';

interface UsaintState {
    studentInfo: StudentInfo | null;
    tuitionInfo: TuitionInfo[] | null;
    tuitionNotice: TuitionNotice | null;
    timetableInfo: string[][] | null;
    graduationInfo: GraduationInfo | null;
    chapelInfo: ChapelInfo | null;
    categoryGrade: CategoryGradeInfo | null;
    
    setStudentInfo: (info: StudentInfo | null) => void;
    setTuitionInfo: (info: TuitionInfo[] | null) => void;
    setTuitionNotice: (info: TuitionNotice | null) => void;
    setTimetableInfo: (info: string[][] | null) => void;
    setGraduationInfo: (info: GraduationInfo | null) => void;
    setChapelInfo: (info: ChapelInfo | null) => void;
    setCategoryGrade: (info: CategoryGradeInfo | null) => void;
    
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

            setStudentInfo: (studentInfo) => set({ studentInfo }),
            setTuitionInfo: (tuitionInfo) => set({ tuitionInfo }),
            setTuitionNotice: (tuitionNotice) => set({ tuitionNotice }),
            setTimetableInfo: (timetableInfo) => set({ timetableInfo }),
            setGraduationInfo: (graduationInfo) => set({ graduationInfo }),
            setChapelInfo: (chapelInfo) => set({ chapelInfo }),
            setCategoryGrade: (categoryGrade) => set({ categoryGrade }),

            clearUsaintData: () => set({
                studentInfo: null,
                tuitionInfo: null,
                tuitionNotice: null,
                timetableInfo: null,
                graduationInfo: null,
                chapelInfo: null,
                categoryGrade: null,
            }),
        }),
        {
            name: 'usaint-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
