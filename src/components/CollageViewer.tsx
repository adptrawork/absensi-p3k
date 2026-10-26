import React, { useEffect, useRef, useState } from 'react';
import {
  AttendanceRecord,
  AttendanceSession,
  CollagePage,
  CollageSettings,
  chunkIntoCollagePages,
  formatDateIndonesian,
  processDuplicates,
} from '../utils/attendance';
import {
  renderCollageToCanvas,
  downloadCollageAsPng,
  copyCollageToClipboard,
} from '../utils/collageRenderer';
import {
  Download,
  Copy,
  Check,
  Share2,
  Sliders,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  FileDown,
  Building,
  RotateCcw,
} from 'lucide-react';

interface CollageViewerProps {
  records: AttendanceRecord[];
  settings: CollageSettings;
  onUpdateSettings: (newSettings: Partial<CollageSettings>) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const CollageViewer: React.FC<CollageViewerProps> = ({
  records,
  settings,
  onUpdateSettings,
  selectedDate,
  onSelectDate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('PAGI');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);

  // Filter records by selected Date and Session, processed through duplicate policy
  const { validRecords } = processDuplicates(records, settings.duplicatePolicy);
  const sessionRecords = validRecords.filter(
    (r) => r.date === selectedDate && r.session === selectedSession
  );

  // Group into max 6 photos per page
  const pages: CollagePage[] = chunkIntoCollagePages(
    sessionRecords,
    selectedDate,
    selectedSession,
    6
  );

  const activePage: CollagePage = pages[currentPageIndex] || pages[0];

  // Render canvas whenever activePage, settings, or session changes
  useEffect(() => {
    let isCancelled = false;
    const render = async () => {
      if (!canvasRef.current || !activePage) return;
      setIsRendering(true);
      try {
        await renderCollageToCanvas(canvasRef.current, activePage, settings);
      } catch (err) {
        console.error('Error rendering collage to canvas:', err);
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [activePage, settings]);

  // Reset page index if pages array length changes
  useEffect(() => {
    if (currentPageIndex >= pages.length) {
      setCurrentPageIndex(0);
    }
  }, [pages.length, currentPageIndex]);

  // Handle single page download
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const filename = `Kolase_${selectedSession}_${selectedDate}_Hal_${activePage.pageNumber}.png`;
    downloadCollageAsPng(canvasRef.current, filename);
  };

  // Handle download all pages
  const handleDownloadAll = async () => {
    if (pages.length === 0) return;
    setIsDownloadingAll(true);
    const tempCanvas = document.createElement('canvas');

    for (const page of pages) {
      await renderCollageToCanvas(tempCanvas, page, settings);
      const filename = `Kolase_${selectedSession}_${selectedDate}_Hal_${page.pageNumber}.png`;
      downloadCollageAsPng(tempCanvas, filename);
      // Brief delay between downloads
      await new Promise((res) => setTimeout(res, 500));
    }
    setIsDownloadingAll(false);
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const success = await copyCollageToClipboard(canvasRef.current);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert('Gagal menyalin gambar ke clipboard. Browser Anda mungkin membatasi izin ini.');
    }
  };

  // Handle share via WhatsApp Web
  const handleShareWhatsApp = () => {
    const text = `*DOKUMENTASI ${selectedSession === 'PAGI' ? 'ABSENSI PAGI' : 'ABSENSI SORE'}*\nTanggal: ${formatDateIndonesian(
      selectedDate
    )}\nTotal Hadir: ${sessionRecords.length} Peserta (Lembar ${activePage.pageNumber} dari ${
      pages.length
    })\n\n_Dibuat secara otomatis melalui Sistem Absensi & Kolase Foto._`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Sesi & Tanggal selector */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Session tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setSelectedSession('PAGI');
                  setCurrentPageIndex(0);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSession === 'PAGI'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Absensi Pagi
                <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                  {validRecords.filter((r) => r.date === selectedDate && r.session === 'PAGI').length}
                </span>
              </button>
              <button
                onClick={() => {
                  setSelectedSession('SORE');
                  setCurrentPageIndex(0);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSession === 'SORE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Absensi Sore
                <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                  {validRecords.filter((r) => r.date === selectedDate && r.session === 'SORE').length}
                </span>
              </button>
            </div>

            {/* Date input */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 font-medium">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onSelectDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {/* Status Summary */}
            <div className="text-xs text-slate-500 hidden sm:block">
              Total sesi ini: <strong className="text-slate-800">{sessionRecords.length} peserta</strong> ({pages.length} lembar kolase)
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showSettingsDrawer
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Atur Template
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all active:scale-95"
              title="Salin gambar PNG ke clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Gambar
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              Kirim ke WA
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh PNG (1080×1350)
            </button>
          </div>
        </div>

        {/* Template Style Selector Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Desain Bingkai:
            </span>
            <div className="inline-flex gap-2">
              <button
                onClick={() => onUpdateSettings({ template: 'beige' })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  settings.template === 'beige'
                    ? 'bg-amber-100/80 text-amber-900 border-amber-400 ring-2 ring-amber-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#E5D5BA] border border-[#B39968]" />
                Elegan Beige
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                  Rekomendasi
                </span>
              </button>
              <button
                onClick={() => onUpdateSettings({ template: 'formal' })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  settings.template === 'formal'
                    ? 'bg-blue-100/80 text-blue-900 border-blue-400 ring-2 ring-blue-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#1E3A8A] border border-[#D97706]" />
                Formal Instansi
              </button>
              <button
                onClick={() => onUpdateSettings({ template: 'minimalist' })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  settings.template === 'minimalist'
                    ? 'bg-slate-200 text-slate-900 border-slate-400 ring-2 ring-slate-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white border border-slate-700" />
                Minimalis Modern
              </button>
            </div>
          </div>

          {/* Orientation switch */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Orientasi:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => onUpdateSettings({ orientation: 'portrait' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  settings.orientation === 'portrait'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Potret (1080×1350)
              </button>
              <button
                onClick={() => onUpdateSettings({ orientation: 'landscape' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  settings.orientation === 'landscape'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Lanskap (1350×1080)
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Settings Drawer */}
        {showSettingsDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Instansi / Perusahaan
              </label>
              <input
                type="text"
                value={settings.agencyName}
                onChange={(e) => onUpdateSettings({ agencyName: e.target.value })}
                placeholder="Contoh: KEMENTERIAN KEUANGAN"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub-Unit / Biro / Divisi
              </label>
              <input
                type="text"
                value={settings.subAgencyName}
                onChange={(e) => onUpdateSettings({ subAgencyName: e.target.value })}
                placeholder="Contoh: BIRO KEPEGAWAIAN"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kebijakan Duplikasi NIP
              </label>
              <select
                value={settings.duplicatePolicy}
                onChange={(e) =>
                  onUpdateSettings({ duplicatePolicy: e.target.value as 'reject' | 'mark' })
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="mark">Simpan Semua (Tandai jika Duplikat)</option>
                <option value="reject">Tolak Duplikasi (Hanya Absensi Pertama)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Collage Preview Canvas & Pagination */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Multi-Page Navigation list */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              Lembar Kolase ({pages.length})
            </h3>
            <span className="text-[11px] text-slate-500">Maks. 6 foto/lembar</span>
          </div>

          {pages.length > 1 && (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              {isDownloadingAll ? 'Mengunduh...' : 'Unduh Semua Halaman'}
            </button>
          )}

          <div className="space-y-2">
            {pages.map((page, idx) => {
              const startNum = idx * 6 + 1;
              const endNum = Math.min((idx + 1) * 6, sessionRecords.length);
              const isActive = currentPageIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">
                        Halaman {page.pageNumber}
                      </span>
                      {isActive && (
                        <span className="text-[10px] bg-amber-500 text-white px-1.5 rounded-full font-bold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {page.records.length > 0 ? (
                        <>Foto #{startNum} s/d #{endNum} ({page.records.length} peserta)</>
                      ) : (
                        'Belum ada foto peserta'
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Aturan Otomatis:
            </div>
            <p className="text-[11px] leading-relaxed">
              Jika peserta ke-7 absen, sistem otomatis membuat <strong>Halaman 2</strong>. Gambar beresolusi <strong>1080×1350 px</strong> tajam untuk dibagikan ke WhatsApp dan dokumen arsip resmi.
            </p>
          </div>
        </div>

        {/* Right Side: High-Resolution Canvas Display */}
        <div className="lg:col-span-3 bg-slate-900/90 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-lg relative border border-slate-800">
          {/* Top Pagination Toolbar */}
          <div className="w-full flex items-center justify-between text-white/90 mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-lg">
                Halaman {activePage.pageNumber} dari {activePage.totalPages || 1}
              </span>
              <span className="text-xs text-white/60 hidden sm:inline">
                ({activePage.records.length} Foto di lembar ini)
              </span>
            </div>

            {/* Pagination Prev / Next */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPageIndex >= pages.length - 1}
                onClick={() =>
                  setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                }
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white transition-colors"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Wrapper with realistic shadow */}
          <div className="relative max-w-full overflow-hidden flex items-center justify-center p-2">
            {isRendering && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-10 text-white text-xs font-bold rounded-xl gap-2">
                <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                Merender Kolase 1080×1350...
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="max-h-[75vh] w-auto h-auto max-w-full rounded-lg shadow-2xl object-contain border border-slate-700/50 bg-white"
            />
          </div>

          {/* Quick Caption Under Canvas */}
          <div className="mt-3 text-center text-xs text-slate-400">
            Pratinjau Asli Resolusi Penuh 1080 × 1350 Pixel • Siap Cetak &amp; Share
          </div>
        </div>
      </div>
    </div>
  );
};
