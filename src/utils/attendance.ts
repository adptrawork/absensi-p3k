export type AttendanceSession = 'PAGI' | 'SORE';

export type DuplicatePolicy = 'reject' | 'mark';

export type TemplateStyle = 'beige' | 'formal' | 'minimalist';

export type CollageOrientation = 'portrait' | 'landscape';

export interface AttendanceRecord {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  nip: string;
  name: string;
  session: AttendanceSession;
  photoUrl: string; // Data URL or Image URL
  notes?: string;
  isDuplicate?: boolean;
}

export interface CollagePage {
  pageNumber: number;
  totalPages: number;
  date: string;
  session: AttendanceSession;
  records: AttendanceRecord[];
  totalRecordsInSession: number;
}

export interface CollageSettings {
  template: TemplateStyle;
  orientation: CollageOrientation;
  agencyName: string;
  subAgencyName: string;
  logoUrl?: string;
  duplicatePolicy: DuplicatePolicy;
  titlePrefix: string;
  accentColor: string;
}

export const DEFAULT_SETTINGS: CollageSettings = {
  template: 'beige',
  orientation: 'portrait',
  agencyName: 'KEMENTERIAN KOORDINASI NASIONAL',
  subAgencyName: 'BIRO KEPEGAWAIAN DAN SUMBER DAYA MANUSIA',
  duplicatePolicy: 'mark',
  titlePrefix: 'DOKUMENTASI ABSENSI KEHADIRAN',
  accentColor: '#B8860B',
};

/**
 * Filter or flag duplicate entries based on NIP, Date, and Session
 */
export function processDuplicates(
  records: AttendanceRecord[],
  policy: DuplicatePolicy = 'mark'
): { validRecords: AttendanceRecord[]; duplicatesCount: number } {
  const seenKeys = new Set<string>();
  const validRecords: AttendanceRecord[] = [];
  let duplicatesCount = 0;

  // Process in chronological order
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const record of sorted) {
    const key = `${record.date}_${record.session}_${record.nip.trim().toLowerCase()}`;
    if (seenKeys.has(key)) {
      duplicatesCount++;
      if (policy === 'mark') {
        validRecords.push({ ...record, isDuplicate: true });
      }
      // If 'reject', we simply don't include it in the valid list
    } else {
      seenKeys.add(key);
      validRecords.push({ ...record, isDuplicate: false });
    }
  }

  return { validRecords, duplicatesCount };
}

/**
 * Group records by Date and Session
 */
export function groupRecordsByDateAndSession(
  records: AttendanceRecord[]
): Record<string, Record<AttendanceSession, AttendanceRecord[]>> {
  const grouped: Record<string, Record<AttendanceSession, AttendanceRecord[]>> = {};

  for (const record of records) {
    if (!grouped[record.date]) {
      grouped[record.date] = { PAGI: [], SORE: [] };
    }
    grouped[record.date][record.session].push(record);
  }

  return grouped;
}

/**
 * Split records into collage pages (strictly max 6 records per page)
 */
export function chunkIntoCollagePages(
  records: AttendanceRecord[],
  date: string,
  session: AttendanceSession,
  pageSize = 6
): CollagePage[] {
  // Only non-rejected records (or if marked, user can decide whether to include duplicates)
  const activeRecords = records.filter(r => !r.isDuplicate);
  if (activeRecords.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        date,
        session,
        records: [],
        totalRecordsInSession: 0,
      },
    ];
  }

  const pages: CollagePage[] = [];
  const totalPages = Math.ceil(activeRecords.length / pageSize);

  for (let i = 0; i < totalPages; i++) {
    const slice = activeRecords.slice(i * pageSize, (i + 1) * pageSize);
    pages.push({
      pageNumber: i + 1,
      totalPages,
      date,
      session,
      records: slice,
      totalRecordsInSession: activeRecords.length,
    });
  }

  return pages;
}

/**
 * Calculate attendance statistics
 */
export function calculateStats(records: AttendanceRecord[]) {
  const totalSubmissions = records.length;
  const pagiCount = records.filter(r => r.session === 'PAGI' && !r.isDuplicate).length;
  const soreCount = records.filter(r => r.session === 'SORE' && !r.isDuplicate).length;
  const duplicateCount = records.filter(r => r.isDuplicate).length;

  const uniqueNips = new Set(records.map(r => r.nip.trim().toLowerCase())).size;

  return {
    totalSubmissions,
    pagiCount,
    soreCount,
    duplicateCount,
    uniqueNips,
  };
}

/**
 * Format date in Indonesian format: e.g. "26 OKTOBER 2026"
 */
export function formatDateIndonesian(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;

    const months = [
      'JANUARI',
      'FEBRUARI',
      'MARET',
      'APRIL',
      'MEI',
      'JUNI',
      'JULI',
      'AGUSTUS',
      'SEPTEMBER',
      'OKTOBER',
      'NOVEMBER',
      'DESEMBER',
    ];

    const monthName = months[month - 1] || '';
    return `${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}
