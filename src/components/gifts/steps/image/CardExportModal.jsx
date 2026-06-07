import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Loader2, Printer, Share2 } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext.jsx';
import { shareDesign } from '../../../../services/shareCard.js';
import { OCCASIONS } from '../../../../data/occasions';
import { CARD_EXPORT } from '../../../../data/print';
import {
  loadImage,
  renderPreview,
  downloadCardPdf,
  defaultMessageForOccasion,
  ensureFontsLoaded,
} from '../../../../services/cardExport.js';
import { getTextStyle } from '../../../../config/textStyles.js';

function occasionLabel(occasion) {
  if (!occasion) return null;
  if (typeof occasion === 'object') return occasion.label || null;
  const match = OCCASIONS.find((o) => o.id === occasion);
  return match ? match.label : occasion;
}

const FORMAT_HINTS = {
  quarterFold: '1 sheet · print one side · fold twice → 4.25 × 5.5 in',
  halfFold5x7: '2 pages · print double-sided · fold once → 5 × 7 in',
};

export default function CardExportModal({ card, occasion, onClose }) {
  const { addToast } = useToast();
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);

  const [format, setFormat] = useState('quarterFold');
  const [paperSize, setPaperSize] = useState('letter');
  const [side, setSide] = useState('outside'); // half-fold preview side
  const [showGuides, setShowGuides] = useState(true);
  const [message, setMessage] = useState(() => defaultMessageForOccasion(occasionLabel(occasion)));
  const [busy, setBusy] = useState(false);

  // Load the card image once.
  useEffect(() => {
    let alive = true;
    loadImage(card.imageUrl).then((image) => { if (alive) setImg(image); });
    return () => { alive = false; };
  }, [card.imageUrl]);

  // Re-render the preview on any change (after the overlay font is ready).
  useEffect(() => {
    let alive = true;
    if (!img || !canvasRef.current) return;
    (async () => {
      if (card.frontText?.text) await ensureFontsLoaded([getTextStyle(card.frontText.styleId).family]);
      if (alive && canvasRef.current) {
        renderPreview(canvasRef.current, { img, format, paperSize, message, frontText: card.frontText, showGuides, side });
      }
    })();
    return () => { alive = false; };
  }, [img, format, paperSize, message, showGuides, side, card.frontText]);

  const handleShare = async () => {
    setBusy(true);
    try {
      const result = await shareDesign({ card });
      if (result === 'shared') addToast('Shared!', 'success');
      else if (result === 'downloaded') addToast('Saved — attach it to your message.', 'info');
    } catch {
      addToast('Could not share. Try downloading instead.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadCardPdf({ card, message, frontText: card.frontText, format, paperSize, showGuides });
      addToast('Print-ready PDF downloaded!', 'success');
    } catch (e) {
      addToast('Could not build the PDF. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const isHalf = format === 'halfFold5x7';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-surface-lighter bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-lighter/50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-brand-light" />
            <h2 className="font-display text-lg font-bold">Make a printable card</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-light hover:text-text">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-5 overflow-y-auto p-5 sm:grid-cols-[1fr_280px]">
          {/* Preview */}
          <div className="flex flex-col items-center justify-start">
            <div className="rounded-lg bg-white p-2 shadow-lg">
              <canvas ref={canvasRef} className="block h-auto max-w-full rounded-sm" />
            </div>
            {isHalf && (
              <div className="mt-3 flex gap-1.5">
                {['outside', 'inside'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      side === s ? 'bg-brand text-white' : 'bg-surface-light text-text-muted hover:text-text'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-center text-xs text-text-muted">{FORMAT_HINTS[format]}</p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-text-muted">Card format</p>
              <div className="space-y-1.5">
                {Object.values(CARD_EXPORT.formats).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      format === f.id
                        ? 'border-brand bg-brand/10 text-text'
                        : 'border-surface-lighter bg-surface-light/30 text-text-muted hover:border-brand-light/40'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {!isHalf && (
              <div>
                <p className="mb-1.5 text-xs font-semibold text-text-muted">Paper size</p>
                <div className="flex gap-1.5">
                  {Object.values(CARD_EXPORT.paper).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPaperSize(p.id)}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        paperSize === p.id
                          ? 'border-brand bg-brand/10'
                          : 'border-surface-lighter bg-surface-light/30 text-text-muted hover:border-brand-light/40'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-muted">Inside message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={220}
                className="w-full resize-none rounded-lg border border-surface-lighter bg-surface-light/30 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="Write something they'll keep…"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-brand)]"
              />
              Show fold &amp; cut guides
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                disabled={busy || !img}
                className="flex items-center justify-center gap-2 rounded-lg border border-surface-lighter bg-surface-light/40 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-light disabled:opacity-50"
                title="Share the design"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={handleDownload}
                disabled={busy || !img}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {busy ? 'Building…' : 'Download PDF'}
              </button>
            </div>
            <p className="text-center text-[11px] text-text-muted/80">
              Print at 100% / “actual size” for correct dimensions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
