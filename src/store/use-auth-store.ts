import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useUsaintStore } from './use-usaint-store';

interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    isHydrated: boolean;
    appSessionId?: string;
    setAppSessionId: (id: string) => void;
    setHydrated: (hydrated: boolean) => void;
    loginWithUsaint: (id: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            isHydrated: false,
            appSessionId: '',
            setAppSessionId: (appSessionId: string) => set({ appSessionId }),
            setHydrated: (isHydrated: boolean) => set({ isHydrated }),
            loginWithUsaint: (appSessionId: string) => {
                set({ appSessionId, isAuthenticated: true });
            },
            logout: () => {
                set({
                    isAuthenticated: false,
                    appSessionId: '',
                });
                useUsaintStore.getState().clearUsaintData();
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        },
    ),
);
