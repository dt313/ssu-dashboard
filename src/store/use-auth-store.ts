import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    appSessionId?: string;
    setAppSessionId: (id: string) => void;
    loginWithUsaint: (id: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            appSessionId: '',
            setAppSessionId: (appSessionId: string) => set({ appSessionId }),
            loginWithUsaint: (appSessionId: string) => {
                set({ appSessionId, isAuthenticated: true });
            },
            logout: () =>
                set({
                    isAuthenticated: false,
                    appSessionId: '',
                }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
