import { AttendanceRecord } from './attendance';

// Realistic SVG avatar portraits with professional attire for offline/instant high-res collage rendering
export function createSvgAvatar(seed: string, name: string, bg: string, attireColor: string): string {
  const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="bg-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="#E2D9C8" />
      </linearGradient>
      <linearGradient id="suit-${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${attireColor}" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="400" height="400" fill="url(#bg-${seed})" />
    
    <!-- Office background accent lines -->
    <line x1="0" y1="120" x2="400" y2="120" stroke="#000000" stroke-opacity="0.04" stroke-width="2" />
    <line x1="140" y1="0" x2="140" y2="400" stroke="#000000" stroke-opacity="0.04" stroke-width="2" />
    <line x1="280" y1="0" x2="280" y2="400" stroke="#000000" stroke-opacity="0.04" stroke-width="2" />

    <!-- Shoulders / Attire -->
    <path d="M 80 400 C 80 300, 140 280, 200 280 C 260 280, 320 300, 320 400 Z" fill="url(#suit-${seed})" />
    
    <!-- Shirt Collar -->
    <polygon points="170,280 200,340 185,280" fill="#FFFFFF" />
    <polygon points="230,280 200,340 215,280" fill="#FFFFFF" />
    <polygon points="195,295 205,295 203,360 197,360" fill="#B91C1C" />

    <!-- Neck -->
    <rect x="175" y="220" width="50" height="70" rx="10" fill="#F3D0B5" />
    
    <!-- Head -->
    <ellipse cx="200" cy="180" rx="65" ry="75" fill="#F8DEC9" />
    
    <!-- Hair -->
    <path d="M 135 170 C 135 110, 160 95, 200 95 C 240 95, 265 110, 265 170 C 255 145, 240 135, 200 135 C 160 135, 145 145, 135 170 Z" fill="#292524" />
    
    <!-- Glasses or Eyes -->
    <circle cx="178" cy="175" r="4" fill="#334155" />
    <circle cx="222" cy="175" r="4" fill="#334155" />
    <path d="M 170 165 Q 178 160 186 165" stroke="#334155" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 214 165 Q 222 160 230 165" stroke="#334155" stroke-width="2.5" fill="none" stroke-linecap="round" />
    
    <!-- Smile -->
    <path d="M 188 215 Q 200 225 212 215" stroke="#9A3412" stroke-width="2.5" fill="none" stroke-linecap="round" />
    
    <!-- ID Badge Ribbon -->
    <path d="M 185 340 L 195 385 L 205 385 L 215 340" stroke="#0284C7" stroke-width="3" fill="none" />
    <rect x="185" y="375" width="30" height="25" rx="3" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
    <rect x="189" y="380" width="22" height="4" fill="#0284C7" />

    <!-- Initials Watermark in bottom corner -->
    <rect x="330" y="340" width="50" height="45" rx="6" fill="#000000" fill-opacity="0.35" />
    <text x="355" y="369" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#FFFFFF" text-anchor="middle">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-01',
    nip: '19880412 201201 1 001',
    name: 'Drs. Hendra Setiawan, M.Si',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:12:00.000Z',
    photoUrl: createSvgAvatar('1', 'Hendra Setiawan', '#E8DFD0', '#1E3A8A'),
    notes: 'Hadir apel pagi tepat waktu',
  },
  {
    id: 'att-02',
    nip: '19910520 201503 2 004',
    name: 'Siti Nurhaliza, S.STP',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:18:22.000Z',
    photoUrl: createSvgAvatar('2', 'Siti Nurhaliza', '#E2D5C3', '#0F766E'),
    notes: 'Presensi ruang rapat utama',
  },
  {
    id: 'att-03',
    nip: '19850914 200902 1 003',
    name: 'Bambang Prasetyo, S.Kom',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:22:15.000Z',
    photoUrl: createSvgAvatar('3', 'Bambang Prasetyo', '#DDD2C1', '#334155'),
    notes: 'Divisi TI & Sistem Informasi',
  },
  {
    id: 'att-04',
    nip: '19931201 201901 2 006',
    name: 'Dewi Anggraini, S.E, M.M',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:25:40.000Z',
    photoUrl: createSvgAvatar('4', 'Dewi Anggraini', '#E9DFD0', '#475569'),
    notes: 'Bagian Perencanaan & Keuangan',
  },
  {
    id: 'att-05',
    nip: '19870817 201101 1 005',
    name: 'Rian Pratama, S.H',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:28:10.000Z',
    photoUrl: createSvgAvatar('5', 'Rian Pratama', '#DFD3BF', '#1E293B'),
    notes: 'Subbag Hukum & Kerjasama',
  },
  {
    id: 'att-06',
    nip: '19940210 201802 2 008',
    name: 'Anisa Fitriani, S.Pd',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:30:05.000Z',
    photoUrl: createSvgAvatar('6', 'Anisa Fitriani', '#E3D7C5', '#166534'),
    notes: 'Pusat Pelatihan & SDM',
  },
  {
    id: 'att-07',
    nip: '19890615 201402 1 002',
    name: 'dr. Fajar Kusuma, Sp.A',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:35:12.000Z',
    photoUrl: createSvgAvatar('7', 'Fajar Kusuma', '#E6DDD0', '#0369A1'),
    notes: 'Unit Layanan Kesehatan',
  },
  {
    id: 'att-08',
    nip: '19920708 201701 2 005',
    name: 'Mega Puspita, S.Sos',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:38:45.000Z',
    photoUrl: createSvgAvatar('8', 'Mega Puspita', '#DBD0BD', '#854D0E'),
    notes: 'Humas & Protokol',
  },
  // Sore Sessions
  {
    id: 'att-09',
    nip: '19880412 201201 1 001',
    name: 'Drs. Hendra Setiawan, M.Si',
    session: 'SORE',
    date: '2026-10-26',
    timestamp: '2026-10-26T16:05:00.000Z',
    photoUrl: createSvgAvatar('1', 'Hendra Setiawan', '#E8DFD0', '#1E3A8A'),
    notes: 'Absen kepulangan selesai piket',
  },
  {
    id: 'att-10',
    nip: '19910520 201503 2 004',
    name: 'Siti Nurhaliza, S.STP',
    session: 'SORE',
    date: '2026-10-26',
    timestamp: '2026-10-26T16:12:30.000Z',
    photoUrl: createSvgAvatar('2', 'Siti Nurhaliza', '#E2D5C3', '#0F766E'),
    notes: 'Absensi sore kantor wilayah',
  },
  {
    id: 'att-11',
    nip: '19850914 200902 1 003',
    name: 'Bambang Prasetyo, S.Kom',
    session: 'SORE',
    date: '2026-10-26',
    timestamp: '2026-10-26T16:15:10.000Z',
    photoUrl: createSvgAvatar('3', 'Bambang Prasetyo', '#DDD2C1', '#334155'),
    notes: 'Check out sistem kantor',
  },
];
