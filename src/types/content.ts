import type { SurveyData } from './survey';

export interface ArtStyle {
  id: string;
  label: string;
  description: string;
  /** Narrative rendering instruction injected into image prompts. */
  promptInstruction: string;
  thumbnail?: string;
}

/** A theme pairs display metadata with a scene-builder over survey answers.
 *  (Builder stays a function for now; template-ization is a later phase.) */
export interface Theme {
  id: string;
  label: string;
  description: string;
  buildScene: (survey: SurveyData) => string;
}

export interface SelectOption { value: string; label: string; }

export interface MadLibField {
  id: string;
  label: string;
  options: SelectOption[];
}

export interface MadLibTemplate {
  id: string;
  template: string;
  fields: MadLibField[];
}

export interface Occasion {
  id: string;
  label: string;
  emoji?: string;
  preset?: OccasionPreset;
}

export interface OccasionPreset {
  moodSliders?: Record<string, number>;
  suggestedGenres?: string[];
  suggestedVibes?: string[];
  suggestedMadLib?: string | null;
  suggestedMadLibFields?: Record<string, string>;
}
