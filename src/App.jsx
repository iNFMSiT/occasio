import React, { useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { ToastProvider } from './context/ToastContext.jsx';
import { GiftFlowProvider } from './features/gifts/GiftFlowContext.jsx';
import GiftFlowContainer from './features/gifts/GiftFlowContainer.jsx';
import GiftTypeSelector from './features/gifts/GiftTypeSelector.jsx';
import InspirationGallery from './features/gifts/InspirationGallery.jsx';
import { GIFT_TYPES } from './features/gifts/registry.js';
import SessionHistory from './components/SessionHistory.jsx';
import AmbientBackground from './components/visual/AmbientBackground.jsx';
import ThemeSwitcher from './components/visual/ThemeSwitcher.jsx';

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedGiftType, setSelectedGiftType] = useState(null);
  // 'selector' | 'inspiration' — which non-flow screen to show
  const [screen, setScreen] = useState('selector');
  // Recipe to pre-fill a flow when launched from the Hall of Fame
  const [seed, setSeed] = useState(null);
  // Key to force remount when switching gift types or resetting
  const [flowKey, setFlowKey] = useState(0);

  const handleSelectGiftType = (typeId) => {
    setSeed(null);
    setSelectedGiftType(typeId);
    setFlowKey((k) => k + 1);
  };

  const handleMakeThis = (recipe, giftType = 'image') => {
    setSeed({
      state: {
        selectedStyles: recipe.selectedStyles || [],
        selectedThemes: recipe.selectedThemes || [],
      },
      surveyData: {
        ...(recipe.freeText != null ? { freeText: recipe.freeText } : {}),
        ...(recipe.moodSliders ? { moodSliders: recipe.moodSliders } : {}),
      },
    });
    setSelectedGiftType(giftType);
    setFlowKey((k) => k + 1);
  };

  const handleBackToSelector = () => {
    setSelectedGiftType(null);
    setSeed(null);
    setScreen('selector');
  };

  const giftConfig = selectedGiftType ? GIFT_TYPES[selectedGiftType] : null;

  return (
    <ToastProvider>
      <AmbientBackground />
      <div className="min-h-screen">
        <header className="px-6 py-4 border-b border-surface-lighter/30">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedGiftType && (
                <button
                  onClick={handleBackToSelector}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text bg-surface-light border border-surface-lighter/50 hover:border-brand-light/30 transition-colors"
                  title="Back to gift selection"
                >
                  <ArrowLeft size={13} />
                </button>
              )}
              <h1
                onClick={handleBackToSelector}
                className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-light to-accent bg-clip-text text-transparent cursor-pointer"
              >
                Occasio
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text bg-surface-light border border-surface-lighter/50 hover:border-brand-light/30 transition-colors"
                title="Generation History"
              >
                <Clock size={13} />
                <span className="hidden sm:inline">History</span>
              </button>
              {selectedGiftType && giftConfig && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted px-2 py-1 rounded-full bg-surface-light border border-surface-lighter/50">
                  {React.createElement(giftConfig.icon, { size: 12 })}
                  {giftConfig.label}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          {!selectedGiftType ? (
            screen === 'inspiration' ? (
              <InspirationGallery
                onMakeThis={handleMakeThis}
                onBack={() => setScreen('selector')}
              />
            ) : (
              <GiftTypeSelector
                onSelect={handleSelectGiftType}
                onInspiration={() => setScreen('inspiration')}
              />
            )
          ) : (
            <GiftFlowProvider key={flowKey} giftType={selectedGiftType} config={giftConfig} seed={seed}>
              <GiftFlowContainer />
            </GiftFlowProvider>
          )}
        </main>

        <SessionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
      <ThemeSwitcher />
    </ToastProvider>
  );
}
