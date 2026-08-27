import { create } from "zustand";

type CateringModalStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

export const useCateringModalStore = create<CateringModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
