import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code, Copy, Check } from 'lucide-react';

/**
 * Collapsible prompt viewer with syntax highlighting for prompt sections.
 * Used in GenerateStep, GalleryStep, and SessionHistory.
 *
 * @param {string} prompt - The full prompt text
 * @param {string} [label] - Optional label (e.g. "Card #1")
 * @param {boolean} [defaultOpen] - Whether to start expanded
 * @param {boolean} [compact] - Smaller variant for inline use
 */
export default function PromptViewer({ prompt, label, defaultOpen = false, compact = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Highlight section headers (=== SUBJECT ===, etc.)
  const renderPrompt = (text) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;

      // Section headers
      if (/^===\s.+\s===$/.test(trimmed)) {
        return (
          <div key={i} className="text-brand-light font-semibold mt-2 first:mt-0 text-[11px] uppercase tracking-wider">
            {trimmed.replace(/===/g, '').trim()}
          </div>
        );
      }

      // Key-value lines (e.g. "Person description:", "Render in:", etc.)
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        const key = trimmed.slice(0, colonIdx + 1);
        const val = trimmed.slice(colonIdx + 1);
        return (
          <div key={i} className="text-[11px] leading-relaxed">
            <span className="text-accent">{key}</span>
            <span className="text-text-muted">{val}</span>
          </div>
        );
      }

      return (
        <div key={i} className="text-[11px] leading-relaxed text-text-muted">
          {trimmed}
        </div>
      );
    });
  };

  if (compact) {
    return (
      <div className="border border-surface-lighter/50 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-text-muted hover:text-text hover:bg-surface-light/30 transition-colors"
        >
          <Code size={10} />
          <span>{label || 'Prompt'}</span>
          {open ? <ChevronUp size={10} className="ml-auto" /> : <ChevronDown size={10} className="ml-auto" />}
        </button>
        {open && (
          <div className="px-2.5 py-2 border-t border-surface-lighter/30 bg-surface/50 max-h-40 overflow-y-auto">
            {renderPrompt(prompt)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-surface-lighter/50 rounded-xl overflow-hidden bg-surface-light/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-surface-light/30 transition-colors"
      >
        <Code size={14} className="text-brand-light" />
        <span className="text-xs font-medium text-text-muted">{label || 'View Prompt'}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {open && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-text-muted hover:text-text hover:bg-surface-lighter/50 transition-colors"
            >
              {copied ? <Check size={10} className="text-success" /> : <Copy size={10} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-surface-lighter/30 bg-surface/30 max-h-64 overflow-y-auto custom-scrollbar">
          {renderPrompt(prompt)}
        </div>
      )}
    </div>
  );
}
