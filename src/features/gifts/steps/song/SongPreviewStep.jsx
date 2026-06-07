import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Download, RefreshCw, ArrowLeft, Upload,
  Music, ChevronDown, ChevronUp, Share2,
} from 'lucide-react';
import { useGiftFlow } from '../../../../context/GiftFlowContext.jsx';
import { fireConfetti } from '../../../../components/visual/confetti.js';
import { useToast } from '../../../../context/ToastContext.jsx';
import { shareSong } from '../../../../services/shareCard.js';
import RatingSlider from '../../../../components/RatingSlider.jsx';
import songService from '../../../../services/songService.js';
import songPromptEngine from '../../../../services/songPromptEngine.js';

function SongCard({ song, index, onRate, onRegenerate, regenerating }) {
  const [playing, setPlaying] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { addToast } = useToast();
  const audioRef = useRef(null);

  const handleShare = async () => {
    if (!song.audioUrl || sharing) return;
    setSharing(true);
    try {
      const result = await shareSong({ song });
      if (result === 'shared') addToast('Shared!', 'success');
      else if (result === 'downloaded') addToast('Saved — attach it to your message.', 'info');
    } catch {
      addToast('Could not share. Try downloading instead.', 'error');
    } finally {
      setSharing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleEnded = () => setPlaying(false);

  const downloadSong = () => {
    if (!song.audioUrl) return;
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.title || `song-${index + 1}`}.wav`;
    link.click();
  };

  return (
    <div className="rounded-xl border border-surface-lighter bg-surface-light/20 overflow-hidden">
      {/* Song header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{song.title || `Song #${index + 1}`}</h3>
            <p className="text-sm text-text-muted">{song.genre} · {song.vibes}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-light border border-surface-lighter/50 text-xs text-text-muted">
            <Music size={12} />
            {song.duration ? `${song.duration}s` : 'Preview'}
          </div>
        </div>

        {/* Audio player */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-brand hover:bg-brand-dark flex items-center justify-center transition-colors flex-shrink-0"
          >
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <div className="flex-1">
            <audio
              ref={audioRef}
              src={song.audioUrl}
              onEnded={handleEnded}
              className="w-full"
              controls
              style={{ height: 32 }}
            />
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={downloadSong}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-surface-lighter rounded-lg hover:bg-surface-light transition-colors"
            >
              <Download size={12} /> Download
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-surface-lighter rounded-lg hover:bg-surface-light disabled:opacity-50 transition-colors"
            >
              <Share2 size={12} /> Share
            </button>
            <button
              onClick={() => onRegenerate(index)}
              disabled={regenerating === index}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-surface-lighter rounded-lg hover:bg-surface-light disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={12} className={regenerating === index ? 'animate-spin' : ''} />
              Regenerate
            </button>
          </div>

          <RatingSlider
            value={song.rating ?? null}
            onChange={(val) => onRate(index, val)}
            compact
          />
        </div>
      </div>

      {/* Lyrics accordion */}
      <div className="border-t border-surface-lighter/30">
        <button
          onClick={() => setLyricsOpen(!lyricsOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <span>Lyrics</span>
          {lyricsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {lyricsOpen && (
          <div className="px-4 pb-4">
            <pre className="text-sm text-text-muted whitespace-pre-wrap font-sans leading-relaxed bg-surface/50 rounded-lg p-4 border border-surface-lighter/30 max-h-64 overflow-y-auto custom-scrollbar">
              {song.lyrics || 'No lyrics available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SongPreviewStep() {
  const { songs, surveyData, selectedGenres, selectedVibes, dispatch } = useGiftFlow();
  const { addToast } = useToast();
  const [regenerating, setRegenerating] = useState(null);

  // Celebrate once when the finished songs first appear.
  const celebrated = useRef(false);
  useEffect(() => {
    if (!celebrated.current && songs?.some((s) => s?.audioUrl)) {
      celebrated.current = true;
      fireConfetti();
    }
  }, [songs]);

  const handleRate = (index, rating) => {
    dispatch({ type: 'RATE_SONG', payload: { index, rating } });
  };

  const handleRegenerate = async (index) => {
    setRegenerating(index);
    try {
      const bp = songPromptEngine.createBlueprint(surveyData, selectedGenres, selectedVibes, 1);
      const result = await songService.generateSong(bp[0], { surveyData });
      const updatedSongs = [...songs];
      updatedSongs[index] = {
        ...result,
        genre: bp[0].genres.join(', '),
        vibes: bp[0].vibes.join(', '),
        rating: null,
      };
      dispatch({ type: 'SET_SONGS', payload: updatedSongs });
      addToast({ type: 'success', message: `Song #${index + 1} regenerated!` });
    } catch (err) {
      addToast({ type: 'error', message: `Failed to regenerate song #${index + 1}` });
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your Custom Songs</h2>
        <p className="text-text-muted">
          Listen, rate, and regenerate. Download your favorites!
        </p>
      </div>

      <div className="space-y-4">
        {songs.map((song, i) => (
          <SongCard
            key={i}
            song={song}
            index={i}
            onRate={handleRate}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
          />
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} /> Back to Generation
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark rounded-lg font-medium text-sm transition-colors"
        >
          <Upload size={16} /> New Project
        </button>
      </div>
    </div>
  );
}
