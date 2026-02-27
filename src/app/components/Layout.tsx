import { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { isAuthenticated } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <main className="flex-1 overflow-y-auto lg:px-10 px-5 pt-16 lg:pt-10 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
