import { create } from 'zustand';
import taskService from '@/services/taskService';
import shoppingService from '@/services/shoppingService';

const useTodoStore = create((set, get) => ({
  tasks: [],
  shoppingItems: [],
  tasksLoading: false,
  shoppingLoading: false,

  fetchTasks: async () => {
    set({ tasksLoading: true });
    try {
      const data = await taskService.getTasks();
      set({ tasks: data.data.tasks, tasksLoading: false });
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      set({ tasksLoading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const data = await taskService.createTask(taskData);
      const newTask = data.data.task;
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
      return newTask;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const data = await taskService.updateTask(id, updates);
      const updated = data.data.task;
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? updated : t)),
      }));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Shopping List
  fetchShoppingItems: async () => {
    set({ shoppingLoading: true });
    try {
      const data = await shoppingService.getItems();
      set({ shoppingItems: data.data.items, shoppingLoading: false });
    } catch (err) {
      console.error(err);
      set({ shoppingLoading: false });
    }
  },

  createShoppingItem: async (itemData) => {
    try {
      const data = await shoppingService.addItem(itemData);
      const newItem = data.data.item;
      set((state) => ({ shoppingItems: [newItem, ...state.shoppingItems] }));
      return newItem;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateShoppingItem: async (id, updates) => {
    try {
      const data = await shoppingService.updateItem(id, updates);
      const updated = data.data.item;
      set((state) => ({
        shoppingItems: state.shoppingItems.map((i) => (i._id === id ? updated : i)),
      }));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteShoppingItem: async (id) => {
    try {
      await shoppingService.deleteItem(id);
      set((state) => ({
        shoppingItems: state.shoppingItems.filter((i) => i._id !== id),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Socket triggers
  addTaskLocally: (task) => {
    const { tasks } = get();
    if (!tasks.some((t) => t._id === task._id)) {
      set({ tasks: [task, ...tasks] });
    }
  },

  updateTaskLocally: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
    }));
  },

  removeTaskLocally: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
    }));
  },

  addShoppingLocally: (item) => {
    const { shoppingItems } = get();
    if (!shoppingItems.some((i) => i._id === item._id)) {
      set({ shoppingItems: [item, ...shoppingItems] });
    }
  },

  updateShoppingLocally: (item) => {
    set((state) => ({
      shoppingItems: state.shoppingItems.map((i) => (i._id === item._id ? item : i)),
    }));
  },

  removeShoppingLocally: (itemId) => {
    set((state) => ({
      shoppingItems: state.shoppingItems.filter((i) => i._id !== itemId),
    }));
  },
}));

export default useTodoStore;
