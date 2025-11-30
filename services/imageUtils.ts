/**
 * Converts a Blob or File to a Base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Fetches an image from a URL and converts it to Base64.
 * Note: Requires the image server to support CORS.
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    console.error("Error converting URL to base64", error);
    throw error;
  }
};

/**
 * Returns a clean data URL for display
 */
export const getDisplayUrl = (base64: string, mimeType: string = 'image/png'): string => {
  return `data:${mimeType};base64,${base64}`;
};
