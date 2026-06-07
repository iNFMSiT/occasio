// Mock Suno service for development without API access
// Generates placeholder audio and lyrics

// Local types — mirrors SongPrompt/SongOptions in ai/song.ts (no circular import).
interface SongPromptLocal {
  fullPrompt?: string;
  genres?: string[];
  vibes?: string[];
  tempo?: string;
  index?: number;
  label?: string;
}

interface SongProgressCallback {
  current: number;
  total: number;
  phase: string;
}

interface SurveyDataLocal {
  memories?: string[];
  lyricMadLibs?: Array<{ selections?: { person?: string } }>;
  [key: string]: unknown;
}

interface SongOptionsLocal {
  onProgress?: (progress: SongProgressCallback) => void;
  surveyData?: SurveyDataLocal;
}

interface SongResult {
  audioUrl: string;
  lyrics: string;
  title: string;
  duration: number;
  genre: string;
  prompt: string;
}

const MOCK_LYRICS_TEMPLATES = [
  {
    verses: [
      "Here's a song for someone special,\nWho lights up every room they're in,\nWith a smile that's unforgettable,\nLet the celebration begin!",
      "Through the good times and the crazy,\nYou've always been right there,\nNever boring, never lazy,\nA friend beyond compare!",
    ],
    chorus: "This one's for you, yeah this one's for you!\nEvery moment, every memory, every breakthrough,\nSo raise a glass, let's make a toast,\nTo the one we love the most!",
    bridge: "Years from now we'll look back at this,\nAnd remember all the joy,\nEvery laugh and every wish,\nNothing time could ever destroy.",
  },
  {
    verses: [
      "Woke up this morning, had to write this down,\nA melody for the best person around,\nYou're the kind of human that's hard to find,\nOne of a kind, one of a kind!",
      "From late night talks to early morning runs,\nYou're there for everyone,\nThe kind of person who gets things done,\nAnd still makes it fun!",
    ],
    chorus: "Happy happy day to you,\nLet me sing it loud and true,\nYou deserve the world and more,\nThat's what this song is for!",
    bridge: "So here's to all the moments yet to come,\nTo all the miles, to all the fun,\nKeep being you, that's all we ask,\nA legend behind and without the mask.",
  },
  {
    verses: [
      "They say write what you know,\nSo I'm writing about you,\nThe person who steals every show,\nIn everything you do!",
      "You've got that energy, that spark,\nThat leaves a lasting mark,\nLighting up even the dark,\nA bonfire in the park!",
    ],
    chorus: "Oh oh oh, it's your time to shine,\nEvery star in the sky wants to be like you tonight,\nOh oh oh, feel the rhythm and rhyme,\nThis song was made for you, and it feels so right!",
    bridge: "When the world gets heavy and the days get long,\nJust remember you've got this song,\nA little reminder that you belong,\nRight here where you're strong.",
  },
];

function generateMockLyrics(surveyData: SurveyDataLocal | undefined): string {
  const template = MOCK_LYRICS_TEMPLATES[Math.floor(Math.random() * MOCK_LYRICS_TEMPLATES.length)];

  // Personalize with survey data if available
  let lyrics = `[Verse 1]\n${template.verses[0]}\n\n`;
  lyrics += `[Chorus]\n${template.chorus}\n\n`;
  lyrics += `[Verse 2]\n${template.verses[1]}\n\n`;
  lyrics += `[Chorus]\n${template.chorus}\n\n`;
  lyrics += `[Bridge]\n${template.bridge}\n\n`;
  lyrics += `[Chorus]\n${template.chorus}`;

  // Add personalization notes
  if (surveyData?.memories && surveyData.memories.length > 0) {
    lyrics += `\n\n[Outro]\nRemembering ${surveyData.memories[0]}...`;
  }

  return lyrics;
}

function generateMockAudioUrl(): string {
  // Generate a simple oscillator-based audio blob as placeholder
  const sampleRate = 44100;
  const duration = 15; // 15 seconds of mock audio
  const numSamples = sampleRate * duration;

  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate a simple melody
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C4 to C5
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor((t / duration) * 32) % notes.length;
    const freq = notes[noteIndex];
    const envelope = Math.min(1, (duration - t) * 2) * Math.min(1, t * 10);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.3 * envelope;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export const mockSunoService = {
  async generateSong(prompt: SongPromptLocal, options: SongOptionsLocal = {}): Promise<SongResult> {
    const { onProgress, surveyData } = options;

    // Simulate generation time
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 300));
      if (onProgress) {
        onProgress({ current: i, total: steps, phase: i < 3 ? 'Composing melody...' : i < 6 ? 'Writing lyrics...' : i < 9 ? 'Mixing audio...' : 'Finalizing...' });
      }
    }

    return {
      audioUrl: generateMockAudioUrl(),
      lyrics: generateMockLyrics(surveyData),
      title: `Song for ${surveyData?.lyricMadLibs?.[0]?.selections?.person ?? 'You'}`,
      duration: 15,
      genre: prompt.genres?.join(', ') ?? 'Pop',
      prompt: prompt.fullPrompt ?? 'Mock generated song',
    };
  },

  async generateSongBatch(prompts: SongPromptLocal[], options: SongOptionsLocal = {}): Promise<SongResult[]> {
    const { onProgress } = options;
    const results: SongResult[] = [];

    for (let i = 0; i < prompts.length; i++) {
      const result = await this.generateSong(prompts[i], {
        ...options,
        onProgress: (p) => {
          if (onProgress) {
            onProgress({ current: i, total: prompts.length, phase: p.phase });
          }
        },
      });
      results.push(result);
    }

    return results;
  },
};
