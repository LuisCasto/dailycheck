import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, HabitLog, User, AppContextType } from '../types';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

const AppContext = createContext<AppContextType | null>(null);

const DEMO_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Lectura Diaria',
    description: 'Volverme un lector habitual para expandir mi conocimiento',
    category: 'Aprendizaje',
    icon: '📚',
    dailyTask: 'Leer 30 minutos',
    targetValue: 30,
    unit: 'min',
    createdAt: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
  },
  {
    id: 'h2',
    name: 'Ejercicio',
    description: 'Mejorar mi condición física y salud general',
    category: 'Salud',
    icon: '🏃',
    dailyTask: 'Entrenar 45 minutos',
    targetValue: 45,
    unit: 'min',
    createdAt: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
  },
  {
    id: 'h3',
    name: 'Meditación',
    description: 'Cultivar la atención plena y reducir el estrés',
    category: 'Bienestar',
    icon: '🧘',
    dailyTask: 'Meditar 10 minutos',
    targetValue: 10,
    unit: 'min',
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  },
  {
    id: 'h4',
    name: 'Coding',
    description: 'Mejorar mis habilidades de programación',
    category: 'Aprendizaje',
    icon: '💻',
    dailyTask: 'Programar 1 hora',
    targetValue: 60,
    unit: 'min',
    createdAt: format(subDays(new Date(), 28), 'yyyy-MM-dd'),
  },
  {
    id: 'h5',
    name: 'Español Avanzado',
    description: 'Perfeccionar mi escritura y vocabulario en español',
    category: 'Idiomas',
    icon: '✍️',
    dailyTask: 'Escribir 300 palabras',
    targetValue: 300,
    unit: 'palabras',
    createdAt: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
  },
];

function generateDemoLogs(habits: Habit[]): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();

  habits.forEach((habit) => {
    const daysBack = differenceInDays(today, parseISO(habit.createdAt));
    const days = Math.min(daysBack, 30);

    for (let i = days; i >= 1; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      let completionChance = 0.7;
      if (habit.id === 'h1') completionChance = 0.82;
      if (habit.id === 'h2') completionChance = 0.65;
      if (habit.id === 'h3') completionChance = 0.88;
      if (habit.id === 'h4') completionChance = 0.72;
      if (habit.id === 'h5') completionChance = 0.6;

      const completed = Math.random() < completionChance;
      if (completed) {
        logs.push({
          id: `log-${habit.id}-${date}`,
          habitId: habit.id,
          date,
          completed: true,
          loggedAt: date + 'T20:00:00',
        });
      }
    }
  });

  return logs;
}

const DEMO_LOGS = generateDemoLogs(DEMO_HABITS);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('dailycheck_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = localStorage.getItem('dailycheck_habits');
    return stored ? JSON.parse(stored) : DEMO_HABITS;
  });

  const [logs, setLogs] = useState<HabitLog[]>(() => {
    const stored = localStorage.getItem('dailycheck_logs');
    return stored ? JSON.parse(stored) : DEMO_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('dailycheck_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('dailycheck_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('dailycheck_logs', JSON.stringify(logs));
  }, [logs]);

  const login = (email: string, name: string) => {
    const newUser: User = { id: 'u1', name, email };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `h-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setLogs((prev) => prev.filter((l) => l.habitId !== id));
  };

  const toggleLog = (habitId: string, date: string) => {
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    if (existing) {
      setLogs((prev) => prev.filter((l) => !(l.habitId === habitId && l.date === date)));
    } else {
      const newLog: HabitLog = {
        id: `log-${habitId}-${date}-${Date.now()}`,
        habitId,
        date,
        completed: true,
        loggedAt: new Date().toISOString(),
      };
      setLogs((prev) => [...prev, newLog]);
    }
  };

  const addNote = (habitId: string, date: string, note: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.habitId === habitId && l.date === date ? { ...l, note } : l))
    );
  };

  const getLogsForDate = (date: string) => logs.filter((l) => l.date === date && l.completed);

  const getLogsForHabit = (habitId: string) =>
    logs.filter((l) => l.habitId === habitId && l.completed);

  const getStreak = (habitId: string): number => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const hasLog = logs.some((l) => l.habitId === habitId && l.date === date && l.completed);
      if (hasLog) {
        streak++;
      } else {
        if (i > 0) break;
      }
    }
    return streak;
  };

  const getCompletionRate = (habitId: string, days = 30): number => {
    const today = new Date();
    let completed = 0;
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return 0;
    const startDay = differenceInDays(today, parseISO(habit.createdAt));
    const actualDays = Math.min(days, startDay);
    if (actualDays === 0) return 0;
    for (let i = 1; i <= actualDays; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      if (logs.some((l) => l.habitId === habitId && l.date === date && l.completed)) {
        completed++;
      }
    }
    return Math.round((completed / actualDays) * 100);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        habits,
        logs,
        isAuthenticated: !!user,
        login,
        logout,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleLog,
        addNote,
        getLogsForDate,
        getLogsForHabit,
        getStreak,
        getCompletionRate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
