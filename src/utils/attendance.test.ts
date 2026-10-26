import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processDuplicates,
  chunkIntoCollagePages,
  calculateStats,
  formatDateIndonesian,
  AttendanceRecord,
} from './attendance';

const mockRecords: AttendanceRecord[] = [
  {
    id: '1',
    nip: '19850101',
    name: 'Budi Santoso',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:15:00.000Z',
    photoUrl: 'data:image/png;base64,sample1',
  },
  {
    id: '2',
    nip: '19850102',
    name: 'Siti Rahma',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:20:00.000Z',
    photoUrl: 'data:image/png;base64,sample2',
  },
  {
    id: '3',
    nip: '19850101', // duplicate NIP in same date and session
    name: 'Budi Santoso (repeat)',
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: '2026-10-26T07:25:00.000Z',
    photoUrl: 'data:image/png;base64,sample3',
  },
  {
    id: '4',
    nip: '19850103',
    name: 'Ahmad Fauzi',
    session: 'SORE',
    date: '2026-10-26',
    timestamp: '2026-10-26T16:05:00.000Z',
    photoUrl: 'data:image/png;base64,sample4',
  },
];

test('processDuplicates rejects second entry when policy is reject', () => {
  const result = processDuplicates(mockRecords, 'reject');
  assert.equal(result.duplicatesCount, 1);
  assert.equal(result.validRecords.length, 3);
  const nips = result.validRecords.map(r => r.nip);
  assert.deepEqual(nips, ['19850101', '19850102', '19850103']);
});

test('processDuplicates marks second entry when policy is mark', () => {
  const result = processDuplicates(mockRecords, 'mark');
  assert.equal(result.duplicatesCount, 1);
  assert.equal(result.validRecords.length, 4);
  const dup = result.validRecords.find(r => r.id === '3');
  assert.equal(dup?.isDuplicate, true);
});

test('chunkIntoCollagePages chunks strictly into max 6 per page', () => {
  const records: AttendanceRecord[] = Array.from({ length: 14 }).map((_, i) => ({
    id: `rec-${i}`,
    nip: `NIP-${i}`,
    name: `Peserta ${i + 1}`,
    session: 'PAGI',
    date: '2026-10-26',
    timestamp: new Date(Date.now() + i * 1000).toISOString(),
    photoUrl: `sample-${i}`,
  }));

  const pages = chunkIntoCollagePages(records, '2026-10-26', 'PAGI', 6);
  // 14 participants = 3 pages (6, 6, 2)
  assert.equal(pages.length, 3);
  assert.equal(pages[0].records.length, 6);
  assert.equal(pages[0].pageNumber, 1);
  assert.equal(pages[0].totalPages, 3);
  assert.equal(pages[1].records.length, 6);
  assert.equal(pages[1].pageNumber, 2);
  assert.equal(pages[2].records.length, 2);
  assert.equal(pages[2].pageNumber, 3);
  assert.equal(pages[2].totalRecordsInSession, 14);
});

test('calculateStats aggregates correctly', () => {
  const { validRecords } = processDuplicates(mockRecords, 'mark');
  const stats = calculateStats(validRecords);
  assert.equal(stats.totalSubmissions, 4);
  assert.equal(stats.pagiCount, 2); // 1 is duplicate
  assert.equal(stats.soreCount, 1);
  assert.equal(stats.duplicateCount, 1);
  assert.equal(stats.uniqueNips, 3);
});

test('formatDateIndonesian produces uppercase Indonesian month string', () => {
  assert.equal(formatDateIndonesian('2026-10-26'), '26 OKTOBER 2026');
  assert.equal(formatDateIndonesian('2026-08-17'), '17 AGUSTUS 2026');
});
