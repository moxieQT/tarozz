export type PhaseId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Marker {
  id: string;
  text: string;
}

export type DepthLevel = 'cognitive' | 'emotional' | 'somatic';
export type ModalityType = 'visual' | 'audio' | 'text' | 'metaphor';
export type GroupMode = 'solo' | 'group';

export interface ContentMatrix {
  cognitive: Record<ModalityType, string>;
  emotional: Record<ModalityType, string>;
  somatic: Record<ModalityType, string>;
}

export interface PhaseMeasurement {
  title: string;
  description: string;
  questions: {
    id: string;
    label: string;
    type: 'text' | 'scale' | 'boolean';
  }[];
}

export interface PhaseConfig {
  id: PhaseId;
  title: string;
  subtitle: string;
  description: string;
  readinessMarkers: Marker[];
  contraindications: Marker[];
  content: {
    solo: ContentMatrix;
    group: ContentMatrix;
  };
  measurement: PhaseMeasurement;
}

export interface CardType {
  id: string;
  title: string;
  description: string;
  gradient: string;
  imageUrl?: string;
}

export interface SavedCardType extends CardType {
  intensity: number;
}
