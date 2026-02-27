import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Github, Twitter, Mail } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-1">Soporte</p>
        <h1 className="text-white text-3xl">Contacto</h1>
        <p className="text-[#444] text-sm mt-2">¿Tienes preguntas, sugerencias o feedback? Escríbenos.</p>
      </div>

      <div className="grid sm:grid-cols-5 gap-8">
        {/* Info */}
        <div className="sm:col-span-2 space-y-8">
          <div>
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Sobre DailyCheck</p>
            <p className="text-[#555] text-sm leading-relaxed">
              DailyCheck es una herramienta gratuita construida para ayudarte a alcanzar tus metas a través de la disciplina y la constancia diaria.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, label: 'Email', val: 'hola@dailycheck.app' },
              { icon: Github, label: 'GitHub', val: '@dailycheck' },
              { icon: Twitter, label: 'Twitter', val: '@dailycheckapp' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#444]" />
                </div>
                <div>
                  <p className="text-[#333] text-[10px] uppercase tracking-widest">{label}</p>
                  <p className="text-[#666] text-xs">{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Preguntas frecuentes</p>
            <div className="space-y-4">
              {[
                { q: '¿Es gratuito?', a: 'Sí, completamente gratuito.' },
                { q: '¿Se guardan mis datos?', a: 'Tus datos se guardan localmente en tu navegador.' },
                { q: '¿Puedo tener múltiples metas?', a: 'Sí, puedes crear tantos hábitos como necesites.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-l-2 border-[#1E1E1E] pl-4">
                  <p className="text-white text-xs mb-0.5">{q}</p>
                  <p className="text-[#444] text-xs">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="sm:col-span-3">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111] border border-[#22C55E]/30 p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                >
                  <CheckCircle2 size={40} className="text-[#22C55E] mb-4" />
                </motion.div>
                <h3 className="text-white mb-2">¡Mensaje enviado!</h3>
                <p className="text-[#444] text-sm mb-6">
                  Gracias por escribirnos. Te responderemos pronto.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="text-xs text-[#444] border border-[#222] px-4 py-2 hover:border-[#444] hover:text-white transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="bg-[#111] border border-[#1E1E1E] p-6 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Nombre</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#2A2A2A] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#2A2A2A] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Asunto</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Sugerencia', 'Bug', 'Pregunta', 'Otro'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, subject: s })}
                        className={`text-xs px-3 py-1.5 border transition-colors ${
                          form.subject === s ? 'border-white text-white' : 'border-[#222] text-[#444] hover:border-[#444]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="O escribe tu asunto..."
                    className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#2A2A2A] text-sm"
                  />
                </div>

                <div>
                  <label className="text-[#444] text-xs uppercase tracking-widest block mb-2">Mensaje</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    rows={5}
                    className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-3 outline-none focus:border-[#444] transition-colors placeholder:text-[#2A2A2A] text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#22C55E] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">Enviando...</span>
                  ) : (
                    <>
                      Enviar mensaje <Send size={13} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-12 pt-6 border-t border-[#1A1A1A] flex items-center justify-between">
        <p className="text-[#222] text-xs">© 2026 DailyCheck · Herramienta gratuita para hábitos diarios</p>
        <p className="text-[#222] text-xs">Hecho con disciplina 🖤</p>
      </div>
    </div>
  );
}
