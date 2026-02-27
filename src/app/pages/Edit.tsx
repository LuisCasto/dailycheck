import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';
import { Habit } from '../types';

const CATEGORIES = ['Aprendizaje', 'Salud', 'Bienestar', 'Idiomas', 'Finanzas', 'Creatividad', 'Otro'];
const ICONS = ['📚', '🏃', '🧘', '💻', '✍️', '🎯', '🎨', '🎵', '🌱', '💪', '🧠', '⚡', '🔥', '🌟', '📝', '🏊', '🚴', '🥗'];

const DEFAULT_FORM = {
  name: '',
  description: '',
  category: 'Aprendizaje',
  icon: '🎯',
  dailyTask: '',
  targetValue: undefined as number | undefined,
  unit: '',
};

export default function Edit() {
  const { habits, addHabit, updateHabit, deleteHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.dailyTask.trim()) e.dailyTask = 'La tarea diaria es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setForm({ ...DEFAULT_FORM });
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (h: Habit) => {
    setForm({
      name: h.name,
      description: h.description,
      category: h.category,
      icon: h.icon,
      dailyTask: h.dailyTask,
      targetValue: h.targetValue,
      unit: h.unit || '',
    });
    setEditingId(h.id);
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingId) {
      updateHabit(editingId, form);
    } else {
      addHabit(form);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteHabit(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#444] text-xs uppercase tracking-widest mb-1">Gestión</p>
          <h1 className="text-white text-3xl">Editar Hábitos</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-white text-black text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#22C55E] transition-colors"
        >
          <Plus size={14} /> Nuevo hábito
        </button>
      </div>

      {/* Habit list */}
      <div className="space-y-3">
        <AnimatePresence>
          {habits.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#111] border border-[#1E1E1E] p-5 flex items-start gap-4"
            >
              <div className="text-2xl pt-0.5 flex-shrink-0">{h.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm">{h.name}</p>
                  <span className="text-[10px] border border-[#222] text-[#333] px-2 py-0.5 uppercase tracking-widest">
                    {h.category}
                  </span>
                </div>
                <p className="text-[#444] text-xs mb-1">{h.dailyTask}</p>
                {h.description && <p className="text-[#333] text-xs">{h.description}</p>}
                <p className="text-[#222] text-[10px] mt-2">Creado: {h.createdAt}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(h)}
                  className="text-[#333] hover:text-white transition-colors p-1"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(h.id)}
                  className="text-[#333] hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {habits.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[#1E1E1E]">
            <p className="text-[#333] text-sm mb-3">No tienes hábitos aún</p>
            <button onClick={openAdd} className="text-xs text-white border border-[#222] px-4 py-2 hover:border-[#444] transition-colors">
              Crear mi primer hábito
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
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
              className="bg-[#111] border border-[#222] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white">{editingId ? 'Editar hábito' : 'Nuevo hábito'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#444] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Icon picker */}
                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Ícono</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker((v) => !v)}
                      className="flex items-center gap-3 bg-[#0A0A0A] border border-[#222] px-4 py-2.5 text-white w-full hover:border-[#444] transition-colors"
                    >
                      <span className="text-xl">{form.icon}</span>
                      <span className="text-xs text-[#444] flex-1 text-left">Seleccionar ícono</span>
                      <ChevronDown size={14} className="text-[#444]" />
                    </button>
                    <AnimatePresence>
                      {showIconPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 right-0 bg-[#111] border border-[#222] p-3 grid grid-cols-9 gap-2 z-10 mt-1"
                        >
                          {ICONS.map((icon) => (
                            <button
                              key={icon}
                              onClick={() => { setForm({ ...form, icon }); setShowIconPicker(false); }}
                              className={`text-xl p-1.5 hover:bg-[#1A1A1A] rounded transition-colors ${form.icon === icon ? 'bg-[#1A1A1A]' : ''}`}
                            >
                              {icon}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Nombre del hábito *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ej. Lectura Diaria"
                    className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Descripción / Meta</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="¿Cuál es tu meta grande?"
                    className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm resize-none h-20"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Categoría</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, category: c })}
                        className={`text-xs px-3 py-1.5 border transition-colors ${
                          form.category === c ? 'border-white text-white' : 'border-[#222] text-[#444] hover:border-[#444]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily task */}
                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Tarea diaria *</label>
                  <input
                    type="text"
                    value={form.dailyTask}
                    onChange={(e) => setForm({ ...form, dailyTask: e.target.value })}
                    placeholder="ej. Leer 30 minutos"
                    className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm"
                  />
                  {errors.dailyTask && <p className="text-red-500 text-xs mt-1">{errors.dailyTask}</p>}
                </div>

                {/* Target value + unit */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Valor objetivo</label>
                    <input
                      type="number"
                      value={form.targetValue || ''}
                      onChange={(e) => setForm({ ...form, targetValue: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="ej. 30"
                      className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Unidad</label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      placeholder="ej. min, páginas..."
                      className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="text-[#444] text-xs px-4 py-2.5 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-white text-black text-xs px-5 py-2.5 flex items-center gap-1.5 hover:bg-[#22C55E] transition-colors"
                >
                  <Check size={13} /> {editingId ? 'Guardar cambios' : 'Crear hábito'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111] border border-[#222] p-6 max-w-sm w-full"
            >
              <h3 className="text-white mb-2">¿Eliminar hábito?</h3>
              <p className="text-[#444] text-sm mb-6">
                Se eliminarán también todos los logs de este hábito. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="text-[#444] text-xs px-4 py-2 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-900 text-red-300 text-xs px-4 py-2 hover:bg-red-800 transition-colors border border-red-800"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
