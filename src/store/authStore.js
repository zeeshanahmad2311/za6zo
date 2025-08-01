// src/store/authStore.js
import { create } from 'zustand'; // Changed from default import

const useAuthStore = create((set) => ({
  user: null,
  isDriver: false,
  
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null, isDriver: false }),
  setRole: (isDriver) => set({ isDriver })
}));

export default useAuthStore;