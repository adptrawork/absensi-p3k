import React from 'react';
import { User } from 'firebase/auth';
import { Sparkles, FileSpreadsheet, LayoutTemplate, Smartphone, Code2, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'collage' | 'table' | 'form' | 'workspace';
  setActiveTab: (tab: 'collage' | 'table' | 'form' | 'workspace') => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  totalSubmissions: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  totalSubmissions,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-serif font-black text-xl">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-100">
                  Absensi & Kolase Otomatis
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Max 6 Foto/Lembar
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Google Forms + Sheets + Apps Script Automation Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('collage')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'collage'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              Kolase Foto
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Rekap Data
              <span className="text-[10px] bg-slate-900/60 text-amber-300 px-1.5 py-0.2 rounded-full font-mono">
                {totalSubmissions}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Input Absen Peserta
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'workspace'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Kit Google Forms &amp; Script
            </button>
          </nav>

          {/* User / Google Auth button */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-slate-600"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'G'}
                  </div>
                )}
                <div className="text-left hidden lg:block leading-tight">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Terhubung
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar dari akun Google"
                  className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-xl font-medium text-xs shadow transition-colors active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-800 py-2 justify-around">
          <button
            onClick={() => setActiveTab('collage')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'collage' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Kolase
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'table' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Rekap ({totalSubmissions})
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'form' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Input Absen
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'workspace' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Google Kit
          </button>
        </div>
      </div>
    </header>
  );
};
