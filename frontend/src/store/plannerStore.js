import { create } from 'zustand';
import travelService from '@/services/travelService';
import movieService from '@/services/movieService';
import restaurantService from '@/services/restaurantService';
import reminderService from '@/services/reminderService';

const usePlannerStore = create((set, get) => ({
  travelPlans: [],
  moviePlans: [],
  restaurantPlans: [],
  reminders: [],
  travelLoading: false,
  movieLoading: false,
  restaurantLoading: false,
  remindersLoading: false,

  // Travel plans
  fetchTravelPlans: async () => {
    set({ travelLoading: true });
    try {
      const data = await travelService.getPlans();
      set({ travelPlans: data.data.plans, travelLoading: false });
    } catch (err) {
      console.error(err);
      set({ travelLoading: false });
    }
  },

  createTravelPlan: async (planData) => {
    try {
      const data = await travelService.createPlan(planData);
      const newPlan = data.data.plan;
      set((state) => ({ travelPlans: [newPlan, ...state.travelPlans] }));
      return newPlan;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateTravelPlan: async (id, updates) => {
    try {
      const data = await travelService.updatePlan(id, updates);
      const updated = data.data.plan;
      set((state) => ({
        travelPlans: state.travelPlans.map((p) => (p._id === id ? updated : p)),
      }));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteTravelPlan: async (id) => {
    try {
      await travelService.deletePlan(id);
      set((state) => ({
        travelPlans: state.travelPlans.filter((p) => p._id !== id),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Movie plans
  fetchMoviePlans: async () => {
    set({ movieLoading: true });
    try {
      const data = await movieService.getPlans();
      set({ moviePlans: data.data.plans, movieLoading: false });
    } catch (err) {
      console.error(err);
      set({ movieLoading: false });
    }
  },

  createMoviePlan: async (planData) => {
    try {
      const data = await movieService.createPlan(planData);
      const newPlan = data.data.plan;
      set((state) => ({ moviePlans: [newPlan, ...state.moviePlans] }));
      return newPlan;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateMoviePlan: async (id, updates) => {
    try {
      const data = await movieService.updatePlan(id, updates);
      const updated = data.data.plan;
      set((state) => ({
        moviePlans: state.moviePlans.map((p) => (p._id === id ? updated : p)),
      }));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteMoviePlan: async (id) => {
    try {
      await movieService.deletePlan(id);
      set((state) => ({
        moviePlans: state.moviePlans.filter((p) => p._id !== id),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Restaurant plans
  fetchRestaurantPlans: async () => {
    set({ restaurantLoading: true });
    try {
      const data = await restaurantService.getPlans();
      set({ restaurantPlans: data.data.plans, restaurantLoading: false });
    } catch (err) {
      console.error(err);
      set({ restaurantLoading: false });
    }
  },

  createRestaurantPlan: async (planData) => {
    try {
      const data = await restaurantService.createPlan(planData);
      const newPlan = data.data.plan;
      set((state) => ({ restaurantPlans: [newPlan, ...state.restaurantPlans] }));
      return newPlan;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateRestaurantPlan: async (id, updates) => {
    try {
      const data = await restaurantService.updatePlan(id, updates);
      const updated = data.data.plan;
      set((state) => ({
        restaurantPlans: state.restaurantPlans.map((p) => (p._id === id ? updated : p)),
      }));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteRestaurantPlan: async (id) => {
    try {
      await restaurantService.deletePlan(id);
      set((state) => ({
        restaurantPlans: state.restaurantPlans.filter((p) => p._id !== id),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Reminders
  fetchReminders: async () => {
    set({ remindersLoading: true });
    try {
      const data = await reminderService.getReminders();
      set({ reminders: data.data.reminders, remindersLoading: false });
    } catch (err) {
      console.error(err);
      set({ remindersLoading: false });
    }
  },

  dismissReminder: async (id) => {
    try {
      await reminderService.dismissReminder(id);
      set((state) => ({
        reminders: state.reminders.filter((r) => r._id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // Socket triggers
  addTravelLocally: (plan) => {
    const { travelPlans } = get();
    if (!travelPlans.some((p) => p._id === plan._id)) {
      set({ travelPlans: [plan, ...travelPlans] });
    }
  },

  updateTravelLocally: (plan) => {
    set((state) => ({
      travelPlans: state.travelPlans.map((p) => (p._id === plan._id ? plan : p)),
    }));
  },

  removeTravelLocally: (planId) => {
    set((state) => ({
      travelPlans: state.travelPlans.filter((p) => p._id !== planId),
    }));
  },

  addMovieLocally: (plan) => {
    const { moviePlans } = get();
    if (!moviePlans.some((p) => p._id === plan._id)) {
      set({ moviePlans: [plan, ...moviePlans] });
    }
  },

  updateMovieLocally: (plan) => {
    set((state) => ({
      moviePlans: state.moviePlans.map((p) => (p._id === plan._id ? plan : p)),
    }));
  },

  removeMovieLocally: (planId) => {
    set((state) => ({
      moviePlans: state.moviePlans.filter((p) => p._id !== planId),
    }));
  },

  addRestaurantLocally: (plan) => {
    const { restaurantPlans } = get();
    if (!restaurantPlans.some((p) => p._id === plan._id)) {
      set({ restaurantPlans: [plan, ...restaurantPlans] });
    }
  },

  updateRestaurantLocally: (plan) => {
    set((state) => ({
      restaurantPlans: state.restaurantPlans.map((p) => (p._id === plan._id ? plan : p)),
    }));
  },

  removeRestaurantLocally: (planId) => {
    set((state) => ({
      restaurantPlans: state.restaurantPlans.filter((p) => p._id !== planId),
    }));
  },
}));

export default usePlannerStore;
