const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Token helpers ───────────────────────────────────────────
export const getToken = (): string | null =>
  localStorage.getItem('dailycheck_token');

export const setToken = (token: string): void =>
  localStorage.setItem('dailycheck_token', token);

export const removeToken = (): void =>
  localStorage.removeItem('dailycheck_token');

// ─── Fetch base ──────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si el token expiró, limpiamos y recargamos
  if (response.status === 401) {
    removeToken();
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error en la petición');
  }

  // 204 No Content no tiene body
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ id: string; name: string; email: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: async (email: string, password: string): Promise<void> => {
    const data = await request<{ access_token: string; token_type: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    setToken(data.access_token);
  },

  me: () =>
    request<{ id: string; name: string; email: string }>('/api/auth/me'),
};

// ─── Habits ───────────────────────────────────────────────────
export type HabitPayload = {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  daily_task: string;
  target_value?: number;
  unit?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  times_per_period?: number;
};

export type HabitResponse = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  daily_task: string;
  target_value: number | null;
  unit: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  times_per_period: number;
  created_at: string;
};

export const habitsApi = {
  getAll: () => request<HabitResponse[]>('/api/habits'),

  create: (data: HabitPayload) =>
    request<HabitResponse>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<HabitPayload>) =>
    request<HabitResponse>(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<null>(`/api/habits/${id}`, { method: 'DELETE' }),
};

// ─── Logs ─────────────────────────────────────────────────────
export type LogResponse = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  note: string | null;
  logged_at: string;
};

export const statsApi = {
  getPublicStats: () =>
    request<{ total_users: number }>('/api/auth/stats'),
};

export type StatsResponse = {
  habit_id: string;
  streak: number;
  completion_rate_30d: number;
  total_logs: number;
};

export const logsApi = {
  getByDate: (date: string) =>
    request<LogResponse[]>(`/api/logs?log_date=${date}`),

  getAll: () => request<LogResponse[]>('/api/logs'),

  toggle: (habit_id: string, date: string, note?: string) =>
    request<LogResponse>('/api/logs', {
      method: 'POST',
      body: JSON.stringify({ habit_id, date, note }),
    }).catch((err) => {
      // 200 con detail "Log eliminado" = toggle off, no es error real
      if (err.message === 'Log eliminado') return null;
      throw err;
    }),

  getStats: (habit_id: string) =>
    request<StatsResponse>(`/api/logs/stats/${habit_id}`),

  updateNote: (log_id: string, note: string) =>
  request<LogResponse>(`/api/logs/${log_id}/note?note=${encodeURIComponent(note)}`, {
    method: 'PATCH',
  }),
};