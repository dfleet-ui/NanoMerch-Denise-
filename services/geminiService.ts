import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a marketing image or edits an existing product image based on a text prompt.
 * Uses 'gemini-2.5-flash-image' which supports image input for editing/variation.
 * 
 * @param base64Image - The source product image in base64 format (without data URL prefix).
 * @param mimeType - The mime type of the source image.
 * @param prompt - The text description of the desired output.
 * @returns The generated image as a base64 data URL.
 */
export const generateMarketingImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // 'gemini-2.5-flash-image' is the specific model requested for image editing/generation tasks.
    // It is efficient (Nano Banana) and handles image-to-image workflows.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE], // We strictly want an image back
      },
    });

    // Extract the image from the response
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      const generatedBase64 = part.inlineData.data;
      // The API usually returns PNG or JPEG. We construct a data URL for display.
      // Assuming PNG default for high quality, but browser renders generic base64 usually fine.
      return `data:image/png;base64,${generatedBase64}`;
    }

    throw new Error("No image data found in the response.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to process a file object into the format needed for the API.
 */
export const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const data = base64String.split(',')[1];
      resolve({
        data,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
