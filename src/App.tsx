/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { CollageViewer } from './components/CollageViewer';
import { AttendanceTable } from './components/AttendanceTable';
import { AttendanceFormModal } from './components/AttendanceFormModal';
import { GoogleFormsKit } from './components/GoogleFormsKit';
import {
  AttendanceRecord,
  CollageSettings,
  DEFAULT_SETTINGS,
} from './utils/attendance';
import { INITIAL_ATTENDANCE_RECORDS } from './utils/sampleData';
import { initAuth, googleSignIn, logout } from './firebase';
import {
  FileSpreadsheet,
  LayoutTemplate,
  Smartphone,
  Code2,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'collage' | 'table' | 'form' | 'workspace'>('collage');
  
  // Persistent attendance records state
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('absensi_records_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved records:', e);
    }
    return INITIAL_ATTENDANCE_RECORDS;
  });

  // Persistent settings state
  const [settings, setSettings] = useState<CollageSettings>(() => {
    try {
      const saved = localStorage.getItem('absensi_settings_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('absensi_records_v1', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('absensi_settings_v1', JSON.stringify(settings));
  }, [settings]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddRecord = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetData = () => {
    if (confirm('Kembalikan data ke contoh peserta awal?')) {
      setRecords(INITIAL_ATTENDANCE_RECORDS);
    }
  };

  const handleUpdateSettings = (newPartialSettings: Partial<CollageSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartialSettings }));
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        totalSubmissions={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Quick Tabs */}
        {activeTab === 'collage' && (
          <CollageViewer
            records={records}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {activeTab === 'table' && (
          <AttendanceTable
            records={records}
            onAddRecord={() => setIsFormModalOpen(true)}
            onDeleteRecord={handleDeleteRecord}
            onResetData={handleResetData}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            duplicatePolicy={settings.duplicatePolicy}
          />
        )}

        {activeTab === 'form' && (
          <div className="max-w-2xl mx-auto py-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Simulasi Input Kehadiran Peserta
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Formulir ini mensimulasikan peserta yang mengisi presensi melalui ponsel mereka. Setiap pengiriman langsung memperbarui rekap dan lembar kolase foto secara otomatis.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Buka Form Input Presensi (Mode Ponsel)
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-700">Mekanisme Pembentukan Kolase:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
                  <li>Maksimal 6 foto peserta per halaman kolase.</li>
                  <li>Jika peserta ke-7 mengisi form, halaman 2 dibuat secara otomatis.</li>
                  <li>Halaman kolase dapat langsung diunduh dalam format PNG resolusi 1080×1350 px.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <GoogleFormsKit
            user={user}
            accessToken={accessToken}
            onLogin={handleLogin}
            agencyName={settings.agencyName}
          />
        )}
      </main>

      {/* Floating Action Button on mobile to add attendance */}
      <div className="fixed bottom-6 right-6 md:hidden z-30">
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="w-14 h-14 bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-700 active:scale-90 transition-transform"
          title="Tambah Presensi Baru"
        >
          <Smartphone className="w-6 h-6" />
        </button>
      </div>

      {/* Attendance Form Modal */}
      <AttendanceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleAddRecord}
        defaultDate={selectedDate}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Absensi &amp; Kolase Otomatis</span>
            <span>•</span>
            <span>Google Forms + Google Sheets + Apps Script</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Resolusi Tinggi 1080×1350 px • Grid 3×2 Maksimal 6 Foto Per Lembar
          </div>
        </div>
      </footer>
    </div>
  );
}
