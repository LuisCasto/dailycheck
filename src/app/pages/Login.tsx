import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Mode = 'login' | 'register';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (mode === 'register' && !form.name) {
      setError('Por favor ingresa tu nombre.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(form.email, form.name || form.email.split('@')[0]);
      navigate('/dashboard');
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-white" size={22} />
          <span className="text-white tracking-widest text-sm uppercase">DailyCheck</span>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-white text-5xl mb-6 leading-tight">
              La disciplina es
              <br />
              <span className="text-[#22C55E]">elegir</span> entre
              <br />
              lo que quieres
              <br />
              ahora y lo que
              <br />
              quieres <span className="text-[#22C55E]">más.</span>
            </h1>
            <p className="text-[#555] max-w-sm">
              Convierte tus metas grandes en pasos pequeños. Mide tu progreso. Construye hábitos que duren.
            </p>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            {[
              { label: 'Hábitos activos', val: '12,480' },
              { label: 'Días logrados', val: '892K' },
              { label: 'Rachas activas', val: '3,200+' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-white text-xl">{s.val}</div>
                <div className="text-[#444] text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex gap-2">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="h-6 w-1.5 rounded-full"
              style={{
                backgroundColor: Math.random() > 0.3 ? '#22C55E' : '#1E1E1E',
                opacity: 0.4 + Math.random() * 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <CheckCircle2 className="text-white" size={20} />
          <span className="text-white tracking-widest text-sm uppercase">DailyCheck</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <h2 className="text-white text-2xl mb-2">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="text-[#555] text-sm mb-8">
            {mode === 'login'
              ? 'Ingresa para continuar tu racha.'
              : 'Empieza a construir tus hábitos hoy.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 rounded-none outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 rounded-none outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm"
              />
            </div>

            <div>
              <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 rounded-none outline-none focus:border-[#444] transition-colors placeholder:text-[#333] text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 text-sm uppercase tracking-widest hover:bg-[#22C55E] hover:text-black transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Verificando...</span>
              ) : (
                <>
                  {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-[#444] text-xs hover:text-white transition-colors"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
            <p className="text-[#333] text-xs text-center mb-3">Demo rápida</p>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  login('demo@dailycheck.app', 'Demo User');
                  navigate('/dashboard');
                  setLoading(false);
                }, 600);
              }}
              className="w-full border border-[#222] text-[#555] py-3 text-xs uppercase tracking-widest hover:border-[#444] hover:text-[#888] transition-colors"
            >
              Entrar como invitado
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
