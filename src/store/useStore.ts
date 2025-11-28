import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Project, Client, TeamMember, Task, Activity, Case } from '../types';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentPage?: string;
}

export interface BulkSelection {
  projects: Set<string>;
  clients: Set<string>;
  tasks: Set<string>;
  cases: Set<string>;
}

export interface SavedFilter {
  id: string;
  name: string;
  type: 'projects' | 'clients' | 'tasks' | 'cases';
  filters: Record<string, any>;
  createdAt: Date;
}

interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notificationCenterOpen: boolean;
  quickActionsOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
}

interface StoreState {
  // UI State
  ui: UIState;
  setUIState: (updates: Partial<UIState>) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationCenter: () => void;
  toggleQuickActions: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleCompactMode: () => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;

  // User Presence
  presenceUsers: UserPresence[];
  updatePresence: (userId: string, updates: Partial<UserPresence>) => void;
  setPresenceUsers: (users: UserPresence[]) => void;

  // Bulk Operations
  bulkSelection: BulkSelection;
  selectItem: (type: keyof BulkSelection, id: string) => void;
  deselectItem: (type: keyof BulkSelection, id: string) => void;
  selectAll: (type: keyof BulkSelection, ids: string[]) => void;
  deselectAll: (type: keyof BulkSelection) => void;
  clearAllSelections: () => void;
  getSelectedCount: (type: keyof BulkSelection) => number;

  // Saved Filters
  savedFilters: SavedFilter[];
  saveFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt'>) => void;
  deleteFilter: (filterId: string) => void;
  getFiltersByType: (type: SavedFilter['type']) => SavedFilter[];

  // Recent Activity
  recentlyViewed: Array<{
    id: string;
    type: 'project' | 'client' | 'task' | 'case';
    name: string;
    timestamp: Date;
  }>;
  addToRecentlyViewed: (item: { id: string; type: 'project' | 'client' | 'task' | 'case'; name: string }) => void;

  // Quick Stats Cache
  quickStats: {
    totalProjects: number;
    activeProjects: number;
    totalClients: number;
    openCases: number;
    pendingTasks: number;
    lastUpdated: Date | null;
  };
  updateQuickStats: (stats: Partial<StoreState['quickStats']>) => void;

  // Search State
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // Keyboard Shortcuts
  keyboardShortcutsEnabled: boolean;
  toggleKeyboardShortcuts: () => void;
}

const initialBulkSelection: BulkSelection = {
  projects: new Set(),
  clients: new Set(),
  tasks: new Set(),
  cases: new Set(),
};

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // UI State
        ui: {
          sidebarOpen: true,
          commandPaletteOpen: false,
          notificationCenterOpen: false,
          quickActionsOpen: false,
          activeModal: null,
          theme: 'auto',
          compactMode: false,
        },
        setUIState: (updates) =>
          set((state) => ({ ui: { ...state.ui, ...updates } }), false, 'setUIState'),
        toggleSidebar: () =>
          set((state) => ({ ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } }), false, 'toggleSidebar'),
        toggleCommandPalette: () =>
          set(
            (state) => ({ ui: { ...state.ui, commandPaletteOpen: !state.ui.commandPaletteOpen } }),
            false,
            'toggleCommandPalette'
          ),
        toggleNotificationCenter: () =>
          set(
            (state) => ({ ui: { ...state.ui, notificationCenterOpen: !state.ui.notificationCenterOpen } }),
            false,
            'toggleNotificationCenter'
          ),
        toggleQuickActions: () =>
          set(
            (state) => ({ ui: { ...state.ui, quickActionsOpen: !state.ui.quickActionsOpen } }),
            false,
            'toggleQuickActions'
          ),
        openModal: (modalId) =>
          set((state) => ({ ui: { ...state.ui, activeModal: modalId } }), false, 'openModal'),
        closeModal: () =>
          set((state) => ({ ui: { ...state.ui, activeModal: null } }), false, 'closeModal'),
        setTheme: (theme) =>
          set((state) => ({ ui: { ...state.ui, theme } }), false, 'setTheme'),
        toggleCompactMode: () =>
          set((state) => ({ ui: { ...state.ui, compactMode: !state.ui.compactMode } }), false, 'toggleCompactMode'),

        // Notifications
        notifications: [],
        unreadCount: 0,
        addNotification: (notification) =>
          set(
            (state) => {
              const newNotification: Notification = {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date(),
                read: false,
              };
              const notifications = [newNotification, ...state.notifications].slice(0, 100); // Keep last 100
              return {
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
              };
            },
            false,
            'addNotification'
          ),
        markAsRead: (notificationId) =>
          set(
            (state) => {
              const notifications = state.notifications.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
              );
              return {
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
              };
            },
            false,
            'markAsRead'
          ),
        markAllAsRead: () =>
          set(
            (state) => ({
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
              unreadCount: 0,
            }),
            false,
            'markAllAsRead'
          ),
        removeNotification: (notificationId) =>
          set(
            (state) => {
              const notifications = state.notifications.filter((n) => n.id !== notificationId);
              return {
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
              };
            },
            false,
            'removeNotification'
          ),
        clearNotifications: () =>
          set({ notifications: [], unreadCount: 0 }, false, 'clearNotifications'),

        // User Presence
        presenceUsers: [],
        updatePresence: (userId, updates) =>
          set(
            (state) => ({
              presenceUsers: state.presenceUsers.map((user) =>
                user.userId === userId ? { ...user, ...updates } : user
              ),
            }),
            false,
            'updatePresence'
          ),
        setPresenceUsers: (users) =>
          set({ presenceUsers: users }, false, 'setPresenceUsers'),

        // Bulk Operations
        bulkSelection: initialBulkSelection,
        selectItem: (type, id) =>
          set(
            (state) => ({
              bulkSelection: {
                ...state.bulkSelection,
                [type]: new Set([...state.bulkSelection[type], id]),
              },
            }),
            false,
            'selectItem'
          ),
        deselectItem: (type, id) =>
          set(
            (state) => {
              const newSet = new Set(state.bulkSelection[type]);
              newSet.delete(id);
              return {
                bulkSelection: {
                  ...state.bulkSelection,
                  [type]: newSet,
                },
              };
            },
            false,
            'deselectItem'
          ),
        selectAll: (type, ids) =>
          set(
            (state) => ({
              bulkSelection: {
                ...state.bulkSelection,
                [type]: new Set(ids),
              },
            }),
            false,
            'selectAll'
          ),
        deselectAll: (type) =>
          set(
            (state) => ({
              bulkSelection: {
                ...state.bulkSelection,
                [type]: new Set(),
              },
            }),
            false,
            'deselectAll'
          ),
        clearAllSelections: () =>
          set({ bulkSelection: initialBulkSelection }, false, 'clearAllSelections'),
        getSelectedCount: (type) => get().bulkSelection[type].size,

        // Saved Filters
        savedFilters: [],
        saveFilter: (filter) =>
          set(
            (state) => ({
              savedFilters: [
                ...state.savedFilters,
                {
                  ...filter,
                  id: crypto.randomUUID(),
                  createdAt: new Date(),
                },
              ],
            }),
            false,
            'saveFilter'
          ),
        deleteFilter: (filterId) =>
          set(
            (state) => ({
              savedFilters: state.savedFilters.filter((f) => f.id !== filterId),
            }),
            false,
            'deleteFilter'
          ),
        getFiltersByType: (type) =>
          get().savedFilters.filter((f) => f.type === type),

        // Recent Activity
        recentlyViewed: [],
        addToRecentlyViewed: (item) =>
          set(
            (state) => {
              const filtered = state.recentlyViewed.filter((rv) => rv.id !== item.id);
              return {
                recentlyViewed: [
                  { ...item, timestamp: new Date() },
                  ...filtered,
                ].slice(0, 20), // Keep last 20
              };
            },
            false,
            'addToRecentlyViewed'
          ),

        // Quick Stats
        quickStats: {
          totalProjects: 0,
          activeProjects: 0,
          totalClients: 0,
          openCases: 0,
          pendingTasks: 0,
          lastUpdated: null,
        },
        updateQuickStats: (stats) =>
          set(
            (state) => ({
              quickStats: {
                ...state.quickStats,
                ...stats,
                lastUpdated: new Date(),
              },
            }),
            false,
            'updateQuickStats'
          ),

        // Search State
        searchHistory: [],
        addToSearchHistory: (query) =>
          set(
            (state) => {
              const filtered = state.searchHistory.filter((q) => q !== query);
              return {
                searchHistory: [query, ...filtered].slice(0, 10), // Keep last 10
              };
            },
            false,
            'addToSearchHistory'
          ),
        clearSearchHistory: () =>
          set({ searchHistory: [] }, false, 'clearSearchHistory'),

        // Keyboard Shortcuts
        keyboardShortcutsEnabled: true,
        toggleKeyboardShortcuts: () =>
          set(
            (state) => ({ keyboardShortcutsEnabled: !state.keyboardShortcutsEnabled }),
            false,
            'toggleKeyboardShortcuts'
          ),
      }),
      {
        name: 'logos-vision-crm-storage',
        partialize: (state) => ({
          ui: {
            theme: state.ui.theme,
            compactMode: state.ui.compactMode,
            sidebarOpen: state.ui.sidebarOpen,
          },
          savedFilters: state.savedFilters,
          recentlyViewed: state.recentlyViewed,
          searchHistory: state.searchHistory,
          keyboardShortcutsEnabled: state.keyboardShortcutsEnabled,
        }),
      }
    )
  )
);

// Selectors
export const selectUnreadNotifications = (state: StoreState) =>
  state.notifications.filter((n) => !n.read);

export const selectOnlineUsers = (state: StoreState) =>
  state.presenceUsers.filter((u) => u.status === 'online');

export const selectHasSelections = (state: StoreState) =>
  state.bulkSelection.projects.size > 0 ||
  state.bulkSelection.clients.size > 0 ||
  state.bulkSelection.tasks.size > 0 ||
  state.bulkSelection.cases.size > 0;
