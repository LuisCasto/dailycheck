import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Edit3,
  Mail,
  CheckCircle2,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logger', icon: CheckSquare, label: 'Logger' },
  { to: '/metrics', icon: BarChart2, label: 'Métricas' },
  { to: '/edit', icon: Edit3, label: 'Editar' },
  { to: '/contact', icon: Mail, label: 'Contacto' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({ open, onClose, onToggle }: SidebarProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[#111111] border-r border-[#1E1E1E]">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-[#22C55E]" />
          <span className="text-white tracking-widest text-xs uppercase">DailyCheck</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-[#444] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest transition-all duration-200 group ${
                isActive
                  ? 'text-white bg-[#1A1A1A] border-l-2 border-[#22C55E]'
                  : 'text-[#444] hover:text-[#888] hover:bg-[#161616] border-l-2 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-[#22C55E]' : 'group-hover:text-[#666]'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-6 py-5 border-t border-[#1E1E1E]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#22C55E] flex items-center justify-center text-black text-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-white text-xs truncate max-w-[110px]">{user?.name}</p>
            <p className="text-[#333] text-[10px] truncate max-w-[110px]">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#333] hover:text-[#888] transition-colors text-xs uppercase tracking-widest"
        >
          <LogOut size={13} />
          Salir
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-52 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#111] border border-[#222] p-2 text-white"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/70 z-40"
            />
            <motion.div
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-52 z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
