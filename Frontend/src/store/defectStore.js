import { create } from 'zustand';
import { defectAPI } from '../services/api';

const useDefectStore = create((set, get) => ({
  defects: [],
  currentDefect: null,
  total: 0,
  pages: 1,
  loading: false,
  filters: { status: '', severity: '', priority: '', assignee: '', search: '', page: 1 },

  fetchDefects: async (projectId, params) => {
    set({ loading: true });
    try {
      const { data } = await defectAPI.getAll(projectId, params || get().filters);
      set({ defects: data.defects, total: data.total, pages: data.pages, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchDefect: async (projectId, id) => {
    set({ loading: true });
    try {
      const { data } = await defectAPI.getOne(projectId, id);
      set({ currentDefect: data.defect, loading: false });
      return data.defect;
    } catch {
      set({ loading: false });
    }
  },

  createDefect: async (projectId, defectData) => {
    const { data } = await defectAPI.create(projectId, defectData);
    set({ defects: [data.defect, ...get().defects], total: get().total + 1 });
    return data.defect;
  },

  updateDefect: async (projectId, id, defectData) => {
    const { data } = await defectAPI.update(projectId, id, defectData);
    set({
      defects: get().defects.map(d => d._id === id ? data.defect : d),
      currentDefect: data.defect,
    });
    return data.defect;
  },

  deleteDefect: async (projectId, id) => {
    await defectAPI.delete(projectId, id);
    set({ defects: get().defects.filter(d => d._id !== id), total: get().total - 1 });
  },

  bulkDeleteDefects: async (projectId, ids) => {
    await defectAPI.bulkDelete(projectId, ids);
    // refetch from server so count and pagination reflect true DB state
    const { data } = await defectAPI.getAll(projectId, get().filters);
    set({ defects: data.defects, total: data.total, pages: data.pages });
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setCurrentDefect: (defect) => set({ currentDefect: defect }),
}));

export default useDefectStore;
