'use client';

import { create } from 'zustand';
import { Resume } from '@/types';

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  loading: boolean;
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, resume: Resume) => void;
  deleteResume: (id: string) => void;
  setCurrentResume: (resume: Resume | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  currentResume: null,
  loading: false,
  setResumes: (resumes) => set({ resumes }),
  addResume: (resume) => set((state) => ({ resumes: [resume, ...state.resumes] })),
  updateResume: (id, resume) =>
    set((state) => ({
      resumes: state.resumes.map((r) => (r.id === id ? resume : r)),
      currentResume: state.currentResume?.id === id ? resume : state.currentResume,
    })),
  deleteResume: (id) =>
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== id),
    })),
  setCurrentResume: (resume) => set({ currentResume: resume }),
  setLoading: (loading) => set({ loading }),
}));
