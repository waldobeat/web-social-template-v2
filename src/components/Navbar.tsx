import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthContext } from '../lib/AuthContext';
import {
  Home, BookOpen, LogOut,
  Menu, X, User, LayoutDashboard, Bell, Search
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { to: '/feed', label: 'Feed', icon: Home },
    { to: '/prestamos', label: 'Préstamos', icon: BookOpen },
  ];

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-[#050505]/90 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/feed" className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xl font-black tracking-widest text-white uppercase">
                SHEDDIT<span className="text-neon-pink">.</span>
              </span>
            </Link>

            {/* Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Buscar en SHEDDIT..."
                  className="w-full rounded-full border border-white/8 bg-white/4 pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-neon-pink/30 focus:bg-white/6 transition-all"
                />
              </div>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive(to)
                      ? 'bg-neon-pink/15 text-neon-pink'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right: user area */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {user ? (
                <>
                  <button className="relative rounded-lg p-2 text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                    <Bell className="h-4 w-4" />
                  </button>

                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-neon-pink/15 text-neon-pink'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Mi Panel
                  </Link>

                  <Link
                    to={`/perfil/${user.uid}`}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-1.5 transition-all hover:border-white/20 hover:bg-white/8"
                  >
                    <span className="text-base leading-none">{user.avatar || '👤'}</span>
                    <span className="text-xs font-semibold text-gray-300 max-w-[80px] truncate">
                      {user.displayName || 'Perfil'}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="rounded-lg bg-neon-pink px-4 py-2 text-xs font-bold text-white transition-all hover:bg-neon-pink/80"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Mobile: avatar + menu */}
            <div className="md:hidden flex items-center gap-2">
              {user ? (
                <Link to={`/perfil/${user.uid}`} className="text-xl leading-none">
                  {user.avatar || '👤'}
                </Link>
              ) : (
                <Link to="/" className="text-xs font-bold text-neon-pink">
                  Entrar
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg border border-white/10 p-1.5 text-gray-400"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 bg-[#050505]/98 px-4 py-3 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-neon-pink/15 text-neon-pink'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive('/dashboard') ? 'bg-neon-pink/15 text-neon-pink' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Mi Panel
                </Link>
                <Link
                  to={`/perfil/${user.uid}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-neon-pink px-4 py-3 text-sm font-bold text-white"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </nav>
      <div className="h-14" />
    </>
  );
}
