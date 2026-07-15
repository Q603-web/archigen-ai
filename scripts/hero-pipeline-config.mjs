/** Canonical image settings for ArchiGen article heroes. */
export const HERO_MODEL = 'gemini-3.1-flash-lite-image';
export const HERO_ASPECT_RATIO = '16:9';
export const HERO_RESPONSE_MODALITIES = ['IMAGE'];

export function heroGenerationConfig() {
  return {
    responseModalities: HERO_RESPONSE_MODALITIES,
    imageConfig: { aspectRatio: HERO_ASPECT_RATIO },
  };
}
