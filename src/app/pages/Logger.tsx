import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { format, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, MessageSquare, X, Check } from 'lucide-react';

export default function Logger() {
  const { habits, toggleLog, addNote, getLogsForDate, logs } = useApp();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [noteModal, setNoteModal] = useState<{ habitId: string; habitName: string } | null>(null);
  const [noteText, setNoteText] = useState('');

  const dayLogs = getLogsForDate(selectedDate);
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const isFuture = selectedDate > format(new Date(), 'yyyy-MM-dd');

  const navigate = (dir: 'prev' | 'next') => {
    const d = dir === 'prev' ? subDays(new Date(selectedDate), 1) : addDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const label = isToday
    ? 'Hoy'
    : format(new Date(selectedDate + 'T12:00:00'), "EEE d 'de' MMMM", { locale: es });

  const openNote = (habitId: string, habitName: string) => {
    const existingLog = logs.find((l) => l.habitId === habitId && l.date === selectedDate);
    setNoteText(existingLog?.note || '');
    setNoteModal({ habitId, habitName });
  };

  const saveNote = () => {
    if (noteModal) {
      addNote(noteModal.habitId, selectedDate, noteText);
      setNoteModal(null);
    }
  };

  const completedCount = dayLogs.length;
  const totalCount = habits.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-1">Logger Diario</p>
        <h1 className="text-white text-3xl">Check-in</h1>
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('prev')}
          className="text-[#444] hover:text-white transition-colors p-1"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-white capitalize">{label}</p>
          <p className="text-[#333] text-xs">{selectedDate}</p>
        </div>
        <button
          onClick={() => navigate('next')}
          disabled={isToday}
          className="text-[#444] hover:text-white transition-colors p-1 disabled:opacity-20"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-[#111] border border-[#1E1E1E] p-4 mb-6 flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#22C55E] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[#444] text-xs flex-shrink-0">
          {completedCount}/{totalCount}
        </span>
        {completedCount === totalCount && totalCount > 0 && (
          <span className="text-[#22C55E] text-xs">¡Perfecto! ✓</span>
        )}
      </div>

      {isFuture && (
        <div className="bg-[#111] border border-[#1E1E1E] p-4 mb-6 text-[#444] text-sm text-center">
          No puedes registrar hábitos en el futuro.
        </div>
      )}

      {/* Habit cards */}
      <div className="space-y-3">
        {habits.map((habit, i) => {
          const done = dayLogs.some((l) => l.habitId === habit.id);
          const existingLog = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border transition-all duration-300 ${
                done ? 'border-[#22C55E]/40 bg-[#22C55E]/5' : 'border-[#1E1E1E] bg-[#111]'
              }`}
            >
              <div className="flex items-center gap-4 p-5">
                {/* Check button */}
                <button
                  onClick={() => !isFuture && toggleLog(habit.id, selectedDate)}
                  disabled={isFuture}
                  className={`flex-shrink-0 transition-all duration-300 ${isFuture ? 'cursor-not-allowed opacity-30' : 'hover:scale-110'}`}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <CheckCircle2 size={26} className="text-[#22C55E]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="undone"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Circle size={26} className="text-[#2A2A2A]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <p className={`text-sm transition-colors ${done ? 'text-white' : 'text-[#666]'}`}>
                      {habit.name}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 uppercase tracking-widest ${
                        done ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#1A1A1A] text-[#333]'
                      }`}
                    >
                      {habit.category}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${done ? 'text-[#22C55E]/70' : 'text-[#333]'}`}>
                    {habit.dailyTask}
                  </p>
                  {existingLog?.note && (
                    <p className="text-[#444] text-xs mt-1 italic">"{existingLog.note}"</p>
                  )}
                </div>

                {/* Note button */}
                {done && (
                  <button
                    onClick={() => openNote(habit.id, habit.name)}
                    className="text-[#333] hover:text-[#666] transition-colors flex-shrink-0"
                    title="Agregar nota"
                  >
                    <MessageSquare size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-16 text-[#333]">
          <p className="text-sm">No tienes hábitos configurados.</p>
          <button
            onClick={() => window.location.href = '/edit'}
            className="mt-3 text-xs text-white border border-[#222] px-4 py-2 hover:border-[#444] transition-colors"
          >
            Crear mi primer hábito →
          </button>
        </div>
      )}

      {/* Note modal */}
      <AnimatePresence>
        {noteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#111] border border-[#222] w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-sm">{noteModal.habitName}</p>
                <button onClick={() => setNoteModal(null)} className="text-[#444] hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Nota del día</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="¿Cómo te fue hoy? Añade una reflexión..."
                className="w-full bg-[#0A0A0A] border border-[#222] text-white text-sm px-4 py-3 resize-none h-28 outline-none focus:border-[#444] transition-colors placeholder:text-[#333]"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setNoteModal(null)} className="text-[#444] text-xs px-4 py-2">
                  Cancelar
                </button>
                <button
                  onClick={saveNote}
                  className="bg-white text-black text-xs px-4 py-2 flex items-center gap-1.5 hover:bg-[#22C55E] transition-colors"
                >
                  <Check size={13} /> Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
