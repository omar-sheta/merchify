// API endpoint for Nano Banana (Gemini) merchandise image generation
import { generateImageFromPrompt } from '../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { capturedFrame, product, color, prompt } = req.body ?? {};

  if (!capturedFrame || typeof capturedFrame !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid captured frame' });
  }

  try {
    const productName = (product?.name ?? 't-shirt').toLowerCase();
    const colorName = (color?.name ?? 'white').toLowerCase();
    const caption = (prompt ?? '').trim();

    const textPrompt = `
Photorealistic, studio-quality e-commerce product photo of a **${colorName} ${productName}** on an invisible mannequin.

**PRINTED DESIGN:**
- Use the **exact image provided** as the printed graphic, **centered** on the front.
- Design must **follow every fold, wrinkle, and contour** of the fabric.
- Apply **realistic textile printing**: ink absorption, subtle color shift to match fabric, micro-texture.
- Edges **fade naturally into seams** – **no hard rectangle**.
- On dark shirts: slightly desaturate and darken the print.

${caption ? `**CAPTION:** Add "${caption}" in bold sans-serif font **below** the image (white on dark shirts, black on light).` : ''}

**LIGHTING & COMPOSITION:**
- Soft, diffused key light from 45° above.
- Clean neutral background (white or light gray).
- Slight depth-of-field blur on background.
- Resolution: 2048×2048, ultra-sharp, commercial grade.

**NO ARTIFACTS:** no watermarks, no placeholder text, no visible seams from pasting.`;

    console.log('[Merch API] Prompt (150 chars):', textPrompt.slice(0, 150) + '...');

    const mimeMatch = capturedFrame.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const base64 = mimeMatch ? mimeMatch[2] : capturedFrame.replace(/\s+/g, '');

    const result = await generateImageFromPrompt(textPrompt, [
      { mimeType: mime, data: base64 },
    ]);

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Merch API] Error:', err);
    return res.status(500).json({
      error: err?.message || 'Generation failed',
      imageUrl: 'https://via.placeholder.com/600x600.png?text=Error',
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};