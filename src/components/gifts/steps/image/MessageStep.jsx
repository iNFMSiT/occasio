import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Shuffle, Loader2, Wand2 } from 'lucide-react';
import { useGiftFlow } from '../../../../context/GiftFlowContext.jsx';
import { useToast } from '../../../../context/ToastContext.jsx';
import {
  TEXT_STYLES, TEXT_COLORS, POSITIONS, MESSAGE_TONES, getTextStyle, shuffleFrontStyle,
} from '../../../../config/textStyles.js';
import { generateMessageOptions } from '../../../../services/ai/message';
import { occasionLabel } from '../../../../services/messagePromptEngine';
import { loadImage, renderCardFront, ensureFontsLoaded } from '../../../../services/cardExport';

const DEFAULT_STYLE = { styleId: 'elegant', color: '#ffffff', placement: 'bottom' };

function initialFrontText(card, occasion) {
  if (card?.frontText?.text != null) return { ...DEFAULT_STYLE, ...card.frontText };
  const occ = occasionLabel(occasion);
  return { text: occ ? `Happy ${occ}!` : '', ...DEFAULT_STYLE };
}

export default function MessageStep() {
  const { cards, surveyData, dispatch } = useGiftFlow();
  const { addToast } = useToast();
  const canvasRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [img, setImg] = useState(null);
  const [frontText, setFrontText] = useState(() => initialFrontText(cards[0], surveyData?.occasion));
  const [recipient, setRecipient] = useState(() => surveyData?.recipient || { name: '', relationship: '' });
  const [tone, setTone] = useState('heartfelt');
  const [options, setOptions] = useState(null);
  const [generating, setGenerating] = useState(false);

  const card = cards[activeIndex];
  const set = (patch) => setFrontText((f) => ({ ...f, ...patch }));

  // Persist the active card's front text into flow state.
  const saveCurrent = useCallback(() => {
    if (!card) return;
    dispatch({ type: 'UPDATE_CARD', payload: { index: activeIndex, card: { ...card, frontText } } });
  }, [card, activeIndex, frontText, dispatch]);

  // Load the active card image.
  useEffect(() => {
    let alive = true;
    if (!card?.imageUrl) return;
    loadImage(card.imageUrl).then((image) => { if (alive) setImg(image); });
    return () => { alive = false; };
  }, [card?.imageUrl]);

  // Render the live preview (image + overlay) after fonts are ready.
  useEffect(() => {
    let alive = true;
    if (!img || !canvasRef.current) return;
    (async () => {
      await ensureFontsLoaded([getTextStyle(frontText.styleId).family]);
      if (alive && canvasRef.current) renderCardFront(canvasRef.current, { img, frontText, width: 420 });
    })();
    return () => { alive = false; };
  }, [img, frontText.text, frontText.styleId, frontText.color, frontText.placement]);

  const switchCard = (i) => {
    saveCurrent();
    setActiveIndex(i);
    setFrontText(initialFrontText(cards[i], surveyData?.occasion));
    setOptions(null);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setOptions(null);
    try {
      const opts = await generateMessageOptions({ occasion: surveyData?.occasion, tone, recipient, surveyData });
      setOptions(opts);
      if (!opts.length) addToast('No ideas came back — try another tone.', 'info');
    } catch {
      addToast('Could not generate ideas right now.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const goNext = () => {
    saveCurrent();
    dispatch({ type: 'UPDATE_SURVEY', payload: { recipient } });
    dispatch({ type: 'NEXT_STEP' });
  };
  const goBack = () => {
    saveCurrent();
    dispatch({ type: 'PREV_STEP' });
  };

  const style = getTextStyle(frontText.styleId);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold">Add your message</h2>
        <p className="text-text-muted">Put a line on the front — type it, or let us suggest a few.</p>
      </div>

      {cards.length > 1 && (
        <div className="flex justify-center gap-2">
          {cards.map((c, i) => (
            <button
              key={i}
              onClick={() => switchCard(i)}
              className={`h-12 w-9 overflow-hidden rounded-md border-2 transition-all ${i === activeIndex ? 'border-brand' : 'border-surface-lighter opacity-70'}`}
            >
              {c.imageUrl && <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-[minmax(0,360px)_1fr]">
        {/* Preview */}
        <div className="flex items-start justify-center">
          <div className="rounded-xl bg-white p-1.5 shadow-xl">
            <canvas ref={canvasRef} className="block h-auto w-full max-w-[320px] rounded-md" />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Recipient */}
          <div className="grid grid-cols-2 gap-2">
            <input
              value={recipient.name}
              onChange={(e) => setRecipient((r) => ({ ...r, name: e.target.value }))}
              placeholder="To (name)"
              className="rounded-lg border border-surface-lighter bg-surface-light/30 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <input
              value={recipient.relationship}
              onChange={(e) => setRecipient((r) => ({ ...r, relationship: e.target.value }))}
              placeholder="Relationship (e.g. best friend)"
              className="rounded-lg border border-surface-lighter bg-surface-light/30 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {/* Message text */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">Front message</label>
            <input
              value={frontText.text}
              onChange={(e) => set({ text: e.target.value })}
              maxLength={40}
              placeholder="Happy Birthday, Sam!"
              className="w-full rounded-lg border border-surface-lighter bg-surface-light/30 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {/* Smart generate */}
          <div className="rounded-xl border border-surface-lighter/60 bg-surface-light/15 p-3 space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${tone === t.id ? 'bg-brand text-white' : 'bg-surface-light text-text-muted hover:text-text'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {generating ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {generating ? 'Thinking…' : 'Generate 3 ideas'}
            </button>
            {options?.length > 0 && (
              <div className="space-y-1.5 pt-0.5">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => set({ text: opt })}
                    className="flex w-full items-center gap-2 rounded-lg border border-surface-lighter/60 bg-surface px-3 py-2 text-left text-sm hover:border-brand-light/60"
                  >
                    <Sparkles size={13} className="shrink-0 text-accent" />
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style + color + position */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Style</span>
              <button
                onClick={() => set(shuffleFrontStyle())}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-light"
              >
                <Shuffle size={13} /> Shuffle
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TEXT_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => set({ styleId: s.id, color: s.defaultColor })}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${frontText.styleId === s.id ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface-light/30 text-text-muted hover:border-brand-light/40'}`}
                  style={{ fontFamily: s.family }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => set({ color: c.value })}
                    title={c.label}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${frontText.color === c.value ? 'scale-110 border-brand' : 'border-white/40'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <div className="ml-auto flex gap-1">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => set({ placement: p.id })}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${frontText.placement === p.id ? 'bg-brand text-white' : 'bg-surface-light text-text-muted hover:text-text'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-1">
        <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={goNext} className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium hover:bg-brand-dark">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
