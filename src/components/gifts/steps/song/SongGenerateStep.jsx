import React, { useState } from 'react';
import { Music, ArrowLeft, ArrowRight, Loader, Wand2, Code } from 'lucide-react';
import { useGiftFlow } from '../../../../context/GiftFlowContext.jsx';
import { useToast } from '../../../../context/ToastContext.jsx';
import songPromptEngine from '../../../../services/songPromptEngine.js';
import songService from '../../../../services/ai/song';
import PromptViewer from '../../../../components/common/PromptViewer.jsx';

const COUNT_OPTIONS = [
  { value: 1, label: '1', desc: 'Single song' },
  { value: 2, label: '2', desc: 'Two variations' },
  { value: 3, label: '3', desc: 'Three options' },
];

export default function SongGenerateStep() {
  const {
    surveyData, selectedGenres, selectedVibes,
    songs, settings, dispatch,
  } = useGiftFlow();
  const { addToast } = useToast();

  const [phase, setPhase] = useState('idle'); // idle, generating, done
  const [isWorking, setIsWorking] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [showPrompts, setShowPrompts] = useState(false);
  const [blueprint, setBlueprint] = useState([]);

  const songCount = settings.songCount || 2;

  const handleCountChange = (count) => {
    dispatch({ type: 'SET_SONG_COUNT', payload: count });
    setBlueprint([]);
    setShowPrompts(false);
  };

  const handlePeekPrompts = () => {
    if (showPrompts) { setShowPrompts(false); return; }
    const bp = songPromptEngine.createBlueprint(surveyData, selectedGenres, selectedVibes, songCount);
    setBlueprint(bp);
    setShowPrompts(true);
  };

  const generateSongs = async () => {
    if (isWorking) return;
    setIsWorking(true);
    setPhase('generating');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const bp = songPromptEngine.createBlueprint(surveyData, selectedGenres, selectedVibes, songCount);
      setBlueprint(bp);
      dispatch({ type: 'SET_SONG_PROMPT', payload: bp });

      const results = [];
      for (let i = 0; i < bp.length; i++) {
        const result = await songService.generateSong(bp[i], {
          surveyData,
          onProgress: (p) => {
            setProgress({ ...p, songIndex: i, totalSongs: bp.length });
          },
        });
        results.push({
          ...result,
          genre: bp[i].genres.join(', '),
          vibes: bp[i].vibes.join(', '),
          rating: null,
        });
        dispatch({ type: 'SET_SONGS', payload: [...results] });
      }

      setPhase('done');
      addToast({ type: 'success', message: `${songCount === 1 ? 'Song' : `${songCount} songs`} generated!` });
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to generate songs.' });
      setPhase('idle');
    } finally {
      setIsWorking(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {phase === 'done' ? (songCount === 1 ? 'Your Song Is Ready!' : 'Your Songs Are Ready!') : 'Generate Songs'}
        </h2>
        <p className="text-text-muted">
          {phase === 'idle' && 'Choose how many song variations, then hit generate.'}
          {phase === 'generating' && `Creating your ${songCount === 1 ? 'song' : 'songs'}...`}
          {phase === 'done' && 'Head to preview to listen and rate!'}
        </p>
      </div>

      {/* Song count selector */}
      {phase === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-text-muted text-center">How many song variations?</p>
          <div className="flex gap-3 justify-center">
            {COUNT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleCountChange(opt.value)}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl border-2 transition-all min-w-[80px] ${
                  songCount === opt.value
                    ? 'border-brand bg-brand/10 shadow-md shadow-brand/10'
                    : 'border-surface-lighter hover:border-brand-light/40 bg-surface-light/50'
                }`}
              >
                <span className={`text-xl font-bold ${songCount === opt.value ? 'text-brand-light' : 'text-text'}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-text-muted">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Peek at prompts */}
      {phase === 'idle' && (
        <div className="space-y-2">
          <div className="flex justify-center">
            <button onClick={handlePeekPrompts} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text border border-surface-lighter/50 hover:border-brand-light/30 transition-colors">
              <Code size={12} />
              {showPrompts ? 'Hide Prompts' : 'Preview Prompts'}
            </button>
          </div>
          {showPrompts && blueprint.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {blueprint.map((item, i) => (
                <PromptViewer key={i} prompt={item.fullPrompt} label={`Song #${i + 1} — ${item.genres.join(', ')}`} defaultOpen={i === 0} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {phase === 'generating' && (
        <div className="space-y-3">
          <div className="h-3 bg-surface-light rounded-full overflow-hidden border border-surface-lighter/30">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 10}%` }}
            />
          </div>
          <p className="text-sm text-text-muted text-center">
            {progress.phase || 'Starting...'}
            {progress.totalSongs > 1 && ` (Song ${(progress.songIndex || 0) + 1} of ${progress.totalSongs})`}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          disabled={isWorking}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text disabled:opacity-30 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex gap-3">
          {phase === 'idle' && (
            <button
              onClick={generateSongs}
              disabled={isWorking}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg font-medium text-sm transition-colors"
            >
              <Wand2 size={16} />
              Generate {songCount === 1 ? 'Song' : `${songCount} Songs`}
            </button>
          )}

          {phase === 'generating' && (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-surface-light rounded-lg text-sm text-text-muted">
              <Loader size={16} className="animate-spin" /> Generating...
            </div>
          )}

          {phase === 'done' && (
            <button
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark rounded-lg font-medium text-sm transition-colors"
            >
              Preview Songs <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
