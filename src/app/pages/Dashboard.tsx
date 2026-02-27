import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Flame, TrendingUp, CheckCircle2, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Dashboard() {
  const { user, habits, getStreak, getCompletionRate, getLogsForDate, logs } = useApp();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = getLogsForDate(today);
  const todayCompleted = todayLogs.length;
  const todayTotal = habits.length;
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const dayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const dayLabelCap = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

  // Overall stats
  const totalLogs = logs.filter((l) => l.completed).length;
  const longestStreak = Math.max(...habits.map((h) => getStreak(h.id)), 0);
  const avgRate = habits.length
    ? Math.round(habits.reduce((a, h) => a + getCompletionRate(h.id), 0) / habits.length)
    : 0;

  // Last 7 days activity
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const label = format(subDays(new Date(), 6 - i), 'EEE', { locale: es });
    const completed = getLogsForDate(d).length;
    const total = habits.length;
    const pct = total > 0 ? completed / total : 0;
    return { d, label, pct, completed, total };
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-[#444] text-xs uppercase tracking-widest mb-1">{dayLabelCap}</p>
        <h1 className="text-white text-3xl">
          Hola, <span className="text-[#22C55E]">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-[#555] text-sm mt-1">
          {todayCompleted === todayTotal && todayTotal > 0
            ? '¡Día perfecto! Todos los hábitos completados 🎉'
            : `Te faltan ${todayTotal - todayCompleted} hábito${todayTotal - todayCompleted !== 1 ? 's' : ''} por hoy.`}
        </p>
      </motion.div>

      {/* Today's progress ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111] border border-[#1E1E1E] p-8 mb-6 flex flex-col sm:flex-row items-center gap-8"
      >
        {/* Ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1E1E1E" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#22C55E"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - todayPct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-2xl">{todayPct}%</span>
            <span className="text-[#444] text-[10px] uppercase">hoy</span>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-white text-lg mb-1">Progreso del día</h2>
          <p className="text-[#444] text-sm mb-4">
            {todayCompleted} de {todayTotal} hábitos completados
          </p>
          <div className="flex flex-wrap gap-2">
            {habits.map((h) => {
              const done = todayLogs.some((l) => l.habitId === h.id);
              return (
                <span
                  key={h.id}
                  className={`text-xs px-3 py-1 border ${
                    done ? 'border-[#22C55E] text-[#22C55E] bg-[#22C55E]/5' : 'border-[#222] text-[#333]'
                  }`}
                >
                  {h.icon} {h.name}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/logger')}
            className="mt-5 flex items-center gap-2 text-xs text-white uppercase tracking-widest border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
          >
            Ir al Logger <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total logs', val: totalLogs, icon: CheckCircle2, color: '#22C55E' },
          { label: 'Racha más larga', val: `${longestStreak}d`, icon: Flame, color: '#F97316' },
          { label: 'Efectividad 30d', val: `${avgRate}%`, icon: TrendingUp, color: '#3B82F6' },
          { label: 'Hábitos activos', val: habits.length, icon: Target, color: '#A855F7' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="bg-[#111] border border-[#1E1E1E] p-4"
          >
            <s.icon size={16} style={{ color: s.color }} className="mb-3" />
            <div className="text-white text-xl">{s.val}</div>
            <div className="text-[#444] text-[10px] uppercase tracking-widest mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Last 7 days bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#111] border border-[#1E1E1E] p-6 mb-6"
      >
        <p className="text-[#444] text-xs uppercase tracking-widest mb-5">Últimos 7 días</p>
        <div className="flex items-end gap-2 h-20">
          {last7.map((d) => (
            <div key={d.d} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full relative" style={{ height: '60px' }}>
                <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] h-full rounded-sm" />
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-700"
                  style={{
                    height: `${d.pct * 100}%`,
                    backgroundColor: d.pct === 1 ? '#22C55E' : d.pct > 0.5 ? '#22C55E99' : d.pct > 0 ? '#22C55E44' : '#1A1A1A',
                  }}
                />
              </div>
              <span className="text-[#333] text-[9px] uppercase">{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Habit list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-[#111] border border-[#1E1E1E]"
      >
        <div className="px-6 py-4 border-b border-[#1E1E1E] flex items-center justify-between">
          <p className="text-[#444] text-xs uppercase tracking-widest">Mis hábitos</p>
          <button onClick={() => navigate('/edit')} className="text-[#333] text-xs hover:text-[#888] transition-colors">
            Editar →
          </button>
        </div>
        {habits.map((h, i) => {
          const streak = getStreak(h.id);
          const rate = getCompletionRate(h.id);
          const done = todayLogs.some((l) => l.habitId === h.id);
          return (
            <div
              key={h.id}
              className={`flex items-center gap-4 px-6 py-4 ${i < habits.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}
            >
              <span className="text-xl">{h.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm">{h.name}</p>
                  {done && (
                    <CheckCircle2 size={13} className="text-[#22C55E]" />
                  )}
                </div>
                <p className="text-[#444] text-xs truncate">{h.dailyTask}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[#22C55E] text-xs">{rate}%</div>
                <div className="text-[#333] text-[10px]">🔥 {streak}d</div>
              </div>
              {/* mini progress bar */}
              <div className="w-16 hidden sm:block">
                <div className="h-1 bg-[#1A1A1A] rounded-full">
                  <div
                    className="h-1 bg-[#22C55E] rounded-full transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
