import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { format, subDays, startOfMonth, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Flame, TrendingUp, Trophy, Calendar } from 'lucide-react';
import React from 'react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111] border border-[#222] px-3 py-2">
        <p className="text-[#444] text-[10px] uppercase tracking-widest mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">
            {p.value}{typeof p.value === 'number' && p.name?.includes('%') ? '' : '%'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Metrics() {
  const { habits, logs, getStreak, getCompletionRate } = useApp();
  const [selectedHabit, setSelectedHabit] = useState<string>('all');

  // Last 30 days data
  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
    const label = format(subDays(new Date(), 29 - i), 'd MMM', { locale: es });
    const dayLogs = logs.filter((l) => l.date === d && l.completed);

    if (selectedHabit === 'all') {
      const pct = habits.length > 0 ? Math.round((dayLogs.length / habits.length) * 100) : 0;
      return { date: label, pct, logs: dayLogs.length };
    } else {
      const done = dayLogs.some((l) => l.habitId === selectedHabit);
      return { date: label, pct: done ? 100 : 0, logs: done ? 1 : 0 };
    }
  });

  // Weekly aggregated
  const weekly = Array.from({ length: 4 }).map((_, wi) => {
    const weekLabel = `Sem ${4 - wi}`;
    let total = 0;
    let completed = 0;
    for (let d = wi * 7; d < (wi + 1) * 7; d++) {
      const date = format(subDays(new Date(), d), 'yyyy-MM-dd');
      const dayLogs = logs.filter((l) => l.date === date && l.completed);
      const habitCount = selectedHabit === 'all' ? habits.length : 1;
      total += habitCount;
      completed += selectedHabit === 'all' ? dayLogs.length : (dayLogs.some((l) => l.habitId === selectedHabit) ? 1 : 0);
    }
    return { week: weekLabel, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }).reverse();

  // Heatmap - current month
  const today = new Date();
  const monthStart = startOfMonth(today);
  const daysInMonth = getDaysInMonth(today);
  const heatmapData = Array.from({ length: daysInMonth }).map((_, i) => {
    const d = format(new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1), 'yyyy-MM-dd');
    const dayLogs = logs.filter((l) => l.date === d && l.completed);
    const pct = habits.length > 0 ? dayLogs.length / habits.length : 0;
    return { day: i + 1, pct, completed: dayLogs.length, future: d > format(today, 'yyyy-MM-dd') };
  });

  const filteredHabits = selectedHabit === 'all' ? habits : habits.filter((h) => h.id === selectedHabit);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-1">Análisis</p>
        <h1 className="text-white text-3xl">Métricas</h1>
      </div>

      {/* Habit selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedHabit('all')}
          className={`text-xs px-3 py-1.5 uppercase tracking-widest border transition-colors ${
            selectedHabit === 'all' ? 'border-white text-white' : 'border-[#222] text-[#444] hover:border-[#444]'
          }`}
        >
          Todos
        </button>
        {habits.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHabit(h.id)}
            className={`text-xs px-3 py-1.5 uppercase tracking-widest border transition-colors ${
              selectedHabit === h.id ? 'border-[#22C55E] text-[#22C55E]' : 'border-[#222] text-[#444] hover:border-[#444]'
            }`}
          >
            {h.icon} {h.name}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {filteredHabits.slice(0, 1).map((h) => {
          const s = getStreak(h.id);
          const r = getCompletionRate(h.id);
          const r7 = getCompletionRate(h.id, 7);
          const total = logs.filter((l) => l.habitId === h.id && l.completed).length;
          return (
            <div key={h.id} className="contents">
              <StatCard icon={Flame} label="Racha actual" val={`${s}d`} color="#F97316" />
              <StatCard icon={TrendingUp} label="Efectividad 30d" val={`${r}%`} color="#22C55E" />
              <StatCard icon={Trophy} label="Esta semana" val={`${r7}%`} color="#3B82F6" />
              <StatCard icon={Calendar} label="Total logs" val={total} color="#A855F7" />
            </div>
          );
        })}
        {selectedHabit === 'all' && (
          <>
            <StatCard icon={Flame} label="Mejor racha" val={`${Math.max(...habits.map((h) => getStreak(h.id)), 0)}d`} color="#F97316" />
            <StatCard icon={TrendingUp} label="Prom. 30d" val={`${habits.length ? Math.round(habits.reduce((a, h) => a + getCompletionRate(h.id), 0) / habits.length) : 0}%`} color="#22C55E" />
            <StatCard icon={Trophy} label="Prom. semana" val={`${habits.length ? Math.round(habits.reduce((a, h) => a + getCompletionRate(h.id, 7), 0) / habits.length) : 0}%`} color="#3B82F6" />
            <StatCard icon={Calendar} label="Total logs" val={logs.filter((l) => l.completed).length} color="#A855F7" />
          </>
        )}
      </div>

      {/* Area Chart - 30 days */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#111] border border-[#1E1E1E] p-6 mb-6"
      >
        <p className="text-[#444] text-xs uppercase tracking-widest mb-5">Progreso — Últimos 30 días</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={last30} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1A1A1A" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#333', fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: '#333', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pct" stroke="#22C55E" fill="url(#greenGrad)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Weekly bars + Heatmap */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Weekly */}
        <div className="bg-[#111] border border-[#1E1E1E] p-6">
          <p className="text-[#444] text-xs uppercase tracking-widest mb-5">Por semana</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekly} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#333', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#333', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pct" fill="#22C55E" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="bg-[#111] border border-[#1E1E1E] p-6">
          <p className="text-[#444] text-xs uppercase tracking-widest mb-5">
            {format(today, 'MMMM yyyy', { locale: es }).charAt(0).toUpperCase() +
              format(today, 'MMMM yyyy', { locale: es }).slice(1)}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((d) => (
              <div key={d.day} title={`Día ${d.day}: ${d.completed} hábitos`}>
                <div
                  className="w-full aspect-square rounded-sm"
                  style={{
                    backgroundColor: d.future
                      ? '#0F0F0F'
                      : d.pct === 0
                      ? '#1A1A1A'
                      : d.pct < 0.4
                      ? '#22C55E33'
                      : d.pct < 0.7
                      ? '#22C55E77'
                      : d.pct < 1
                      ? '#22C55EAA'
                      : '#22C55E',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[#333] text-[9px]">Menos</span>
            {['#1A1A1A', '#22C55E33', '#22C55E77', '#22C55EAA', '#22C55E'].map((c) => (
              <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[#333] text-[9px]">Más</span>
          </div>
        </div>
      </div>

      {/* Per habit summary */}
      <div className="bg-[#111] border border-[#1E1E1E]">
        <div className="px-6 py-4 border-b border-[#1E1E1E]">
          <p className="text-[#444] text-xs uppercase tracking-widest">Resumen por hábito</p>
        </div>
        {habits.map((h, i) => {
          const streak = getStreak(h.id);
          const rate = getCompletionRate(h.id);
          const total = logs.filter((l) => l.habitId === h.id && l.completed).length;
          return (
            <div key={h.id} className={`flex items-center gap-4 px-6 py-4 ${i < habits.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
              <span className="text-xl flex-shrink-0">{h.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm mb-1">{h.name}</p>
                <div className="h-1.5 bg-[#1A1A1A] rounded-full">
                  <div className="h-1.5 bg-[#22C55E] rounded-full" style={{ width: `${rate}%` }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-0.5">
                <div className="text-[#22C55E] text-xs">{rate}%</div>
                <div className="text-[#333] text-[10px]">🔥 {streak}d · {total} logs</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, val, color }: { icon: any; label: string; val: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] border border-[#1E1E1E] p-4"
    >
      <Icon size={15} style={{ color }} className="mb-3" />
      <div className="text-white text-xl">{val}</div>
      <div className="text-[#444] text-[10px] uppercase tracking-widest mt-0.5">{label}</div>
    </motion.div>
  );
}