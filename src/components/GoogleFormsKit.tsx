import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptTemplate';
import {
  createOfficialAttendanceGoogleForm,
  fetchFormResponses,
  GoogleFormCreationResult,
} from '../utils/googleFormsService';
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  PlusCircle,
  FolderTree,
  ShieldCheck,
  Terminal,
  HelpCircle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface GoogleFormsKitProps {
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
  onImportResponses?: (responses: any[]) => void;
  agencyName: string;
}

export const GoogleFormsKit: React.FC<GoogleFormsKitProps> = ({
  user,
  accessToken,
  onLogin,
  onImportResponses,
  agencyName,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [createdForm, setCreatedForm] = useState<GoogleFormCreationResult | null>(null);
  const [inputFormId, setInputFormId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'guide' | 'drive' | 'concurrency'>('script');

  // Copy Apps Script code
  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    } catch {
      alert('Gagal menyalin script ke clipboard.');
    }
  };

  // Create Google Form via API
  const handleCreateForm = async () => {
    if (!accessToken) {
      onLogin();
      return;
    }

    setIsCreatingForm(true);
    setSyncStatus(null);
    try {
      const result = await createOfficialAttendanceGoogleForm(
        accessToken,
        'Formulir Presensi Harian Pegawai',
        agencyName || 'Instansi'
      );
      setCreatedForm(result);
      setInputFormId(result.formId);
      setSyncStatus('Formulir absensi berhasil dibuat langsung di akun Google Anda!');
    } catch (err: any) {
      console.error('Error creating form:', err);
      setSyncStatus(`Error: ${err.message || 'Gagal membuat Google Form.'}`);
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Fetch responses from Google Form
  const handleFetchResponses = async () => {
    if (!accessToken) {
      onLogin();
      return;
    }

    const formIdToFetch = inputFormId.trim() || createdForm?.formId;
    if (!formIdToFetch) {
      alert('Masukkan Form ID terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Mengambil respons dari Google Forms API...');
    try {
      const responses = await fetchFormResponses(accessToken, formIdToFetch);
      if (responses.length === 0) {
        setSyncStatus('Formulir ini belum memiliki respons peserta.');
      } else {
        setSyncStatus(`Berhasil membaca ${responses.length} respons peserta dari Google Forms.`);
        if (onImportResponses) {
          onImportResponses(responses);
        }
      }
    } catch (err: any) {
      console.error('Error fetching responses:', err);
      setSyncStatus(`Gagal membaca respons: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Forms API Creation Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Integrasi Google Forms API Terhubung
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Buat Formulir Absensi Otomatis di Google Workspace Anda
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Buat Google Form presensi resmi lengkap dengan pertanyaan NIP, Nama Lengkap, Pilihan Sesi (Pagi/Sore), dan upload foto secara otomatis langsung di akun Google Drive Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {user && accessToken ? (
              <button
                onClick={handleCreateForm}
                disabled={isCreatingForm}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isCreatingForm ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Membuat Formulir di Google...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Buat Google Form di Akun Saya
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg hover:bg-slate-100 transition-all active:scale-95"
              >
                Sign in with Google untuk Buat Form
              </button>
            )}
          </div>
        </div>

        {/* Created Form Box Details */}
        {createdForm && (
          <div className="mt-6 pt-6 border-t border-indigo-800/60 bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Formulir Berhasil Dibuat!
              </span>
              <span className="text-[11px] font-mono text-slate-400">ID: {createdForm.formId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a
                href={createdForm.responderUri}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 transition-colors"
              >
                <span>Tautan Isi Absensi (Peserta di HP)</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              </a>
              <a
                href={createdForm.editUri}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 transition-colors"
              >
                <span>Tautan Edit / Kelola Form (Admin)</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              </a>
            </div>
          </div>
        )}

        {/* Sync Form Responses Box */}
        <div className="mt-4 pt-4 border-t border-indigo-900/40 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-300 font-medium">Atau Sinkronkan ID Form yang Ada:</span>
          <input
            type="text"
            value={inputFormId}
            onChange={(e) => setInputFormId(e.target.value)}
            placeholder="Masukkan Form ID..."
            className="px-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none w-64"
          />
          <button
            onClick={handleFetchResponses}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Tarik Respons
          </button>
          {syncStatus && (
            <span className="text-xs text-amber-300 ml-2 font-medium">{syncStatus}</span>
          )}
        </div>
      </div>

      {/* Google Apps Script Documentation & Code Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-600" />
            Google Apps Script Automation Engine (Siap Pakai)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Skrip ini berjalan 100% otomatis di Google Sheets Anda tanpa biaya server. Script akan mendeteksi kiriman formulir, membuat antrean aman (LockService), dan menyusun kolase foto 6 foto per lembar ke Google Drive.
          </p>
        </div>

        {/* Tabs for Guide, Script, Folder Structure */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 transition-all ${
              activeTab === 'script'
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kode Script (.gs)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 transition-all ${
              activeTab === 'guide'
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Panduan Pasang Step-by-Step
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-2.5 transition-all ${
              activeTab === 'drive'
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Struktur Folder Google Drive
          </button>
          <button
            onClick={() => setActiveTab('concurrency')}
            className={`pb-2.5 transition-all ${
              activeTab === 'concurrency'
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Antrean Aman (LockService)
          </button>
        </div>

        {/* Tab 1: Script Code Box */}
        {activeTab === 'script' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">
                File: AbsensiKolaseOtomatis.gs
              </span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Tersalin ke Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin Seluruh Kode Script
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800 select-all">
              {APPS_SCRIPT_CODE}
            </pre>
          </div>
        )}

        {/* Tab 2: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="font-bold text-amber-900 mb-2">Langkah Pemasangan di Google Sheets:</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>
                  Buka Google Spreadsheet yang menjadi tempat penampungan respons Google Form Anda.
                </li>
                <li>
                  Klik menu atas: <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                </li>
                <li>
                  Hapus fungsi kosong <code className="bg-white px-1 py-0.5 rounded border font-mono">myFunction()</code> yang ada, lalu tempel seluruh kode dari tab <strong>Kode Script (.gs)</strong>.
                </li>
                <li>
                  Klik ikon simpan <strong>💾 (Save project)</strong> atau tekan <kbd className="bg-white px-1.5 py-0.5 rounded border">Ctrl + S</kbd>.
                </li>
                <li>
                  Pilih fungsi <strong>buatPemicuOtomatis</strong> di bilah fungsi atas, lalu klik <strong>▶ Jalankan (Run)</strong>.
                </li>
                <li>
                  Beri izin otorisasi saat Google meminta akses akun (cukup sekali).
                </li>
                <li>
                  Selesai! Setiap ada peserta yang mengisi form, kolase foto akan dibuat dan diperbarui secara otomatis di Google Drive Anda.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: Drive Folder Structure */}
        {activeTab === 'drive' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                Struktur Folder Otomatis di Google Drive:
              </h4>
              <pre className="font-mono text-[11px] bg-slate-900 text-amber-300 p-4 rounded-lg leading-relaxed">
{`Google Drive Saya/
└── ABSENSI HARIAN DOKUMENTASI/
    ├── 2026-10-26/
    │   ├── PAGI/
    │   │   ├── Kolase_PAGI_Hal_1.png   (Foto #1 - #6)
    │   │   └── Kolase_PAGI_Hal_2.png   (Foto #7 - #12)
    │   └── SORE/
    │       └── Kolase_SORE_Hal_1.png   (Foto #1 - #6)
    └── 2026-10-27/
        └── PAGI/
            └── Kolase_PAGI_Hal_1.png`}
              </pre>
              <p className="text-slate-600">
                Sistem secara otomatis mengelompokkan file foto berdasarkan tanggal absensi dan sesi (Pagi / Sore), sehingga admin sangat mudah mengunduh atau meneruskan ke pimpinan.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Concurrency & LockService */}
        {activeTab === 'concurrency' && (
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Mekanisme Antrean Aman (LockService)
            </h4>
            <p className="text-slate-600">
              Sesuai dengan pembahasan rancangan sistem Anda: jika kolase dibuat setiap ada peserta baru, gambar sebelumnya harus diperbarui ketika peserta berikutnya masuk.
            </p>
            <p className="text-slate-600">
              Script yang kami sediakan menggunakan <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">LockService.getScriptLock().waitLock(30000)</code>. Artinya, jika ada dua atau lebih peserta yang menekan tombol kirim form pada detik yang sama, sistem akan mengantrekan proses secara berurutan sehingga <strong>tidak ada foto yang hilang atau proses yang saling menimpa</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
