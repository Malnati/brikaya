// cloud/app/api/src/constants/whatsapp.constants.ts
export const EXTRACTION_STATUS_ORIGINAL = 'original' as const;
export const EXTRACTION_STATUS_VERIFIED = 'verified' as const;

export type ExtractionStatus =
  | typeof EXTRACTION_STATUS_ORIGINAL
  | typeof EXTRACTION_STATUS_VERIFIED;

export const EXTRACTION_CLASSIFICATION_TRUSTED = 'trusted' as const;
export const EXTRACTION_CLASSIFICATION_UNREAL = 'unreal' as const;

export type ExtractionClassification =
  | typeof EXTRACTION_CLASSIFICATION_TRUSTED
  | typeof EXTRACTION_CLASSIFICATION_UNREAL
  | null;

export const EXTRACTION_STATUS_PRIORITY: Record<ExtractionStatus, number> = {
  [EXTRACTION_STATUS_ORIGINAL]: 1,
  [EXTRACTION_STATUS_VERIFIED]: 2,
};
