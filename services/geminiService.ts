import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

/**
 * Generates a clothing item based on a text prompt using Nano Banana.
 */
export const generateClothingAsset = async (prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash-image'; // Nano Banana

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: `Generate a high-quality, standalone image of a clothing item: ${prompt}. The clothing should be on a plain white or neutral background, suitable for a virtual try-on application. Flat lay or mannequin style.` }
      ]
    },
    config: {
        imageConfig: {
            aspectRatio: "1:1",
        }
    }
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image generated.");
};

/**
 * Generates a Try-On image using Nano Banana.
 */
export const generateTryOnResult = async (personBase64: string, garmentBase64: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash-image'; // Nano Banana

  // We are "editing" the person image by applying the garment
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: personBase64,
            mimeType: 'image/jpeg', // Assuming jpeg/png generic compatibility
          },
        },
        {
          inlineData: {
            data: garmentBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: "Generate a realistic full-body photo of the person from the first image wearing the clothing from the second image. Maintain the person's exact pose, facial features, body shape, and the background. Ensure the clothing fits naturally with realistic lighting and shadows. High quality, photorealistic."
        },
      ],
    },
    config: {
        imageConfig: {
            aspectRatio: "3:4", // Portrait for full body
        }
    }
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No try-on image generated.");
};
