export type SurveyFieldKind =
  | 'chips'
  | 'sliders'
  | 'madlib'
  | 'details'
  | 'vision'
  | 'occasion';

export interface SurveySection {
  id: string;
  kind: SurveyFieldKind;
  title: string;
  placement: 'core' | 'advanced';
  config: Record<string, unknown>;
}

export interface SurveySchema {
  id: string;
  sections: SurveySection[];
}

/** Loose for now — survey answers vary by gift type. Tightened in a later phase. */
export interface SurveyData {
  occasion?: string | { label: string } | null;
  freeText?: string;
  recipient?: { name: string; relationship: string };
  moodSliders?: Record<string, number>;
  hobbies?: string[];
  favoriteShows?: string[];
  favoriteMusic?: string[];
  madLibs?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}
