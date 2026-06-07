// Prompt Engineering Service — v3
// Narrative prompts with Markdown structure, optimized for Gemini image generation.
// Research-backed: narrative > keyword lists, ## headers > ASCII delimiters,
// concise descriptions > verbose constraint dumps.

import { ART_STYLES, STYLE_INSTRUCTIONS } from '../data/artStyles';
import { THEME_BUILDERS } from '../data/themes';
import { MOOD_TYPES } from '../data/generation';
import { MVP_CONFIG } from '../config/flags.js';
import { OCCASIONS } from '../data/occasions';
import type { SurveyData } from '../types';
import type { BlueprintItem } from './ai/types';

/** Vibes inferred from mood sliders. */
interface VibeProfile {
  chaos: number;
  energy: number;
  humor: number;
}

/** Minimal shape of a resolved mad-lib entry used during blueprint building. */
interface MadLibEntry {
  displayText: string;
  templateId: string | null;
  selections?: { style?: string; [key: string]: unknown };
  [key: string]: unknown;
}

interface BuildPromptParams {
  anchorDescription: string;
  style: string;
  theme: string;
  composition: string;
  mood: string;
  surveyData: SurveyData;
  vibeProfile: VibeProfile;
  referenceImageIncluded: boolean;
}

interface BuildMadLibPromptParams {
  anchorDescription: string;
  madLib: MadLibEntry;
  style: string;
  composition: string;
  mood: string;
  surveyData: SurveyData;
  vibeProfile: VibeProfile;
  referenceImageIncluded: boolean;
}

// Resolve an occasion value (preset id string or { label } object) to a display label.
function occasionLabel(occasion: SurveyData['occasion']): string | null {
  if (!occasion) return null;
  if (typeof occasion === 'object') return occasion.label || null;
  const match = OCCASIONS.find((o) => o.id === occasion);
  return match ? match.label : occasion;
}

class PromptEngine {
  blueprint: BlueprintItem[];

  constructor() {
    this.blueprint = [];
  }

  /**
   * Build a narrative structured prompt for a single card.
   * Uses ## Markdown headers (proven more effective with Gemini than ASCII delimiters).
   * Content is written as descriptive narrative, not keyword lists.
   */
  buildPrompt({ anchorDescription, style, theme, composition, mood, surveyData, vibeProfile, referenceImageIncluded }: BuildPromptParams): string {
    const sections: string[] = [];

    // --- Identity anchor ---
    sections.push('## Subject');
    if (referenceImageIncluded) {
      sections.push(
        'The attached reference photo shows the exact person to depict. ' +
        'Preserve their face, skin tone, hair, and all distinguishing features so the result is unmistakably recognizable as this person.'
      );
    }
    sections.push(anchorDescription);

    // --- Scene / Theme ---
    sections.push('');
    sections.push('## Scene');
    const themeBuilder = THEME_BUILDERS[theme];
    const themeContext = themeBuilder ? themeBuilder(surveyData) : 'in an unexpected and creative scenario';
    sections.push(`Depict this person ${themeContext}.`);

    const props = this._buildEnvironmentProps(surveyData, theme);
    if (props) {
      sections.push(props);
    }

    // --- Occasion (sets the celebratory tone) ---
    const occasion = occasionLabel(surveyData?.occasion);
    if (occasion) {
      sections.push('');
      sections.push('## Occasion');
      sections.push(`This image is a gift for a ${occasion} — give the scene a fitting, celebratory mood.`);
    }

    // --- Special Request (user's free-text vision) ---
    const freeText = surveyData?.freeText?.trim();
    if (freeText) {
      sections.push('');
      sections.push('## Special Request');
      sections.push(`The user specifically asked for: ${freeText}. Prioritize honoring this in the scene.`);
    }

    // --- Art Style ---
    sections.push('');
    sections.push('## Style');
    const styleDesc = STYLE_INSTRUCTIONS[style] || `${this._getStyleLabel(style)} style`;
    sections.push(`Rendered in ${styleDesc}`);

    // --- Composition & Camera (using photographic language) ---
    sections.push('');
    sections.push('## Composition');
    const compInstructions: Record<string, string> = {
      'close-up': 'Tight close-up portrait framed from head to upper chest, shot with an 85mm portrait lens. Face fills most of the frame with a soft bokeh background.',
      'mid-shot': 'Medium shot from the waist up, balanced framing showing pose, outfit, and immediate surroundings.',
      'full-body': 'Low-angle full-body shot showing the complete figure from head to feet. Wide-angle lens perspective, dynamic confident pose with environmental context visible. The full body must be in frame.',
    };
    sections.push(compInstructions[composition] || `${composition} shot.`);

    // --- Mood (concise) ---
    sections.push('');
    sections.push('## Mood');
    const moodInstructions: Record<string, string> = {
      epic: 'Epic grandiose atmosphere with dramatic rim lighting and volumetric god rays. The character looks powerful and awe-inspiring.',
      funny: 'Humorous lighthearted vibe with bright cheerful lighting and an exaggerated comedic expression. Warm inviting colors.',
      serious: 'Serious intense atmosphere with moody directional lighting, deep shadows, and a focused determined expression.',
      abstract: 'Dreamlike surreal atmosphere with impossible geometry, flowing elements, and vibrant clashing colors bending around the subject.',
    };
    sections.push(moodInstructions[mood] || `${mood} mood.`);

    // Vibe slider modifiers (only add if meaningful)
    const vibeNote = this._buildVibeNote(vibeProfile);
    if (vibeNote) sections.push(vibeNote);

    // --- Quality (kept brief) ---
    sections.push('');
    sections.push('## Output');
    sections.push('Highly detailed, vibrant colors, strong composition. Portrait orientation 2:3 aspect ratio.');

    return sections.join('\n');
  }

  /**
   * Build a concise narrative sentence about environmental props from survey data.
   * Written as natural prose, not a bullet list.
   */
  _buildEnvironmentProps(surveyData: SurveyData, _theme: string | null): string | null {
    const details: string[] = [];

    if (surveyData.hobbies?.length) {
      const items = surveyData.hobbies.slice(0, 2).map((h) => h.toLowerCase());
      details.push(`elements related to ${items.join(' and ')} are woven into the scene`);
    }

    if (surveyData.favoriteShows?.length) {
      details.push(`subtle visual nods to ${surveyData.favoriteShows[0]} in the background`);
    }

    if (surveyData.favoriteMusic?.length) {
      details.push(`atmosphere influenced by the energy of ${surveyData.favoriteMusic[0]}`);
    }

    return details.length > 0 ? `The environment includes ${details.join(', and ')}.` : null;
  }

  /**
   * Build vibe modifier note from mood sliders (only when meaningful).
   */
  _buildVibeNote(vibeProfile: VibeProfile): string | null {
    const parts: string[] = [];
    if (vibeProfile.chaos > 0.5) parts.push(vibeProfile.chaos > 0.7 ? 'surreal warping elements' : 'subtle surreal touches');
    if (vibeProfile.energy > 0.5) parts.push(vibeProfile.energy > 0.7 ? 'extreme dynamic motion and wind' : 'energetic action pose');
    if (vibeProfile.humor > 0.5) parts.push(vibeProfile.humor > 0.7 ? 'exaggerated comedic expression' : 'playful lighthearted tone');
    return parts.length ? `Add ${parts.join(', ')}.` : null;
  }

  _getStyleLabel(styleId: string): string {
    const style = ART_STYLES.find((s) => s.id === styleId);
    return style ? style.label.toLowerCase() : styleId;
  }

  /**
   * Build a mad-lib prompt with the same Markdown structure.
   */
  buildMadLibPrompt({ anchorDescription, madLib, style, composition, mood, surveyData, vibeProfile, referenceImageIncluded }: BuildMadLibPromptParams): string {
    const sections: string[] = [];

    sections.push('## Subject');
    if (referenceImageIncluded) {
      sections.push(
        'The attached reference photo shows the exact person to depict. ' +
        'Preserve their face, skin tone, hair, and all distinguishing features so the result is unmistakably recognizable.'
      );
    }
    sections.push(anchorDescription);

    sections.push('');
    sections.push('## Scene');
    sections.push(madLib.displayText);
    const props = this._buildEnvironmentProps(surveyData, null);
    if (props) sections.push(props);

    const occasion = occasionLabel(surveyData?.occasion);
    if (occasion) {
      sections.push('');
      sections.push('## Occasion');
      sections.push(`This image is a gift for a ${occasion} — give the scene a fitting, celebratory mood.`);
    }

    const freeText = surveyData?.freeText?.trim();
    if (freeText) {
      sections.push('');
      sections.push('## Special Request');
      sections.push(`The user specifically asked for: ${freeText}. Prioritize honoring this in the scene.`);
    }

    sections.push('');
    sections.push('## Style');
    const styleDesc = STYLE_INSTRUCTIONS[style] || `${this._getStyleLabel(style)} style`;
    sections.push(`Rendered in ${styleDesc}`);

    sections.push('');
    sections.push('## Composition');
    const compMap: Record<string, string> = {
      'close-up': 'Close-up portrait, head and upper chest, 85mm lens with bokeh background.',
      'mid-shot': 'Medium shot from waist up, balanced framing.',
      'full-body': 'Low-angle full-body shot showing the complete figure from head to feet, dynamic pose.',
    };
    sections.push(compMap[composition] || `${composition} shot.`);

    sections.push('');
    sections.push('## Mood');
    const moodMap: Record<string, string> = {
      epic: 'Epic atmosphere with dramatic rim lighting and god rays.',
      funny: 'Humorous lighthearted vibe with bright colors and a comedic expression.',
      serious: 'Serious intense mood with moody directional lighting and a focused expression.',
      abstract: 'Dreamlike surreal atmosphere with impossible geometry and vibrant colors.',
    };
    sections.push(moodMap[mood] || `${mood} mood.`);

    const vibeNote = this._buildVibeNote(vibeProfile);
    if (vibeNote) sections.push(vibeNote);

    sections.push('');
    sections.push('## Output');
    sections.push('Highly detailed, vibrant colors, portrait 2:3 aspect ratio.');

    return sections.join('\n');
  }

  // ---- Selection helpers ----

  selectStyle(cardIndex: number, selectedStyles: string[]): string {
    if (!selectedStyles.length) return 'pixar';
    return selectedStyles[cardIndex % selectedStyles.length];
  }

  selectTheme(cardIndex: number, selectedThemes: string[]): string {
    if (!selectedThemes.length) return 'wildcard';
    return selectedThemes[cardIndex % selectedThemes.length];
  }

  selectComposition(cardIndex: number): string {
    // Weighted distribution: ~60% full-body, ~25% mid-shot, ~15% close-up
    // Users want mostly full-body shots; close-ups are overrepresented by default.
    const weighted = ['full-body', 'full-body', 'full-body', 'mid-shot', 'mid-shot', 'close-up'];
    // For single image, always full-body
    return weighted[cardIndex % weighted.length];
  }

  selectMood(cardIndex: number): string {
    const moods = Object.values(MOOD_TYPES);
    return moods[cardIndex % moods.length];
  }

  extractStyleFromMadLib(madLib: MadLibEntry): string | null {
    if (madLib.selections?.style) return madLib.selections.style;
    const styleKeywords = ART_STYLES.map((s) => s.id);
    const lowerText = (madLib.displayText || '').toLowerCase();
    for (const keyword of styleKeywords) {
      if (lowerText.includes(keyword)) return keyword;
    }
    return null;
  }

  // ---- Main blueprint creation ----

  createBlueprint(
    anchorDescription: string,
    surveyData: SurveyData,
    selectedStyles: string[],
    selectedThemes: string[],
    cardCountOverride?: number
  ): BlueprintItem[] {
    this.blueprint = [];

    const cardCount = cardCountOverride || MVP_CONFIG.CARD_COUNT;
    const vibeProfile: VibeProfile = (surveyData.moodSliders as VibeProfile | undefined) || { chaos: 0.5, energy: 0.5, humor: 0.5 };
    const madLibsPrompts: MadLibEntry[] = (surveyData.madLibs as MadLibEntry[] | undefined) || [];
    // We'll note that a reference image will be attached at generation time
    const referenceImageIncluded = true; // always true when we have an anchor

    for (let i = 0; i < cardCount; i++) {
      const style = this.selectStyle(i, selectedStyles);
      const theme = this.selectTheme(i, selectedThemes);
      const composition = this.selectComposition(i);
      const mood = this.selectMood(i);

      let prompt: string;
      let madLibId: string | null = null;

      if (madLibsPrompts.length > 0 && i < madLibsPrompts.length) {
        // Mad lib prompt
        const madLib = madLibsPrompts[i];
        const madLibStyle = this.extractStyleFromMadLib(madLib) || style;
        prompt = this.buildMadLibPrompt({
          anchorDescription,
          madLib,
          style: madLibStyle,
          composition,
          mood,
          surveyData,
          vibeProfile,
          referenceImageIncluded,
        });
        madLibId = madLib.templateId;
      } else {
        // Standard prompt
        prompt = this.buildPrompt({
          anchorDescription,
          style,
          theme,
          composition,
          mood,
          surveyData,
          vibeProfile,
          referenceImageIncluded,
        });
      }

      this.blueprint.push({
        cardIndex: i,
        prompt,
        style,
        theme,
        composition,
        mood,
        madLibId,
      });
    }

    return this.blueprint;
  }
}

export default new PromptEngine();
