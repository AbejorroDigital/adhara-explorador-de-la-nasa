
export interface NASA_APOD {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AI_Insight {
  translatedTitle: string;
  translatedExplanation: string;
  reflection: string;
  scientificContext: string;
  philosophicalPerspective: string;
  suggestedReading: string[];
  recentNews?: GroundingSource[];
}

export interface FavoriteItem {
  apod: NASA_APOD;
  insight: AI_Insight;
}
