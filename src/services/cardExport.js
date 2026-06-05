// Print-ready greeting-card export.
//
// Composes a foldable card layout onto a <canvas> at print DPI, then drops each
// page into a jsPDF sized to the exact physical sheet. The source image is a
// base64 data URL (no CORS), so it draws to canvas directly.
//
// Two formats (see CARD_EXPORT.formats):
//   • quarterFold — one Letter/A4 sheet, single-sided, fold twice → 4.25×5.5.
//     Top two quadrants are drawn upside-down so they read correctly once folded.
//   • halfFold5x7 — a 10×7 spread, two pages (outside/inside) for duplex / print shop.

import { CARD_EXPORT } from '../config/constants.js';
import { getTextStyle } from '../config/textStyles.js';

const { panelMargin } = CARD_EXPORT;

// Ensure the web fonts used by a front-text style are loaded before drawing to
// canvas — otherwise the browser silently substitutes a fallback font. Resolves
// even if a font fails (we just draw with whatever's available).
export async function ensureFontsLoaded(families = []) {
  if (!document.fonts) return;
  try {
    await Promise.all(
      families.map((f) => document.fonts.load(`700 64px ${f}`).catch(() => {}))
    );
    await document.fonts.ready;
  } catch {
    /* best effort */
  }
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function defaultMessageForOccasion(label) {
  if (!label) return 'Happy Birthday!';
  return `Happy ${label}!`;
}

// ---- low-level drawing helpers (all coordinates in pixels) -----------------

function setupCanvas(canvas, wIn, hIn, ppi) {
  canvas.width = Math.round(wIn * ppi);
  canvas.height = Math.round(hIn * ppi);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

// Run drawFn in a local coordinate space (0..w, 0..h) for a panel at (x,y).
// When `rotated`, the panel is drawn upside-down (for quarter-fold top quadrants).
function inPanel(ctx, x, y, w, h, rotated, drawFn) {
  ctx.save();
  if (rotated) {
    ctx.translate(x + w, y + h);
    ctx.rotate(Math.PI);
  } else {
    ctx.translate(x, y);
  }
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  drawFn(ctx, w, h);
  ctx.restore();
}

function drawImageCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw, dh;
  if (ir > r) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawWrappedText(ctx, text, x, y, w, h, { fontPx, family, style = '', color, lineGap = 1.32 }) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${style} ${Math.round(fontPx)}px ${family}`.trim();

  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > w && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);

  const lh = fontPx * lineGap;
  const totalH = lines.length * lh;
  let cy = y + (h - totalH) / 2 + fontPx * 0.82;
  for (const ln of lines) {
    ctx.fillText(ln, x + w / 2, cy);
    cy += lh;
  }
  ctx.restore();
}

function drawFoldGuide(ctx, x1, y1, x2, y2) {
  const { guide } = CARD_EXPORT;
  ctx.save();
  ctx.strokeStyle = guide.color;
  ctx.lineWidth = guide.width;
  ctx.setLineDash(guide.dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// ---- panel content ----------------------------------------------------------

function applyCase(text, kind) {
  if (kind === 'upper') return text.toUpperCase();
  if (kind === 'title') return text.replace(/\b\w/g, (c) => c.toUpperCase());
  return text;
}

// Draw the front headline as our own overlay layer (never the AI model), with a
// legibility treatment so it reads on any image. Coordinates are panel-local px.
function drawFrontText(ctx, w, h, ppi, frontText) {
  const raw = frontText?.text?.trim();
  if (!raw) return;
  const style = getTextStyle(frontText.styleId);
  const color = frontText.color || style.defaultColor;
  const placement = frontText.placement || 'bottom';
  const text = applyCase(raw, style.case);

  const m = panelMargin * ppi;
  const boxX = m * 1.4;
  const boxW = w - boxX * 2;

  // Auto-size to fit width (shrink until the longest word fits, then wrap).
  let fontPx = 0.42 * ppi;
  const minPx = 0.16 * ppi;
  const fontStr = (px) => `${style.weight} ${Math.round(px)}px ${style.family}`;
  const longest = text.split(/\s+/).sort((a, b) => b.length - a.length)[0] || text;
  ctx.font = fontStr(fontPx);
  while (fontPx > minPx && ctx.measureText(longest).width > boxW) {
    fontPx -= 2;
    ctx.font = fontStr(fontPx);
  }

  // Wrap into lines.
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > boxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);

  const lh = fontPx * 1.12;
  const blockH = lines.length * lh;
  const pad = fontPx * 0.5;
  let top;
  if (placement === 'top') top = m + pad;
  else if (placement === 'center') top = (h - blockH) / 2;
  else top = h - m - blockH - pad;

  ctx.save();
  ctx.font = fontStr(fontPx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const cx = w / 2;

  if (style.effect === 'banner') {
    // translucent strip behind the text for max legibility
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fillRect(0, top - pad, w, blockH + pad * 2);
  }

  let y = top;
  for (const ln of lines) {
    if (style.effect === 'shadow') {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = fontPx * 0.18;
      ctx.shadowOffsetY = fontPx * 0.04;
    } else if (style.effect === 'outline') {
      ctx.lineWidth = Math.max(2, fontPx * 0.08);
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(ln, cx, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(ln, cx, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    y += lh;
  }
  ctx.restore();
}

function frontPanel(ctx, w, h, ppi, img, frontText) {
  const m = panelMargin * ppi;
  drawImageCover(ctx, img, m, m, w - 2 * m, h - 2 * m);
  drawFrontText(ctx, w, h, ppi, frontText);
}

// Shared single renderer for the card front (image + text overlay). Used by the
// gallery thumbnail and the message-step preview so every surface matches the PDF.
// Caller should `await ensureFontsLoaded([...])` first for custom fonts.
export function renderCardFront(canvas, { img, frontText, width = 600 }) {
  // Render at the card's own 2:3 proportion (no fold panel margin) for thumbnails.
  const ratio = img.height / img.width;
  const W = Math.round(width);
  const H = Math.round(width * ratio);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  drawImageCover(ctx, img, 0, 0, W, H);
  // Treat the thumbnail as a ~5.5in-tall card so the inch-based font sizes scale.
  drawFrontText(ctx, W, H, H / 5.5, frontText);
}

function messagePanel(ctx, w, h, ppi, message) {
  const m = panelMargin * ppi * 1.4;
  drawWrappedText(ctx, message, m, m, w - 2 * m, h - 2 * m, {
    fontPx: 0.27 * ppi,
    family: 'Georgia, "Times New Roman", serif',
    style: 'italic',
    color: '#3a2f2f',
  });
}

function backPanel(ctx, w, h, ppi) {
  const m = panelMargin * ppi;
  drawWrappedText(ctx, 'Made with Occasio', m, h - 0.95 * ppi, w - 2 * m, 0.4 * ppi, {
    fontPx: 0.13 * ppi,
    family: 'Helvetica, Arial, sans-serif',
    color: '#b3abc0',
  });
}

// inside-left is intentionally blank (room for a handwritten note)
function blankPanel() {}

// ---- page composition -------------------------------------------------------

export function composeQuarterFold(canvas, { img, message, frontText, paperSize, showGuides, ppi }) {
  const P = CARD_EXPORT.paper[paperSize] || CARD_EXPORT.paper.letter;
  const ctx = setupCanvas(canvas, P.width, P.height, ppi);
  const W = canvas.width;
  const H = canvas.height;
  const hw = W / 2;
  const hh = H / 2;

  if (showGuides) {
    drawFoldGuide(ctx, hw, 0, hw, H);
    drawFoldGuide(ctx, 0, hh, W, hh);
  }

  // top row drawn upside-down (becomes the inside once folded)
  inPanel(ctx, 0, 0, hw, hh, true, blankPanel); // inside-left
  inPanel(ctx, hw, 0, hw, hh, true, (c, w, h) => messagePanel(c, w, h, ppi, message)); // inside-right
  inPanel(ctx, 0, hh, hw, hh, false, (c, w, h) => backPanel(c, w, h, ppi)); // back
  inPanel(ctx, hw, hh, hw, hh, false, (c, w, h) => frontPanel(c, w, h, ppi, img, frontText)); // front
}

export function composeHalfFold(canvas, side, { img, message, frontText, showGuides, ppi }) {
  const S = CARD_EXPORT.formats.halfFold5x7.spread;
  const ctx = setupCanvas(canvas, S.width, S.height, ppi);
  const W = canvas.width;
  const H = canvas.height;
  const half = W / 2;

  if (showGuides) drawFoldGuide(ctx, half, 0, half, H);

  if (side === 'inside') {
    inPanel(ctx, 0, 0, half, H, false, blankPanel); // inside-left
    inPanel(ctx, half, 0, half, H, false, (c, w, h) => messagePanel(c, w, h, ppi, message)); // inside-right
  } else {
    inPanel(ctx, 0, 0, half, H, false, (c, w, h) => backPanel(c, w, h, ppi)); // back
    inPanel(ctx, half, 0, half, H, false, (c, w, h) => frontPanel(c, w, h, ppi, img, frontText)); // front
  }
}

// ---- preview (smaller scale, one page) --------------------------------------

export function renderPreview(canvas, { img, format, paperSize, message, frontText, showGuides, side = 'outside', maxPx = 540 }) {
  if (format === 'halfFold5x7') {
    const S = CARD_EXPORT.formats.halfFold5x7.spread;
    const ppi = maxPx / Math.max(S.width, S.height);
    composeHalfFold(canvas, side, { img, message, frontText, showGuides, ppi });
  } else {
    const P = CARD_EXPORT.paper[paperSize] || CARD_EXPORT.paper.letter;
    const ppi = maxPx / Math.max(P.width, P.height);
    composeQuarterFold(canvas, { img, message, frontText, paperSize, showGuides, ppi });
  }
}

// ---- PDF build / download ---------------------------------------------------

export async function buildCardPdf({ card, message, frontText, format, paperSize, showGuides }) {
  const img = await loadImage(card.imageUrl);
  // Make sure the overlay font is loaded before rasterizing, or it falls back.
  if (frontText?.text) await ensureFontsLoaded([getTextStyle(frontText.styleId).family]);
  const { jsPDF } = await import('jspdf'); // dynamic → own chunk
  const ppi = CARD_EXPORT.DPI;
  const toJpeg = (canvas) => canvas.toDataURL('image/jpeg', 0.92);

  if (format === 'halfFold5x7') {
    const S = CARD_EXPORT.formats.halfFold5x7.spread;
    const pdf = new jsPDF({ unit: 'in', format: [S.width, S.height], orientation: 'landscape' });
    ['outside', 'inside'].forEach((side, i) => {
      if (i > 0) pdf.addPage([S.width, S.height], 'landscape');
      const canvas = document.createElement('canvas');
      composeHalfFold(canvas, side, { img, message, frontText, showGuides, ppi });
      pdf.addImage(toJpeg(canvas), 'JPEG', 0, 0, S.width, S.height);
    });
    return pdf;
  }

  const P = CARD_EXPORT.paper[paperSize] || CARD_EXPORT.paper.letter;
  const pdf = new jsPDF({ unit: 'in', format: [P.width, P.height], orientation: 'portrait' });
  const canvas = document.createElement('canvas');
  composeQuarterFold(canvas, { img, message, frontText, paperSize, showGuides, ppi });
  pdf.addImage(toJpeg(canvas), 'JPEG', 0, 0, P.width, P.height);
  return pdf;
}

export async function downloadCardPdf(opts) {
  const pdf = await buildCardPdf(opts);
  // Don't use jsPDF's built-in .save() — in Chrome it can deliver the blob URL
  // without a filename, saving the file with no .pdf extension. Drive the
  // download ourselves with a real `download` attribute instead.
  const blob = pdf.output('blob'); // typed application/pdf
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'occasio-card.pdf';
  a.rel = 'noopener';
  document.body.appendChild(a); // attaching makes Chrome honor the download
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
