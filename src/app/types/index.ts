export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  dailyTask: string;
  targetValue?: number;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timesPerPeriod: number;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleLog: (habitId: string, date: string) => Promise<void>;
  addNote: (habitId: string, date: string, note: string) => Promise<void>;
  getLogsForDate: (date: string) => HabitLog[];
  getLogsForHabit: (habitId: string) => HabitLog[];
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
};
