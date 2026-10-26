import React, { useState } from 'react';
import {
  AttendanceRecord,
  AttendanceSession,
  calculateStats,
  formatDateIndonesian,
  processDuplicates,
  DuplicatePolicy,
} from '../utils/attendance';
import {
  Search,
  Filter,
  Download,
  Trash2,
  AlertTriangle,
  UserCheck,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  Users,
} from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onAddRecord: () => void;
  onDeleteRecord: (id: string) => void;
  onResetData: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  duplicatePolicy: DuplicatePolicy;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onResetData,
  selectedDate,
  onSelectDate,
  duplicatePolicy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'ALL' | AttendanceSession>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Process duplicates according to policy
  const { validRecords } = processDuplicates(records, duplicatePolicy);
  const stats = calculateStats(validRecords);

  // Filter records
  const filtered = validRecords.filter((rec) => {
    const matchDate = !selectedDate || rec.date === selectedDate;
    const matchSession = sessionFilter === 'ALL' || rec.session === sessionFilter;
    const matchSearch =
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.nip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDate && matchSession && matchSearch;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Waktu', 'Tanggal', 'NIP', 'Nama Lengkap', 'Sesi', 'Status Duplikat', 'Catatan'];
    const rows = filtered.map((r) => [
      r.timestamp ? new Date(r.timestamp).toLocaleTimeString('id-ID') : '-',
      r.date,
      `"${r.nip}"`,
      `"${r.name}"`,
      r.session,
      r.isDuplicate ? 'Duplikat' : 'Sah',
      `"${r.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Absensi_${selectedDate || 'Semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{stats.uniqueNips}</div>
            <div className="text-xs font-semibold text-slate-500">Total Pegawai Hadir</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700">{stats.pagiCount}</div>
            <div className="text-xs font-semibold text-slate-500">Presensi Pagi</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-700">{stats.soreCount}</div>
            <div className="text-xs font-semibold text-slate-500">Presensi Sore</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-700">{stats.duplicateCount}</div>
            <div className="text-xs font-semibold text-slate-500">Duplikat Terdeteksi</div>
          </div>
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama atau NIP..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Sesi & Date Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setSessionFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sessionFilter === 'ALL'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Semua Sesi
              </button>
              <button
                onClick={() => setSessionFilter('PAGI')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sessionFilter === 'PAGI'
                    ? 'bg-white text-amber-700 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pagi ({stats.pagiCount})
              </button>
              <button
                onClick={() => setSessionFilter('SORE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sessionFilter === 'SORE'
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sore ({stats.soreCount})
              </button>
            </div>

            {/* Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />

            {/* Action buttons */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              title="Unduh Rekap CSV"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              onClick={onAddRecord}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Absen
            </button>

            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Kembalikan data demo asli"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4 w-14">Foto</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Sesi</th>
                <th className="py-3 px-4">Waktu Presensi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada catatan absensi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((record, index) => {
                  const isPagi = record.session === 'PAGI';
                  const timeFormatted = record.timestamp
                    ? new Date(record.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + ' WIB'
                    : '-';

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        record.isDuplicate ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <img
                          src={record.photoUrl}
                          alt={record.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-300 shadow-2xs"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{record.name}</div>
                        {record.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {record.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {record.nip}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isPagi
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {isPagi ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                          {record.session}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{timeFormatted}</td>
                      <td className="py-3 px-4">
                        {record.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Duplikat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <UserCheck className="w-2.5 h-2.5" />
                            Terverifikasi
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus rekaman ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Hapus Catatan Absensi?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan kehadiran peserta ini? Tindakan ini akan memperbarui kolase foto otomatis.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
