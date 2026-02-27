export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  dailyTask: string;
  targetValue?: number;
  unit?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
  loggedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type AppContextType = {
  user: User | null;
  habits: Habit[];
  logs: HabitLog[];
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleLog: (habitId: string, date: string) => void;
  addNote: (habitId: string, date: string, note: string) => void;
  getLogsForDate: (date: string) => HabitLog[];
  getLogsForHabit: (habitId: string) => HabitLog[];
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
};
