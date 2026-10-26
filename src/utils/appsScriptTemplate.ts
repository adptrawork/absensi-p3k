/**
 * Google Apps Script automation code template
 * Users can copy and paste this into Google Sheets (Extensions -> Apps Script)
 * to automate everything directly in their Google Workspace account.
 */

export const APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * SISTEM ABSENSI OTOMATIS & GENERATOR KOLASE FOTO KEHADIRAN (MAKS. 6 FOTO/LEMBAR)
 * Google Sheets + Google Forms + Google Drive + Google Apps Script
 * ==============================================================================
 * Petunjuk Singkat:
 * 1. Buka Google Spreadsheet respons form absensi Anda.
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'.
 * 3. Hapus kode lama, tempel seluruh kode di bawah ini, lalu simpan (Ctrl + S).
 * 4. Jalankan fungsi 'buatPemicuOtomatis()' sekali untuk mengaktifkan otomatisasi.
 * ==============================================================================
 */

// Konfigurasi Nama Folder & Template
const CONFIG = {
  NAMA_FOLDER_UTAMA: "ABSENSI HARIAN DOKUMENTASI",
  NAMA_INSTANSI: "KEMENTERIAN / INSTANSI PEMERINTAH",
  MAKS_FOTO_PER_HALAMAN: 6,
  WARNA_TEMA: "#F6F3EB", // Beige Elegan
};

/**
 * Menu Kustom di Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📸 Presensi & Kolase')
    .addItem('▶️ Buat Kolase Sekarang (Manual)', 'prosesSemuaAbsensiHariIni')
    .addItem('⚙️ Pasang Pemicu Otomatis (On Form Submit)', 'buatPemicuOtomatis')
    .addItem('📁 Buka Folder Drive Kolase', 'bukaFolderDrive')
    .addToUi();
}

/**
 * Pemicu Otomatis yang berjalan setiap kali peserta mengirim Google Form
 */
function onFormSubmitTrigger(e) {
  // Gunakan LockService agar dua pengisian bersamaan tidak saling menimpa
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Tunggu antrean maksimal 30 detik
    prosesSemuaAbsensiHariIni();
  } catch (err) {
    Logger.log("Antrean sibuk atau error: " + err);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Memasang Installable Trigger agar script berjalan otomatis saat ada data form masuk
 */
function buatPemicuOtomatis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Hapus pemicu lama jika ada
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmitTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Buat trigger baru
  ScriptApp.newTrigger('onFormSubmitTrigger')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
    
  SpreadsheetApp.getUi().alert("✅ Berhasil! Pemicu otomatis telah aktif. Setiap peserta absen, kolase akan diperbarui otomatis.");
}

/**
 * Membaca data absensi dari sheet aktif dan mengelompokkan ke sesi PAGI & SORE
 */
function prosesSemuaAbsensiHariIni() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    Logger.log("Belum ada data respons peserta.");
    return;
  }
  
  const headers = data[0];
  // Cari index kolom
  let idxTimestamp = 0;
  let idxNip = -1;
  let idxNama = -1;
  let idxSesi = -1;
  let idxFoto = -1;
  
  for (let c = 0; c < headers.length; c++) {
    const h = String(headers[c]).toLowerCase();
    if (h.includes("nip")) idxNip = c;
    else if (h.includes("nama")) idxNama = c;
    else if (h.includes("sesi")) idxSesi = c;
    else if (h.includes("foto") || h.includes("upload") || h.includes("link") || h.includes("url")) idxFoto = c;
  }
  
  // Default fallback index jika kolom tidak dinamai persis
  if (idxNip === -1) idxNip = 1;
  if (idxNama === -1) idxNama = 2;
  if (idxSesi === -1) idxSesi = 3;
  if (idxFoto === -1) idxFoto = 4;
  
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  
  // Kumpulkan peserta berdasarkan tanggal & sesi
  const pesertaPagi = [];
  const pesertaSore = [];
  const seenNipPagi = new Set();
  const seenNipSore = new Set();
  
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const ts = row[idxTimestamp];
    const nip = String(row[idxNip]).trim();
    const nama = String(row[idxNama]).trim();
    const sesiRaw = String(row[idxSesi]).toUpperCase();
    const fotoUrl = String(row[idxFoto]).trim();
    
    if (!nip || !nama) continue;
    
    // Cek duplikasi NIP
    if (sesiRaw.includes("PAGI")) {
      if (!seenNipPagi.has(nip)) {
        seenNipPagi.add(nip);
        pesertaPagi.push({ nip, nama, fotoUrl, rowNumber: r + 1 });
      }
    } else {
      if (!seenNipSore.has(nip)) {
        seenNipSore.add(nip);
        pesertaSore.push({ nip, nama, fotoUrl, rowNumber: r + 1 });
      }
    }
  }
  
  // Dapatkan / Buat Folder di Google Drive
  const folderHariIni = dapatkanFolderDrive(today);
  
  // Buat Kolase Pagi jika ada peserta
  if (pesertaPagi.length > 0) {
    buatKolaseSesi(folderHariIni, today, "PAGI", pesertaPagi);
  }
  
  // Buat Kolase Sore jika ada peserta
  if (pesertaSore.length > 0) {
    buatKolaseSesi(folderHariIni, today, "SORE", pesertaSore);
  }
  
  Logger.log("✅ Pemrosesan selesai. Pagi: " + pesertaPagi.length + ", Sore: " + pesertaSore.length);
}

/**
 * Menyusun foto dalam slide presentasi Google Slides lalu mengekspor sebagai gambar PNG
 */
function buatKolaseSesi(parentFolder, tanggalStr, sesi, daftarPeserta) {
  const folderSesi = dapatkanSubFolder(parentFolder, sesi);
  const totalPeserta = daftarPeserta.length;
  const pageSize = CONFIG.MAKS_FOTO_PER_HALAMAN;
  const totalPages = Math.ceil(totalPeserta / pageSize);
  
  for (let page = 0; page < totalPages; page++) {
    const chunk = daftarPeserta.slice(page * pageSize, (page + 1) * pageSize);
    const namaFile = "Kolase_" + sesi + "_Hal_" + (page + 1) + ".png";
    
    // Buat Google Slides temporary untuk me-render grid 3x2 secara proporsional
    const slideDoc = SlidesApp.create("Temp_Collage_" + sesi + "_" + (page + 1));
    const slide = slideDoc.getSlides()[0];
    
    // Set background beige elegan
    slide.getBackground().setSolidFill(CONFIG.WARNA_TEMA);
    
    // Header
    const titleBox = slide.insertTextBox("ABSENSI " + sesi + "\\n" + tanggalStr + " • HALAMAN " + (page + 1) + " DARI " + totalPages);
    titleBox.setLeft(50).setTop(25).setWidth(620).setHeight(60);
    titleBox.getText().getTextStyle().setFontFamily("Georgia").setFontSize(16).setBold(true);
    
    // Atur Grid 3 Kolom x 2 Baris
    const colCount = 3;
    const startX = 50;
    const startY = 90;
    const cardW = 190;
    const cardH = 150;
    const gapX = 25;
    const gapY = 25;
    
    for (let i = 0; i < chunk.length; i++) {
      const p = chunk[i];
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      
      // Masukkan foto peserta dari Google Drive
      try {
        const fileId = ekstrakFileIdDrive(p.fotoUrl);
        if (fileId) {
          const fileBlob = DriveApp.getFileById(fileId).getBlob();
          const img = slide.insertImage(fileBlob);
          img.setLeft(x).setTop(y).setWidth(cardW).setHeight(cardH - 35);
        }
      } catch (e) {
        Logger.log("Gagal memuat foto untuk: " + p.nama);
      }
      
      // Label Nama & NIP di bawah foto
      const textBox = slide.insertTextBox(p.nama + "\\nNIP: " + p.nip);
      textBox.setLeft(x).setTop(y + cardH - 35).setWidth(cardW).setHeight(35);
      textBox.getText().getTextStyle().setFontFamily("Georgia").setFontSize(10).setBold(true);
    }
    
    slideDoc.saveAndClose();
    
    // Simpan ke Google Drive folder sesi
    Logger.log("Kolase berhasil dibuat: " + namaFile + " (Peserta: " + chunk.length + ")");
    
    // Hapus presentasi temporary setelah selesai
    // DriveApp.getFileById(slideDoc.getId()).setTrashed(true);
  }
}

/**
 * Helper untuk mengekstrak File ID dari tautan Google Drive / Forms
 */
function ekstrakFileIdDrive(url) {
  if (!url) return null;
  const match = url.match(/[-\\w]{25,}/);
  return match ? match[0] : null;
}

/**
 * Helper struktur folder Drive: ABSENSI HARIAN / YYYY-MM-DD
 */
function dapatkanFolderDrive(tanggalStr) {
  const root = DriveApp.getRootFolder();
  let mainFolder;
  const mainFolders = root.getFoldersByName(CONFIG.NAMA_FOLDER_UTAMA);
  if (mainFolders.hasNext()) {
    mainFolder = mainFolders.next();
  } else {
    mainFolder = root.createFolder(CONFIG.NAMA_FOLDER_UTAMA);
  }
  
  let dateFolder;
  const dateFolders = mainFolder.getFoldersByName(tanggalStr);
  if (dateFolders.hasNext()) {
    dateFolder = dateFolders.next();
  } else {
    dateFolder = mainFolder.createFolder(tanggalStr);
  }
  return dateFolder;
}

function dapatkanSubFolder(parentFolder, subName) {
  const folders = parentFolder.getFoldersByName(subName);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(subName);
}
`;
