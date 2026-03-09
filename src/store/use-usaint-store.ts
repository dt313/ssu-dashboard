import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ChapelInfo, GraduationInfo, StudentInfo, TuitionInfo } from '@/types/api';

interface UsaintState {
    studentInfo: StudentInfo | null;
    tuitionInfo: TuitionInfo[] | null;
    timetableInfo: string[][] | null;
    graduationInfo: GraduationInfo | null;
    chapelInfo: ChapelInfo[] | null;
    
    setStudentInfo: (info: StudentInfo | null) => void;
    setTuitionInfo: (info: TuitionInfo[] | null) => void;
    setTimetableInfo: (info: string[][] | null) => void;
    setGraduationInfo: (info: GraduationInfo | null) => void;
    setChapelInfo: (info: ChapelInfo[] | null) => void;
    
    clearUsaintData: () => void;
}

export const useUsaintStore = create<UsaintState>()(
    persist(
        (set) => ({
            studentInfo: null,
            tuitionInfo: null,
            timetableInfo: null,
            graduationInfo: null,
            chapelInfo: null,

            setStudentInfo: (studentInfo) => set({ studentInfo }),
            setTuitionInfo: (tuitionInfo) => set({ tuitionInfo }),
            setTimetableInfo: (timetableInfo) => set({ timetableInfo }),
            setGraduationInfo: (graduationInfo) => set({ graduationInfo }),
            setChapelInfo: (chapelInfo) => set({ chapelInfo }),

            clearUsaintData: () => set({
                studentInfo: null,
                tuitionInfo: null,
                timetableInfo: null,
                graduationInfo: null,
                chapelInfo: null,
            }),
        }),
        {
            name: 'usaint-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
