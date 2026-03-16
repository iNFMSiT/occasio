import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { WizardProvider } from './context/WizardContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import WizardContainer from './components/WizardContainer.jsx';
import SessionHistory from './components/SessionHistory.jsx';

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <ToastProvider>
      <WizardProvider>
        <div className="min-h-screen">
          <header className="px-6 py-4 border-b border-surface-lighter/30">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-light to-accent bg-clip-text text-transparent">
                CustomCards
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text bg-surface-light border border-surface-lighter/50 hover:border-brand-light/30 transition-colors"
                  title="Generation History"
                >
                  <Clock size={13} />
                  <span className="hidden sm:inline">History</span>
                </button>
                <span className="text-xs text-text-muted px-2 py-1 rounded-full bg-surface-light border border-surface-lighter/50">
                  MVP Preview
                </span>
              </div>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-6 py-8">
            <WizardContainer />
          </main>
          <SessionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
        </div>
      </WizardProvider>
    </ToastProvider>
  );
}
