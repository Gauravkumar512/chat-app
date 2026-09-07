import type { IUser } from "../types";
import { create } from "zustand";

interface StoreState {
    user: IUser | null
    isAuthenticated: boolean
    setUser: (user: IUser | null) => void
    clearUser: () => void
}

export const useAuthStore = create<StoreState>((set) => ({

    user: null,
    isAuthenticated: false,

    setUser: (user: IUser | null) => set({
        user,
        isAuthenticated: !!user
    }),

    clearUser: () => set({
        user: null,
        isAuthenticated: false
    })

}))
