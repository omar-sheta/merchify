// lib/gemini.js
import { GoogleGenAI } from '@google/genai';

const MODEL_ID = 'gemini-2.5-flash-image';

/**
 * Generate a merch mockup.
 * @param {string} prompt – full text prompt (we build it in the API route)
 * @param {Array<{mimeType:string, data:string}>} inlineImages – array of images (the captured frame)
 */
export async function generateImageFromPrompt(prompt, inlineImages = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini] API key missing → mock result');
    return {
      imageUrl: 'https://via.placeholder.com/400x400.png?text=AI+Mockup',
      error: 'GEMINI_API_KEY not set',
    };
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    // Build parts: text + any inline images
    const parts = [{ text: prompt.trim() }];
    inlineImages.forEach(img => {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.data },
      });
    });

    const request = {
      model: MODEL_ID,
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '1:1' },
      },
      tools: [{ imageGeneration: {} }],
    };

    console.log('[Gemini] Request →', {
      hasImage: inlineImages.length > 0,
      promptPreview: prompt.slice(0, 160),
    });

    const result = await genAI.models.generateContent(request);
    const response = result?.response ?? result;

    // ---- Extract image from candidates ----
    const candidates = response?.candidates || [];
    for (const cand of candidates) {
      const candParts = cand?.content?.parts || [];
      for (const part of candParts) {
        if (part?.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            success: true,
          };
        }
      }
    }

    // Fallback to legacy response.parts
    if (response?.parts) {
      for (const part of response.parts) {
        if (part?.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            success: true,
          };
        }
      }
    }

    // No image → error
    console.warn('[Gemini] No image in response', response);
    return {
      imageUrl: 'https://via.placeholder.com/400x400.png?text=No+Image',
      error: 'Gemini returned no image',
    };
  } catch (err) {
    console.error('[Gemini] Error', err);
    return {
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Failed',
      error: err?.message || 'Generation failed',
    };
  }
}