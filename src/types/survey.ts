export type SurveyComponentKind =
  | 'chips'
  | 'sliders'
  | 'madlibs'
  | 'details'
  | 'vision'
  | 'occasion';

export interface SurveySection {
  id: string;
  label: string;
  subtitle: string;
  /** Lucide icon component — typed as unknown to avoid importing lucide-react into types. */
  icon: unknown;
  component: SurveyComponentKind;
  placement: 'core' | 'advanced';
  /** Present on chips sections: the dispatch action string. */
  action?: string;
  /** Present on chips sections: the state key to read selections from. */
  stateKey?: string;
  /** Present on non-chips sections: the survey data key (null = multiple keys). */
  dataKey?: string | null;
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
