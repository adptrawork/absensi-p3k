import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AttendanceRecord,
  AttendanceSession,
} from '../utils/attendance';
import { createSvgAvatar } from '../utils/sampleData';
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
  User,
} from 'lucide-react';

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<AttendanceRecord, 'id'>) => void;
  defaultSession?: AttendanceSession;
  defaultDate?: string;
}

export const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultSession = 'PAGI',
  defaultDate = '2026-10-26',
}) => {
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [session, setSession] = useState<AttendanceSession>(defaultSession);
  const [date, setDate] = useState(defaultDate);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState<string>('p1');
  const [isSuccess, setIsSuccess] = useState(false);

  // Avatar presets for quick instant attendance demo
  const avatarPresets = [
    { id: 'p1', label: 'Pria Jas Navy', url: createSvgAvatar('p1', 'Pegawai 1', '#E8DFD0', '#1E3A8A') },
    { id: 'p2', label: 'Wanita Blazer Tosca', url: createSvgAvatar('p2', 'Pegawai 2', '#E2D5C3', '#0F766E') },
    { id: 'p3', label: 'Pria Kemeja Abu', url: createSvgAvatar('p3', 'Pegawai 3', '#DDD2C1', '#334155') },
    { id: 'p4', label: 'Wanita Blazer Hitam', url: createSvgAvatar('p4', 'Pegawai 4', '#E9DFD0', '#475569') },
    { id: 'p5', label: 'Pria Seragam Coklat', url: createSvgAvatar('p5', 'Pegawai 5', '#DFD3BF', '#854D0E') },
  ];

  // Set default avatar
  React.useEffect(() => {
    if (!photoUrl && avatarPresets.length > 0) {
      setPhotoUrl(avatarPresets[0].url);
    }
  }, []);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setSelectedAvatarKey('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip.trim() || !name.trim()) {
      alert('Mohon isi NIP dan Nama Lengkap peserta.');
      return;
    }

    const finalPhoto = photoUrl || avatarPresets[0].url;

    onSubmit({
      nip: nip.trim(),
      name: name.trim(),
      session,
      date,
      timestamp: new Date().toISOString(),
      photoUrl: finalPhoto,
      notes: notes.trim(),
    });

    // Launch celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form fields
      setNip('');
      setName('');
      setNotes('');
    }, 1400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header ala Google Form mobile */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  Formulir Presensi Harian
                </h3>
                <p className="text-[11px] text-amber-200">
                  Simulasi Tampilan Formulir Peserta di HP
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Presensi Berhasil Terkirim!</h4>
            <p className="text-xs text-slate-500">
              Data Anda telah masuk ke rekap kehadiran dan kolase foto otomatis telah diperbarui.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Sesi Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Sesi Absensi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSession('PAGI')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    session === 'PAGI'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  Presensi Pagi
                </button>
                <button
                  type="button"
                  onClick={() => setSession('SORE')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    session === 'SORE'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Presensi Sore
                </button>
              </div>
            </div>

            {/* NIP Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Induk Pegawai (NIP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: 19880412 201201 1 001"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>

            {/* Nama Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Beserta Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Drs. Hendra Setiawan, M.Si"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Absensi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Foto Upload & Avatar Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Foto Dokumentasi Presensi <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {/* Avatar presets */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {avatarPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatarKey(preset.id);
                        setPhotoUrl(preset.url);
                      }}
                      className={`relative shrink-0 rounded-xl p-1 border transition-all ${
                        selectedAvatarKey === preset.id
                          ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* File input / custom photo */}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-amber-50/50 transition-colors">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Atau Unggah Foto Sendiri (JPG/PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Hadir tepat waktu di aula rapat"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Kirim Absensi &amp; Perbarui Kolase Otomatis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
