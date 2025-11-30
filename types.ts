export interface ImageAsset {
  id: string;
  url: string;
  type: 'preset' | 'upload' | 'generated';
  base64?: string; // Optional cache for base64 string
}

export enum AppStep {
  SELECT_PERSON = 1,
  SELECT_CLOTH = 2,
  RESULT = 3,
}

export interface GenerationConfig {
  personImage: string; // Base64
  clothImage: string; // Base64
}
