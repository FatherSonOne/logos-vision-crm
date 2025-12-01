import type { PortalLayout } from '../types';

const DB_KEY = 'logos_vision_portal_layouts';

export const portalDbService = {
  getLayouts: (): PortalLayout[] => {
    try {
      const storedData = localStorage.getItem(DB_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        // Return empty array on first load - users will create their own layouts
        return [];
      }
    } catch (error) {
      console.error("Error reading portal layouts from localStorage", error);
      return []; // Return empty array on error
    }
  },

  saveLayouts: (layouts: PortalLayout[]): void => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.error("Error saving portal layouts to localStorage", error);
    }
  },
};
