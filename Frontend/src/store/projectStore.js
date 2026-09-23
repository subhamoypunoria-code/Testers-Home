import { create } from 'zustand';
import { projectAPI } from '../services/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const { data } = await projectAPI.getAll();
      set({ projects: data.projects, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const { data } = await projectAPI.getOne(id);
      set({ currentProject: data.project, loading: false });
      return data.project;
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  createProject: async (projectData) => {
    const { data } = await projectAPI.create(projectData);
    set({ projects: [data.project, ...get().projects] });
    return data.project;
  },

  updateProject: async (id, projectData) => {
    const { data } = await projectAPI.update(id, projectData);
    set({
      projects: get().projects.map(p => p._id === id ? data.project : p),
      currentProject: data.project,
    });
    return data.project;
  },

  deleteProject: async (id) => {
    await projectAPI.delete(id);
    set({ projects: get().projects.filter(p => p._id !== id) });
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));

export default useProjectStore;
