import {
  Upload, ClipboardList, Sparkles, LayoutGrid,
  Music, Headphones, Type,
} from 'lucide-react';
import { COPY } from '../../data/copy';

// Image flow steps
import ImageUploadStep from './steps/image/ImageUploadStep.jsx';
import ImageSurveyStep from './steps/image/ImageSurveyStep.jsx';
import ImageGenerateStep from './steps/image/ImageGenerateStep.jsx';
import MessageStep from './steps/image/MessageStep.jsx';
import ImageGalleryStep from './steps/image/ImageGalleryStep.jsx';

// Song flow steps
import SongSurveyStep from './steps/song/SongSurveyStep.jsx';
import SongGenerateStep from './steps/song/SongGenerateStep.jsx';
import SongPreviewStep from './steps/song/SongPreviewStep.jsx';

export const GIFT_TYPES = {
  image: {
    id: 'image',
    label: COPY.giftTypes.image.label,
    description: COPY.giftTypes.image.description,
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    steps: ['upload', 'survey', 'generate', 'message', 'gallery'],
    stepComponents: {
      upload: ImageUploadStep,
      survey: ImageSurveyStep,
      generate: ImageGenerateStep,
      message: MessageStep,
      gallery: ImageGalleryStep,
    },
    stepMeta: {
      upload: { label: 'Upload', icon: Upload },
      survey: { label: 'Customize', icon: ClipboardList },
      generate: { label: 'Generate', icon: Sparkles },
      message: { label: 'Message', icon: Type },
      gallery: { label: 'Gallery', icon: LayoutGrid },
    },
    initialState: {
      images: [],
      anchorDescription: null,
      selectedStyles: [],
      selectedThemes: [],
      blueprint: [],
      cards: [],
      generationProgress: { current: 0, total: 0 },
    },
    initialSurveyData: {
      occasion: null,
      freeText: '',
      recipient: { name: '', relationship: '' },
      moodSliders: { chaos: 0.5, energy: 0.5, humor: 0.5 },
      hobbies: [],
      favoriteShows: [],
      favoriteMusic: [],
      madLibs: [],
    },
    initialSettings: {
      modelTier: 'nanoBanana',
      devMode: false,
      cardCount: 1,
    },
  },

  song: {
    id: 'song',
    label: COPY.giftTypes.song.label,
    description: COPY.giftTypes.song.description,
    icon: Music,
    color: 'from-green-500 to-teal-500',
    steps: ['survey', 'generate', 'preview'],
    stepComponents: {
      survey: SongSurveyStep,
      generate: SongGenerateStep,
      preview: SongPreviewStep,
    },
    stepMeta: {
      survey: { label: 'Customize', icon: ClipboardList },
      generate: { label: 'Generate', icon: Music },
      preview: { label: 'Preview', icon: Headphones },
    },
    initialState: {
      selectedGenres: [],
      selectedVibes: [],
      songs: [],
      songPrompt: null,
    },
    initialSurveyData: {
      occasion: null,
      freeText: '',
      moodSliders: { energy: 0.5, sentiment: 0.5, humor: 0.5 },
      memories: [],
      insideJokes: [],
      milestones: [],
      lyricMadLibs: [],
    },
    initialSettings: {
      songCount: 2,
    },
  },
};
