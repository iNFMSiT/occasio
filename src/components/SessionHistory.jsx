import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Clock, Download, ChevronDown, ChevronUp, Trash2, Image,
  Zap, Calendar, Layers,
} from 'lucide-react';
import sessionStore from '../services/sessionStore.js';
import PromptViewer from './PromptViewer.jsx';
import RatingSlider from './RatingSlider.jsx';
import { GEMINI_CONFIG } from '../config/gemini.js';

function formatDate(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getModelLabel(modelTier) {
  const model = GEMINI_CONFIG.models[modelTier];
  return model?.label || modelTier;
}

function SessionCard({ session, onLoadImages, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!images) {
      setLoading(true);
      try {
        const imgs = await sessionStore.getSessionImages(session.id);
        setImages(imgs);
      } catch (err) {
        console.error('Failed to load session images:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadImage = (img, index) => {
    if (!img.imageUrl) return;
    const link = document.createElement('a');
    link.href = img.imageUrl;
    link.download = `session-${session.id}-card-${index + 1}.png`;
    link.click();
  };

  const downloadAll = () => {
    if (!images) return;
    images.forEach((img, i) => downloadImage(img, i));
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // auto-reset after 3s
      return;
    }
    await onDelete(session.id);
  };

  return (
    <div className="border border-surface-lighter rounded-xl overflow-hidden bg-surface-light/30 transition-all">
      {/* Session header — always visible */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 p-3 hover:bg-surface-light/50 transition-colors text-left"
      >
        {/* Thumbnail */}
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-surface-lighter flex-shrink-0 border border-surface-lighter/50">
          {session.thumbnailUrl ? (
            <img src={session.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image size={16} className="text-text-muted" />
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {session.imageCount} {session.imageCount === 1 ? 'image' : 'images'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-lighter text-text-muted">
              {getModelLabel(session.modelTier)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(session.createdAt)}
            </span>
            {session.styles?.length > 0 && (
              <span className="text-[10px] text-text-muted truncate">
                {session.styles.slice(0, 2).join(', ')}
                {session.styles.length > 2 ? ` +${session.styles.length - 2}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>

      {/* Expanded images grid */}
      {expanded && (
        <div className="border-t border-surface-lighter/50 p-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : images && images.length > 0 ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={img.id} className="space-y-1">
                    <div className="relative group rounded-lg overflow-hidden border border-surface-lighter/50">
                      {img.imageUrl ? (
                        <img src={img.imageUrl} alt={`Card ${i + 1}`} className="w-full aspect-[2/3] object-cover" />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-surface-lighter flex items-center justify-center">
                          <Image size={16} className="text-text-muted" />
                        </div>
                      )}
                      {/* Download overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => downloadImage(img, i)}
                          className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                      {/* Style/theme badge */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                        <p className="text-[9px] text-white/80 truncate">{img.style} · {img.theme}</p>
                      </div>
                    </div>
                    {/* Rating slider */}
                    <div className="flex justify-center">
                      <RatingSlider
                        value={img.rating ?? null}
                        onChange={async (val) => {
                          // Update local state
                          setImages((prev) =>
                            prev.map((im, idx) => idx === i ? { ...im, rating: val } : im)
                          );
                          // Persist to IndexedDB
                          try {
                            await sessionStore.updateImageRating(session.id, i, val);
                          } catch (err) {
                            console.error('Failed to save rating:', err);
                          }
                        }}
                        compact
                      />
                    </div>
                    {/* Prompt viewer */}
                    {img.prompt && <PromptViewer prompt={img.prompt} compact label={`#${i + 1}`} />}
                  </div>
                ))}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleDelete}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    confirmDelete
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-text-muted hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Trash2 size={12} />
                  {confirmDelete ? 'Tap again to confirm' : 'Delete'}
                </button>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-light transition-colors"
                >
                  <Download size={12} />
                  Download all
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-text-muted text-center py-4">No images found for this session.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionHistory({ open, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionStore.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadSessions();
  }, [open, loadSessions]);

  const handleDelete = async (sessionId) => {
    await sessionStore.deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-surface-lighter z-50 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-lighter/50">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-light" />
            <h2 className="text-sm font-semibold">Generation History</h2>
            {sessions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-light text-text-muted">
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers size={32} className="text-text-muted mb-3" />
              <p className="text-sm text-text-muted">No past sessions yet</p>
              <p className="text-xs text-text-muted mt-1">Generated images will appear here automatically.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
