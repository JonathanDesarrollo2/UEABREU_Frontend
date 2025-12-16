import { create } from 'zustand';

interface SessionState {
  isModalOpen: boolean;
  modalCallback: (() => void) | null;
  openModal: (callback: () => void) => void;
  closeModal: () => void;
  userData: {
    sesionUser?: string;
    sesionEmail?: string;
    userStatus?: boolean;
    nivel?: number;
    studentInfo?: {
      name?: string;
      status?: boolean;
    } | null;
  } | null;
  setUserData: (userData: SessionState['userData']) => void;
  clearUserData: () => void;
}

const useSessionStore = create<SessionState>((set) => ({
  isModalOpen: false,
  modalCallback: null,
  userData: null,
  
  openModal: (callback) => {
    set({ isModalOpen: true, modalCallback: callback });
  },
  
  closeModal: () => set({ isModalOpen: false, modalCallback: null }),
  
  setUserData: (userData) => set({ userData }),
  
  clearUserData: () => set({ 
    userData: null,
    isModalOpen: false,
    modalCallback: null 
  }),
}));

export default useSessionStore;