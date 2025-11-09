// useLive2DStore.ts
import { create } from "zustand";

interface Live2DState {
  initialized: boolean;
  setInitialized: (val: boolean) => void;
}

export const useLive2DStore = create<Live2DState>((set) => ({
  initialized: false,
  setInitialized: (val) => set({ initialized: val }),
}));
