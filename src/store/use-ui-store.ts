import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BackgroundType } from '@/components/background-selector';

interface UIState {
    bgType: BackgroundType;
    setBgType: (bgType: BackgroundType) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            bgType: 'dashed-grid',
            setBgType: (bgType: BackgroundType) => set({ bgType }),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
