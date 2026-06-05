import React, { useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight, ArrowLeft, Loader, Wand2, Zap, Image, Shirt, Package, Code } from 'lucide-react';
import { useGiftFlow } from '../../GiftFlowContext.jsx';
import { useToast } from '../../../../context/ToastContext.jsx';
import geminiService from '../../../../services/geminiService.js';
import { mockService } from '../../../../services/mockService.js';
import promptEngine from '../../../../services/promptEngine.js';
import { isApiConfigured, GEMINI_CONFIG } from '../../../../config/gemini.config.js';
import sessionStore from '../../../../services/sessionStore.js';
import PromptViewer from '../../../../components/PromptViewer.jsx';

const COUNT_OPTIONS = [
  { value: 1, label: '1', desc: 'Single image', icon: Shirt, hint: 'Great for shirts, posters, phone cases' },
  { value: 2, label: '2', desc: 'A pair', icon: Image, hint: 'Before & after, two styles' },
  { value: 4, label: '4', desc: 'Small set', icon: Image, hint: 'Coasters, sticker sheet' },
  { value: 6, label: '6', desc: 'Mini deck', icon: Package, hint: 'Card deck, gift set' },
  { value: 8, label: '8', desc: 'Full set', icon: Package, hint: 'Full deck, variety pack' },
];

export default function ImageGenerateStep() {
  const {
    anchorDescription, surveyData, selectedStyles, selectedThemes,
    images, blueprint, cards, settings, generationProgress, dispatch,
  } = useGiftFlow();
  const { addToast } = useToast();

  const [phase, setPhase] = useState('idle');
  const [previewCards, setPreviewCards] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [peekBlueprint, setPeekBlueprint] = useState([]);

  const service = settings.devMode || !isApiConfigured() ? mockService : geminiService;
  const cardCount = settings.cardCount || 6;
  const needsPreview = cardCount > 2;
  const previewCount = Math.min(2, cardCount);
  const currentModel = GEMINI_CONFIG.models[settings.modelTier];

  const getReferenceBase64 = async () => {
    try {
      if (images?.[0]?.file && service === geminiService) {
        return await geminiService.fileToBase64(images[0].file);
      }
    } catch { /* ignore */ }
    return null;
  };

  const generatePreview = async () => {
    if (isWorking) return;
    setIsWorking(true);
    setPhase('previewing');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let bp = blueprint;
      if (!bp.length) {
        bp = promptEngine.createBlueprint(anchorDescription, surveyData, selectedStyles, selectedThemes, cardCount);
        dispatch({ type: 'SET_BLUEPRINT', payload: bp });
      }
      const refBase64 = await getReferenceBase64();
      const previewItems = bp.slice(0, previewCount);
      const results = await service.generateBatch(previewItems, {
        modelTier: settings.modelTier,
        referenceImageBase64: refBase64,
        onProgress: (p) => dispatch({ type: 'UPDATE_PROGRESS', payload: p }),
      });
      setPreviewCards(results);
      addToast({ type: 'success', message: 'Preview cards generated!' });
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to generate preview.' });
      setPhase('idle');
    } finally {
      setIsWorking(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateAll = async () => {
    if (isWorking) return;
    setIsWorking(true);
    setPhase('generating');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let bp = blueprint;
      if (!bp.length) {
        bp = promptEngine.createBlueprint(anchorDescription, surveyData, selectedStyles, selectedThemes, cardCount);
        dispatch({ type: 'SET_BLUEPRINT', payload: bp });
      }
      const refBase64 = await getReferenceBase64();
      let finalCards = [];

      if (needsPreview && previewCards.length > 0) {
        finalCards = [...previewCards];
        dispatch({ type: 'SET_CARDS', payload: finalCards });
        const remainingItems = bp.slice(previewCount);
        if (remainingItems.length > 0) {
          const results = await service.generateBatch(remainingItems, {
            modelTier: settings.modelTier,
            referenceImageBase64: refBase64,
            onProgress: (p) => {
              dispatch({ type: 'UPDATE_PROGRESS', payload: { current: p.current + previewCount, total: cardCount } });
            },
          });
          finalCards = [...finalCards, ...results];
          dispatch({ type: 'SET_CARDS', payload: finalCards });
        }
      } else {
        finalCards = await service.generateBatch(bp, {
          modelTier: settings.modelTier,
          referenceImageBase64: refBase64,
          onProgress: (p) => dispatch({ type: 'UPDATE_PROGRESS', payload: p }),
        });
        dispatch({ type: 'SET_CARDS', payload: finalCards });
      }

      setPhase('done');
      addToast({ type: 'success', message: `${cardCount === 1 ? 'Image' : `All ${cardCount} images`} generated!` });

      try {
        await sessionStore.saveSession({
          cards: finalCards, modelTier: settings.modelTier, cardCount,
          styles: selectedStyles, themes: selectedThemes, anchorDescription,
        });
      } catch (saveErr) {
        console.warn('Failed to save session to history:', saveErr);
      }
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to generate.' });
      setPhase('idle');
    } finally {
      setIsWorking(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const regeneratePreview = async () => {
    setPreviewCards([]);
    const bp = promptEngine.createBlueprint(anchorDescription, surveyData, selectedStyles, selectedThemes, cardCount);
    dispatch({ type: 'SET_BLUEPRINT', payload: bp });
    setPhase('idle');
    setTimeout(() => generatePreview(), 50);
  };

  const handleCountChange = (count) => {
    dispatch({ type: 'SET_CARD_COUNT', payload: count });
    dispatch({ type: 'SET_BLUEPRINT', payload: [] });
    setPreviewCards([]);
    setPeekBlueprint([]);
    setShowPrompts(false);
    setPhase('idle');
  };

  const handlePeekPrompts = () => {
    if (showPrompts) { setShowPrompts(false); return; }
    const bp = promptEngine.createBlueprint(anchorDescription, surveyData, selectedStyles, selectedThemes, cardCount);
    setPeekBlueprint(bp);
    setShowPrompts(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {phase === 'done' ? (cardCount === 1 ? 'Your Image Is Ready!' : 'Your Images Are Ready!') : 'Generate'}
        </h2>
        <p className="text-text-muted">
          {phase === 'idle' && 'Pick how many images you want, then hit generate.'}
          {phase === 'previewing' && 'Generating preview...'}
          {phase === 'generating' && (cardCount === 1 ? 'Generating your image...' : `Generating ${cardCount} images...`)}
          {phase === 'done' && 'Head to the gallery to browse and preview on products!'}
        </p>
      </div>

      {phase === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-text-muted text-center">How many images?</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {COUNT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleCountChange(opt.value)}
                className={`relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all min-w-[72px] ${
                  cardCount === opt.value
                    ? 'border-brand bg-brand/10 shadow-md shadow-brand/10'
                    : 'border-surface-lighter hover:border-brand-light/40 bg-surface-light/50'
                }`}
              >
                <span className={`text-xl font-bold ${cardCount === opt.value ? 'text-brand-light' : 'text-text'}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-text-muted">{opt.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-muted text-center">
            {COUNT_OPTIONS.find((o) => o.value === cardCount)?.hint}
          </p>
          {currentModel && (
            <div className="flex justify-center">
              <div className="bg-surface/50 rounded-lg px-3 py-1.5 border border-surface-lighter/30 text-[11px] text-text-muted">
                Est. cost: <strong className="text-text">~${(currentModel.costPerImage * cardCount).toFixed(2)}</strong>
                {' '}with {currentModel.label}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'idle' && anchorDescription && (
        <div className="space-y-2">
          <div className="flex justify-center">
            <button onClick={handlePeekPrompts} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text border border-surface-lighter/50 hover:border-brand-light/30 transition-colors">
              <Code size={12} />
              {showPrompts ? 'Hide Prompts' : 'Preview Prompts'}
            </button>
          </div>
          {showPrompts && peekBlueprint.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {peekBlueprint.map((item, i) => (
                <PromptViewer key={i} prompt={item.prompt} label={`Card #${i + 1} — ${item.style} · ${item.theme}`} defaultOpen={i === 0} />
              ))}
            </div>
          )}
        </div>
      )}

      {blueprint.length > 0 && phase !== 'idle' && (
        <div className="space-y-2">
          <div className="flex justify-center">
            <button onClick={() => setShowPrompts(!showPrompts)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text border border-surface-lighter/50 hover:border-brand-light/30 transition-colors">
              <Code size={12} />
              {showPrompts ? 'Hide Prompts' : 'View Prompts Sent'}
            </button>
          </div>
          {showPrompts && (
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {blueprint.map((item, i) => (
                <PromptViewer key={i} prompt={item.prompt} label={`Card #${i + 1} — ${item.style} · ${item.theme}`} defaultOpen={false} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light border border-surface-lighter/50 text-xs">
          <Zap size={12} className="text-accent" />
          <span className="text-text-muted">
            Using <strong className="text-text">{currentModel?.label || 'Nano Banana'}</strong>
          </span>
        </div>
      </div>

      {(phase === 'previewing' || phase === 'generating') && (
        <div className="space-y-2">
          <div className="h-3 bg-surface-light rounded-full overflow-hidden border border-surface-lighter/30">
            <div
              className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all duration-500"
              style={{ width: `${generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-sm text-text-muted text-center">
            {generationProgress.current} / {generationProgress.total} {cardCount === 1 ? 'image' : 'images'}
          </p>
        </div>
      )}

      {previewCards.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-text-muted">
            {phase === 'done' ? '' : 'Preview — do these look right?'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {previewCards.map((card, i) => (
              <div key={i} className="relative group">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={`Preview ${i + 1}`} className="w-44 h-64 object-cover rounded-xl border-2 border-surface-lighter shadow-lg" />
                ) : (
                  <div className="w-44 h-64 rounded-xl border-2 border-danger/30 bg-danger/5 flex items-center justify-center">
                    <p className="text-xs text-danger text-center px-3">Failed to generate</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 rounded-b-xl px-2 py-1.5">
                  <p className="text-xs truncate">{card.style}</p>
                  <p className="text-[10px] text-text-muted truncate">{card.theme}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <button onClick={() => dispatch({ type: 'PREV_STEP' })} disabled={isWorking} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text disabled:opacity-30 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-3">
          {phase === 'idle' && (
            <button onClick={needsPreview ? generatePreview : generateAll} disabled={isWorking} className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg font-medium text-sm transition-colors">
              <Wand2 size={16} />
              {needsPreview ? 'Generate Preview' : `Generate ${cardCount === 1 ? 'Image' : `${cardCount} Images`}`}
            </button>
          )}
          {previewCards.length > 0 && phase !== 'generating' && phase !== 'done' && (
            <>
              <button onClick={regeneratePreview} disabled={isWorking} className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-surface-lighter rounded-lg hover:bg-surface-light disabled:opacity-50 transition-colors">
                <RefreshCw size={14} /> Try Again
              </button>
              <button onClick={generateAll} disabled={isWorking} className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg font-medium text-sm transition-colors animate-pulse-glow">
                <Sparkles size={16} /> Generate All {cardCount} Images
              </button>
            </>
          )}
          {phase === 'generating' && (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-surface-light rounded-lg text-sm text-text-muted">
              <Loader size={16} className="animate-spin" /> Generating...
            </div>
          )}
          {phase === 'done' && (
            <button onClick={() => dispatch({ type: 'NEXT_STEP' })} className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark rounded-lg font-medium text-sm transition-colors">
              View Gallery <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
