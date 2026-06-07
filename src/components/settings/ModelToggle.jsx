import React, { useState } from 'react';
import { Zap, Settings, Monitor, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useGiftFlow } from '../../context/GiftFlowContext.jsx';
import { isApiConfigured, GEMINI_CONFIG } from '../../config/gemini.js';

export default function ModelToggle() {
  const { settings, dispatch } = useGiftFlow();
  const [open, setOpen] = useState(false);

  const apiReady = isApiConfigured();
  const models = GEMINI_CONFIG.models;
  const currentModel = models[settings.modelTier];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-surface-light border border-surface-lighter/50 hover:border-brand-light/30 transition-colors"
      >
        <Zap size={12} className="text-accent" />
        <span className="text-text-muted">{currentModel?.label || 'Settings'}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${apiReady && !settings.devMode ? 'bg-success' : 'bg-accent'}`} />
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute top-full right-0 mt-2 w-80 bg-surface-light border border-surface-lighter rounded-xl shadow-xl p-4 z-50 animate-fade-in space-y-4">
            {/* Model selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <Zap size={12} />
                Nanobanana Model
              </p>
              <div className="space-y-2">
                {Object.entries(models).map(([key, model]) => (
                  <button
                    key={key}
                    onClick={() => dispatch({ type: 'SET_MODEL_TIER', payload: key })}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      settings.modelTier === key
                        ? 'border-brand bg-brand/10'
                        : 'border-surface-lighter hover:border-brand-light/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          key === 'nanoBananaPro' ? 'bg-accent/20 text-accent' :
                          key === 'nanoBanana' ? 'bg-brand/20 text-brand-light' :
                          'bg-surface-lighter text-text-muted'
                        }`}>
                          {model.badge}
                        </span>
                        <p className="text-xs font-medium">{model.label}</p>
                      </div>
                      <span className="text-[10px] text-text-muted">~${model.costPerImage}/img</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1 ml-8">{model.description}</p>
                    {model.retiring && (
                      <div className="flex items-center gap-1 mt-1.5 ml-8">
                        <AlertTriangle size={10} className="text-accent" />
                        <span className="text-[10px] text-accent">Retiring {model.retiring}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Cost estimate */}
              <div className="bg-surface/50 rounded-lg px-3 py-2 border border-surface-lighter/30">
                <p className="text-[10px] text-text-muted">
                  Estimated cost ({settings.cardCount || 6} {(settings.cardCount || 6) === 1 ? 'image' : 'images'}): <strong className="text-text">~${(currentModel?.costPerImage * (settings.cardCount || 6)).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Dev mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Monitor size={12} className="text-text-muted" />
                <span className="text-xs text-text-muted">Dev Mode (mock data)</span>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_DEV_MODE', payload: !settings.devMode })}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.devMode ? 'bg-accent' : 'bg-surface-lighter'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings.devMode ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* API status */}
            <div className="flex items-center gap-1.5 text-xs">
              {apiReady ? (
                <>
                  <Wifi size={12} className="text-success" />
                  <span className="text-success">API key configured</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="text-danger" />
                  <span className="text-danger">No API key — using mock data</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
