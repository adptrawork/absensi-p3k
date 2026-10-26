import { CollagePage, CollageSettings, formatDateIndonesian } from './attendance';

// Helper to load image safely into HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      console.warn('Failed to load image, using fallback:', src, err);
      // Create fallback colored placeholder image
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 300;
      fallbackCanvas.height = 300;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FOTO DOKUMEN', 150, 150);
      }
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = fallbackCanvas.toDataURL();
    };
    img.src = src;
  });
}

/**
 * Render complete 1080x1350 collage on HTML5 Canvas
 */
export async function renderCollageToCanvas(
  canvas: HTMLCanvasElement,
  page: CollagePage,
  settings: CollageSettings
): Promise<void> {
  const isLandscape = settings.orientation === 'landscape';
  const width = isLandscape ? 1350 : 1080;
  const height = isLandscape ? 1080 : 1350;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Pre-load all photo images
  const imageElements = await Promise.all(
    page.records.map(record => loadImage(record.photoUrl))
  );

  if (settings.template === 'beige') {
    renderBeigeTemplate(ctx, width, height, page, settings, imageElements);
  } else if (settings.template === 'formal') {
    renderFormalTemplate(ctx, width, height, page, settings, imageElements);
  } else {
    renderMinimalistTemplate(ctx, width, height, page, settings, imageElements);
  }
}

/**
 * Template A: ELEGAN BEIGE (Warm Cream, Gold Accents, Luxury Serif, Editorial Grid)
 */
function renderBeigeTemplate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  page: CollagePage,
  settings: CollageSettings,
  images: HTMLImageElement[]
) {
  // 1. Background gradient (Warm beige/parchment)
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#F9F6F0');
  bgGrad.addColorStop(0.5, '#F5F0E6');
  bgGrad.addColorStop(1, '#EDE5D6');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Double Luxury Outer Border
  ctx.strokeStyle = '#D8C7A5';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, w - 72, h - 72);

  ctx.strokeStyle = '#B39968';
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, w - 88, h - 88);

  // Corner decorative flourishes
  const drawCornerFlourish = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#B39968';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.stroke();
    ctx.restore();
  };
  drawCornerFlourish(44, 44, 0);
  drawCornerFlourish(w - 44, 44, Math.PI / 2);
  drawCornerFlourish(w - 44, h - 44, Math.PI);
  drawCornerFlourish(44, h - 44, -Math.PI / 2);

  // 3. Header Section
  const headerY = 75;
  ctx.textAlign = 'center';

  // Subtitle / Agency
  ctx.fillStyle = '#8C7449';
  ctx.font = '600 15px Georgia, serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(settings.titlePrefix.toUpperCase(), w / 2, headerY + 15);

  // Main Session Title: "ABSENSI PAGI" / "ABSENSI SORE"
  ctx.fillStyle = '#2B231A';
  ctx.font = 'bold 44px Georgia, "Times New Roman", serif';
  ctx.letterSpacing = '2px';
  const sessionText = page.session === 'PAGI' ? 'ABSENSI PAGI' : 'ABSENSI SORE';
  ctx.fillText(sessionText, w / 2, headerY + 68);

  // Date and Page banner
  ctx.fillStyle = '#6E5D44';
  ctx.font = '600 18px Georgia, serif';
  ctx.letterSpacing = '1.5px';
  const dateFormatted = formatDateIndonesian(page.date);
  ctx.fillText(dateFormatted, w / 2, headerY + 102);

  // Decorative divider line under header
  ctx.strokeStyle = '#D1BF9B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 180, headerY + 118);
  ctx.lineTo(w / 2 + 180, headerY + 118);
  ctx.stroke();

  // Small gold diamond in center of divider
  ctx.fillStyle = '#B39968';
  ctx.beginPath();
  ctx.arc(w / 2, headerY + 118, 4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Grid Configuration (3 cols x 2 rows = 6 photos max)
  const cols = 3;
  const rows = 2;
  const gridTop = 225;
  const gridBottom = h - 110;
  const gridLeft = 68;
  const gridRight = w - 68;
  const gridWidth = gridRight - gridLeft;
  const gridHeight = gridBottom - gridTop;

  const gapX = 26;
  const gapY = 32;

  const cardWidth = (gridWidth - (cols - 1) * gapX) / cols;
  const cardHeight = (gridHeight - (rows - 1) * gapY) / rows;

  // Photo dimensions inside card
  const photoHeight = cardHeight - 110;

  for (let i = 0; i < 6; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardX = gridLeft + col * (cardWidth + gapX);
    const cardY = gridTop + row * (cardHeight + gapY);

    const record = page.records[i];
    const img = images[i];

    // Card background panel (off-white card)
    ctx.fillStyle = '#FCFAF6';
    ctx.strokeStyle = '#DFD3BC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Inner gold trim border
    ctx.strokeStyle = '#EDE4D1';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX + 6, cardY + 6, cardWidth - 12, cardHeight - 12);

    if (record && img) {
      // Photo frame area
      const px = cardX + 12;
      const py = cardY + 12;
      const pw = cardWidth - 24;
      const ph = photoHeight;

      // Draw Photo with object-fit cover
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 4);
      ctx.clip();

      drawCoverImage(ctx, img, px, py, pw, ph);

      // Subtle inner shadow / border for photo
      ctx.restore();

      ctx.strokeStyle = '#C9B897';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, py, pw, ph);

      // Index Badge in top-left corner of photo
      const indexNum = String((page.pageNumber - 1) * 6 + (i + 1)).padStart(2, '0');
      ctx.fillStyle = '#2B231A';
      ctx.fillRect(px, py, 42, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px Georgia, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(indexNum, px + 21, py + 18);

      // Text Info: Name & NIP below photo
      const textCenterY = py + ph + 18;
      ctx.textAlign = 'center';

      // Participant Name
      ctx.fillStyle = '#1E1812';
      ctx.font = 'bold 15px Georgia, "Times New Roman", serif';
      const truncatedName = fitText(ctx, record.name, cardWidth - 24);
      ctx.fillText(truncatedName, cardX + cardWidth / 2, textCenterY + 12);

      // NIP
      ctx.fillStyle = '#6E5D44';
      ctx.font = '600 13px Georgia, sans-serif';
      ctx.fillText(`NIP: ${record.nip}`, cardX + cardWidth / 2, textCenterY + 36);

      // Timestamp badge or notes
      const timeStr = record.timestamp
        ? new Date(record.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        : 'Hadir';
      ctx.fillStyle = '#8C7449';
      ctx.font = '500 11px sans-serif';
      ctx.fillText(timeStr, cardX + cardWidth / 2, textCenterY + 56);
    } else {
      // Empty Slot Placeholder
      ctx.fillStyle = '#EBE5D8';
      ctx.fillRect(cardX + 12, cardY + 12, cardWidth - 24, photoHeight);

      ctx.fillStyle = '#9C8E79';
      ctx.font = 'italic 14px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Slot Tersedia', cardX + cardWidth / 2, cardY + photoHeight / 2 + 12);
    }
  }

  // 5. Footer Bar
  const footerY = h - 65;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2B231A';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(
    `TOTAL: ${page.totalRecordsInSession} PESERTA  •  HALAMAN ${page.pageNumber} DARI ${page.totalPages || 1}`,
    w / 2,
    footerY
  );

  ctx.fillStyle = '#786650';
  ctx.font = '500 12px Georgia, serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(
    settings.agencyName ? `${settings.agencyName} — ${settings.subAgencyName}` : 'DOKUMENTASI ABSENSI HARIAN',
    w / 2,
    footerY + 22
  );
}

/**
 * Template B: FORMAL INSTANSI (Navy Header, Gold Foil Emblems, Official Seal, Crisp Corporate Layout)
 */
function renderFormalTemplate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  page: CollagePage,
  settings: CollageSettings,
  images: HTMLImageElement[]
) {
  // 1. Crisp clean background
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, w, h);

  // 2. Official Header Ribbon in Deep Navy (#0F2537)
  const headerHeight = 185;
  const navyGrad = ctx.createLinearGradient(0, 0, w, 0);
  navyGrad.addColorStop(0, '#0F172A');
  navyGrad.addColorStop(0.5, '#1E3A8A');
  navyGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = navyGrad;
  ctx.fillRect(0, 0, w, headerHeight);

  // Gold accent stripe below header
  ctx.fillStyle = '#D97706';
  ctx.fillRect(0, headerHeight, w, 6);

  // Header Typography
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 14px sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(settings.agencyName.toUpperCase(), w / 2, 45);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 13px sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(settings.subAgencyName.toUpperCase(), w / 2, 68);

  // Main Session Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.letterSpacing = '2px';
  const sessionText = page.session === 'PAGI' ? 'DOKUMENTASI ABSENSI PAGI' : 'DOKUMENTASI ABSENSI SORE';
  ctx.fillText(sessionText, w / 2, 118);

  // Date and Badge Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(w / 2 - 200, 136, 400, 32, 16);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 14px sans-serif';
  ctx.fillText(`${formatDateIndonesian(page.date)} • HALAMAN ${page.pageNumber}/${page.totalPages || 1}`, w / 2, 157);

  // 3. Grid for 6 photos
  const cols = 3;
  const rows = 2;
  const gridTop = 225;
  const gridBottom = h - 90;
  const gridLeft = 60;
  const gridRight = w - 60;
  const gridWidth = gridRight - gridLeft;
  const gridHeight = gridBottom - gridTop;

  const gapX = 24;
  const gapY = 28;

  const cardWidth = (gridWidth - (cols - 1) * gapX) / cols;
  const cardHeight = (gridHeight - (rows - 1) * gapY) / rows;
  const photoHeight = cardHeight - 105;

  for (let i = 0; i < 6; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardX = gridLeft + col * (cardWidth + gapX);
    const cardY = gridTop + row * (cardHeight + gapY);

    const record = page.records[i];
    const img = images[i];

    // Card Container with crisp shadow
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 8);
    ctx.fill();
    ctx.stroke();

    if (record && img) {
      const px = cardX + 10;
      const py = cardY + 10;
      const pw = cardWidth - 20;
      const ph = photoHeight;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 6);
      ctx.clip();
      drawCoverImage(ctx, img, px, py, pw, ph);
      ctx.restore();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      // Official Stamp Pill
      const indexNum = String((page.pageNumber - 1) * 6 + (i + 1)).padStart(2, '0');
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(px, py, 45, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`#${indexNum}`, px + 22.5, py + 16);

      // Name & NIP
      const textCenterY = py + ph + 18;
      ctx.textAlign = 'center';

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px sans-serif';
      const truncatedName = fitText(ctx, record.name, cardWidth - 20);
      ctx.fillText(truncatedName, cardX + cardWidth / 2, textCenterY + 10);

      ctx.fillStyle = '#1E3A8A';
      ctx.font = '600 13px sans-serif';
      ctx.fillText(`NIP. ${record.nip}`, cardX + cardWidth / 2, textCenterY + 32);

      // Status pill: TERVERIFIKASI
      ctx.fillStyle = '#DCFCE7';
      ctx.beginPath();
      ctx.roundRect(cardX + cardWidth / 2 - 45, textCenterY + 44, 90, 20, 10);
      ctx.fill();
      ctx.fillStyle = '#15803D';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('TERCATAT', cardX + cardWidth / 2, textCenterY + 58);
    } else {
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(cardX + 10, cardY + 10, cardWidth - 20, photoHeight);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Belum Ada Peserta', cardX + cardWidth / 2, cardY + photoHeight / 2 + 10);
    }
  }

  // 4. Footer Official
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = '600 13px sans-serif';
  ctx.fillText(
    `SISTEM ABSENSI RESMI • JUMLAH PESERTA: ${page.totalRecordsInSession} ORANG • GENERATED OTOMATIS`,
    w / 2,
    h - 45
  );
}

/**
 * Template C: MINIMALIS MODERN (Clean Monochromatic, Crisp Thin Lines, Bold Indexing)
 */
function renderMinimalistTemplate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  page: CollagePage,
  settings: CollageSettings,
  images: HTMLImageElement[]
) {
  // Pure White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // Modern Minimal Border
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  // Header
  const headerY = 85;
  ctx.textAlign = 'left';

  // Category
  ctx.fillStyle = '#71717A';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('ATTENDANCE REPORT // DOKUMENTASI KEHADIRAN', 65, headerY + 10);

  // Big Bold Title
  ctx.fillStyle = '#09090B';
  ctx.font = '800 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '-1px';
  const sessionText = page.session === 'PAGI' ? 'ABSENSI PAGI' : 'ABSENSI SORE';
  ctx.fillText(sessionText, 65, headerY + 58);

  // Date on right side
  ctx.textAlign = 'right';
  ctx.fillStyle = '#18181B';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(formatDateIndonesian(page.date), w - 65, headerY + 38);

  ctx.fillStyle = '#71717A';
  ctx.font = '500 14px sans-serif';
  ctx.fillText(`PAGE ${page.pageNumber} / ${page.totalPages || 1} • ${page.totalRecordsInSession} TOTAL`, w - 65, headerY + 62);

  // Hairline separator
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(65, headerY + 85);
  ctx.lineTo(w - 65, headerY + 85);
  ctx.stroke();

  // 6 Photos Grid
  const cols = 3;
  const rows = 2;
  const gridTop = 205;
  const gridBottom = h - 90;
  const gridLeft = 65;
  const gridRight = w - 65;
  const gridWidth = gridRight - gridLeft;
  const gridHeight = gridBottom - gridTop;

  const gapX = 24;
  const gapY = 28;

  const cardWidth = (gridWidth - (cols - 1) * gapX) / cols;
  const cardHeight = (gridHeight - (rows - 1) * gapY) / rows;
  const photoHeight = cardHeight - 95;

  for (let i = 0; i < 6; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardX = gridLeft + col * (cardWidth + gapX);
    const cardY = gridTop + row * (cardHeight + gapY);

    const record = page.records[i];
    const img = images[i];

    // Clean border
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

    if (record && img) {
      const px = cardX + 8;
      const py = cardY + 8;
      const pw = cardWidth - 16;
      const ph = photoHeight;

      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      drawCoverImage(ctx, img, px, py, pw, ph);
      ctx.restore();

      // Sharp index indicator
      const indexNum = String((page.pageNumber - 1) * 6 + (i + 1)).padStart(2, '0');
      ctx.fillStyle = '#09090B';
      ctx.fillRect(px, py, 36, 22);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(indexNum, px + 18, py + 15);

      // Name & NIP
      const textCenterY = py + ph + 16;
      ctx.textAlign = 'left';

      ctx.fillStyle = '#09090B';
      ctx.font = '700 14px sans-serif';
      const truncatedName = fitText(ctx, record.name, cardWidth - 20);
      ctx.fillText(truncatedName, cardX + 12, textCenterY + 12);

      ctx.fillStyle = '#71717A';
      ctx.font = '500 12px monospace';
      ctx.fillText(`NIP. ${record.nip}`, cardX + 12, textCenterY + 32);
    } else {
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(cardX + 8, cardY + 8, cardWidth - 16, photoHeight);
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('— Kosong —', cardX + cardWidth / 2, cardY + photoHeight / 2 + 8);
    }
  }

  // Footer
  ctx.textAlign = 'left';
  ctx.fillStyle = '#71717A';
  ctx.font = '500 12px sans-serif';
  ctx.fillText(settings.agencyName || 'PRESENSI DOKUMENTASI FOTO', 65, h - 55);

  ctx.textAlign = 'right';
  ctx.fillText('RESOLUSI TINGGI 1080×1350 PX', w - 65, h - 55);
}

/**
 * Draw image with CSS 'object-fit: cover' behavior on canvas
 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  if (!imgW || !imgH) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  const imgRatio = imgW / imgH;
  const targetRatio = w / h;

  let sX = 0;
  let sY = 0;
  let sW = imgW;
  let sH = imgH;

  if (imgRatio > targetRatio) {
    // Image is wider than target
    sW = imgH * targetRatio;
    sX = (imgW - sW) / 2;
  } else {
    // Image is taller than target
    sH = imgW / targetRatio;
    sY = (imgH - sH) / 2;
  }

  ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);
}

/**
 * Truncate text with ellipsis if it exceeds max width
 */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/**
 * Trigger immediate browser download of canvas as PNG
 */
export function downloadCollageAsPng(canvas: HTMLCanvasElement, filename: string) {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Copy canvas image to user's system clipboard (PNG blob)
 */
export async function copyCollageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve(true);
        } catch (err) {
          console.warn('Clipboard write failed:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Copy to clipboard error:', err);
    return false;
  }
}
