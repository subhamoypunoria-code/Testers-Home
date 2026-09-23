import { create } from 'zustand';
import { testCaseAPI } from '../services/api';

const useTestCaseStore = create((set, get) => ({
  testCases: [],
  currentTestCase: null,
  generated: [],
  total: 0,
  pages: 1,
  loading: false,
  filters: { status: '', type: '', priority: '', search: '', page: 1 },

  fetchTestCases: async (projectId, params) => {
    set({ loading: true });
    try {
      const { data } = await testCaseAPI.getAll(projectId, params || get().filters);
      set({ testCases: data.testCases, total: data.total, pages: data.pages, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchTestCase: async (projectId, id) => {
    set({ loading: true });
    try {
      const { data } = await testCaseAPI.getOne(projectId, id);
      set({ currentTestCase: data.testCase, loading: false });
      return data.testCase;
    } catch {
      set({ loading: false });
    }
  },

  generateFromDefects: async (projectId, defectIds) => {
    set({ loading: true });
    try {
      const { data } = await testCaseAPI.generate(projectId, defectIds);
      set({ generated: data.generated, loading: false });
      return data.generated;
    } catch {
      set({ loading: false });
      return [];
    }
  },

  saveGenerated: async (projectId, testCases) => {
    set({ loading: true });
    try {
      const { data } = await testCaseAPI.saveGenerated(projectId, testCases);
      if (data.testCases?.length) {
        set({ testCases: [...data.testCases, ...get().testCases], total: get().total + data.testCases.length, generated: [], loading: false });
      } else {
        set({ loading: false });
      }
      return data;
    } catch {
      set({ loading: false });
    }
  },

  updateTestCase: async (projectId, id, data) => {
    const { data: res } = await testCaseAPI.update(projectId, id, data);
    set({
      testCases: get().testCases.map(tc => tc._id === id ? res.testCase : tc),
      currentTestCase: res.testCase,
    });
    return res.testCase;
  },

  deleteTestCase: async (projectId, id) => {
    await testCaseAPI.delete(projectId, id);
    set({ testCases: get().testCases.filter(tc => tc._id !== id), total: get().total - 1 });
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setCurrentTestCase: (testCase) => set({ currentTestCase: testCase }),
  setGenerated: (generated) => set({ generated }),
}));

export default useTestCaseStore;
