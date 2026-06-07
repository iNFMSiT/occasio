import React, { useState, useEffect, useRef } from 'react';
import {
  Download, RefreshCw, ShoppingBag, Check, Image, Upload,
  ArrowLeft, Package, Coffee, Smartphone, Frame, Code, Printer, Share2,
} from 'lucide-react';
import { useGiftFlow } from '../../../../context/GiftFlowContext.jsx';
import { fireConfetti } from '../../../../components/visual/confetti.js';
import { shareDesign } from '../../../../services/shareCard.js';
import CardExportModal from './CardExportModal.jsx';
import CardFront from '../../components/CardFront.jsx';
import { useToast } from '../../../../context/ToastContext.jsx';
import { getImageProvider } from '../../../../services/ai';
import PromptViewer from '../../../../components/common/PromptViewer.jsx';
import RatingSlider from '../../../../components/common/RatingSlider.jsx';

const MOCKUP_TABS = [
  { id: 'cards', label: 'Card Deck', icon: Package },
  { id: 'mug', label: 'Mug', icon: Coffee },
  { id: 'phone', label: 'Phone Case', icon: Smartphone },
  { id: 'poster', label: 'Poster', icon: Frame },
];

function ProductMockup({ type, card }) {
  if (!card?.imageUrl) return null;

  if (type === 'cards') {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 flex items-center justify-center">
        <div className="relative flex items-center justify-center" style={{ height: 280 }}>
          {[0, 1, 2].map((i) => (
            <img key={i} src={card.imageUrl} alt="Card"
              className="absolute w-40 h-56 object-cover rounded-lg border-2 border-white/20 shadow-2xl"
              style={{
                transform: `rotate(${(i - 1) * 12}deg) translateX(${(i - 1) * 20}px)`,
                zIndex: 3 - Math.abs(i - 1),
                filter: i !== 1 ? 'brightness(0.7)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'mug') {
    return (
      <div className="bg-gradient-to-br from-amber-900/30 to-stone-900/50 rounded-2xl p-8 flex items-center justify-center">
        <div className="relative w-52 h-52">
          <div className="absolute inset-0 bg-white/90 rounded-b-3xl rounded-t-lg overflow-hidden">
            <img src={card.imageUrl} alt="Mug" className="w-full h-full object-cover opacity-90" />
          </div>
          <div className="absolute right-[-20px] top-1/4 w-6 h-24 border-4 border-white/80 rounded-r-full" />
        </div>
      </div>
    );
  }

  if (type === 'phone') {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 flex items-center justify-center">
        <div className="relative w-44 h-80 bg-black rounded-[2rem] p-2 shadow-2xl border border-gray-700">
          <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
            <img src={card.imageUrl} alt="Phone case" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl" />
        </div>
      </div>
    );
  }

  if (type === 'poster') {
    return (
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-8 flex items-center justify-center">
        <div className="relative bg-white p-3 shadow-2xl" style={{ transform: 'perspective(600px) rotateY(-5deg)' }}>
          <img src={card.imageUrl} alt="Poster" className="w-56 h-72 object-cover" />
          <div className="absolute inset-0 shadow-inner pointer-events-none" />
        </div>
      </div>
    );
  }

  return null;
}

export default function ImageGalleryStep() {
  const { cards, settings, surveyData, dispatch } = useGiftFlow();
  const cardCount = settings.cardCount || 6;
  const isSingle = cardCount === 1;
  const { addToast } = useToast();
  const [selected, setSelected] = useState(new Set());
  const [activeMockup, setActiveMockup] = useState('cards');
  const [regenerating, setRegenerating] = useState(null);
  const [previewCard, setPreviewCard] = useState(0);
  const [exportIndex, setExportIndex] = useState(null); // open the printable-card modal for this card

  // Celebrate once when the finished gift first appears.
  const celebrated = useRef(false);
  useEffect(() => {
    if (!celebrated.current && cards?.some((c) => c?.imageUrl)) {
      celebrated.current = true;
      fireConfetti();
    }
  }, [cards]);

  const provider = getImageProvider({ devMode: settings.devMode });

  const toggleSelect = (i) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === cards.length) setSelected(new Set());
    else setSelected(new Set(cards.map((_, i) => i)));
  };

  const regenerateCard = async (index) => {
    const card = cards[index];
    if (!card) return;
    setRegenerating(index);
    try {
      const result = await provider.generateImage(card.prompt, { modelTier: settings.modelTier });
      dispatch({ type: 'UPDATE_CARD', payload: { index, card: { ...card, ...result } } });
      addToast({ type: 'success', message: `Card #${index + 1} regenerated!` });
    } catch (err) {
      addToast({ type: 'error', message: `Failed to regenerate card #${index + 1}` });
    } finally {
      setRegenerating(null);
    }
  };

  const downloadCard = (card, index) => {
    if (!card.imageUrl) return;
    const link = document.createElement('a');
    link.href = card.imageUrl;
    link.download = `card-${index + 1}.png`;
    link.click();
  };

  const [sharing, setSharing] = useState(false);
  const handleShare = async (card) => {
    if (sharing) return;
    setSharing(true);
    try {
      const result = await shareDesign({ card });
      if (result === 'shared') addToast('Shared!', 'success');
      else if (result === 'downloaded') addToast('Saved — attach it to your message.', 'info');
    } catch {
      addToast('Could not share. Try downloading instead.', 'error');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{isSingle ? 'Your Custom Image' : 'Your Custom Collection'}</h2>
        <p className="text-text-muted">
          {isSingle ? 'Preview your image on different products below.' : `${cards.length} images generated. Browse, regenerate, and preview on products.`}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 justify-center">
          {MOCKUP_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveMockup(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeMockup === tab.id ? 'bg-brand text-white' : 'bg-surface-light text-text-muted hover:text-text border border-surface-lighter/30'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <ProductMockup type={activeMockup} card={cards[previewCard]} />
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-accent/90 text-black text-[10px] font-bold">ORDER COMING SOON</div>
          <div className="flex gap-1.5 justify-center mt-3">
            {cards.map((_, i) => (
              <button key={i} onClick={() => setPreviewCard(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === previewCard ? 'bg-brand scale-125' : 'bg-surface-lighter hover:bg-brand-light/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Primary action — the printable card is the headline product */}
        {cards[previewCard]?.imageUrl && (
          <div className="flex justify-center">
            <button
              onClick={() => setExportIndex(previewCard)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand to-accent text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <Printer size={18} /> Make a printable card
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={selectAll} className="text-sm text-text-muted hover:text-text transition-colors">
          {selected.size === cards.length ? 'Deselect All' : 'Select All'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const toDownload = selected.size > 0 ? [...selected] : cards.map((_, i) => i);
              toDownload.forEach((i) => downloadCard(cards[i], i));
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-surface-lighter rounded-lg hover:bg-surface-light transition-colors"
          >
            <Download size={14} /> Download {selected.size > 0 ? `(${selected.size})` : 'All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="space-y-1.5">
            <div className={`relative group rounded-xl overflow-hidden border-2 transition-all card-hover ${selected.has(i) ? 'border-brand shadow-lg shadow-brand/20' : 'border-surface-lighter'}`}>
              {card.imageUrl ? (
                <CardFront card={card} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-surface-light flex items-center justify-center">
                  <Image size={32} className="text-text-muted" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); regenerateCard(i); }} disabled={regenerating === i}
                  className="p-2.5 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" title="Regenerate">
                  <RefreshCw size={16} className={regenerating === i ? 'animate-spin' : ''} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); downloadCard(card, i); }}
                  className="p-2.5 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" title="Download image">
                  <Download size={16} />
                </button>
                {card.imageUrl && (
                  <button onClick={(e) => { e.stopPropagation(); setExportIndex(i); }}
                    className="p-2.5 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" title="Make printable card">
                    <Printer size={16} />
                  </button>
                )}
                {card.imageUrl && (
                  <button onClick={(e) => { e.stopPropagation(); handleShare(card); }} disabled={sharing}
                    className="p-2.5 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors disabled:opacity-50" title="Share">
                    <Share2 size={16} />
                  </button>
                )}
              </div>
              <button onClick={() => toggleSelect(i)}
                className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  selected.has(i) ? 'bg-brand border-brand' : 'border-white/50 bg-black/30 opacity-0 group-hover:opacity-100'
                }`}>
                {selected.has(i) && <Check size={14} />}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                <p className="text-xs font-medium">#{i + 1}</p>
                <p className="text-[10px] text-text-muted">{card.style} · {card.theme}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <RatingSlider value={card.rating ?? null} onChange={(val) => dispatch({ type: 'RATE_CARD', payload: { index: i, rating: val } })} compact />
            </div>
            {card.prompt && <PromptViewer prompt={card.prompt} label={`Prompt #${i + 1}`} compact />}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button onClick={() => dispatch({ type: 'PREV_STEP' })} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={16} /> Back to Generation
        </button>
        <button onClick={() => dispatch({ type: 'RESET' })} className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark rounded-lg font-medium text-sm transition-colors">
          <Upload size={16} /> New Project
        </button>
      </div>

      {exportIndex !== null && cards[exportIndex] && (
        <CardExportModal
          card={cards[exportIndex]}
          occasion={surveyData?.occasion}
          onClose={() => setExportIndex(null)}
        />
      )}
    </div>
  );
}
