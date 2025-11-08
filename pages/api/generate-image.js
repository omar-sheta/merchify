// pages/api/generate-merch.js
import { generateImageFromPrompt } from '../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { capturedFrame, product, color, prompt } = req.body ?? {};

  if (!capturedFrame || typeof capturedFrame !== 'string') {
    return res.status(400).json({ error: 'Missing captured frame' });
  }

  try {
    const productName = (product?.name ?? 't-shirt').toLowerCase();
    const colorName   = (color?.name ?? 'white').toLowerCase();
    const userEdit    = (prompt ?? '').trim();

    // Extract clean base64
    const mimeMatch = capturedFrame.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const base64 = mimeMatch ? mimeMatch[2] : capturedFrame.replace(/\s+/g, '');

    // --------------------------------------------------------------
    // SINGLE PROMPT: Apply user edit to design + print on merch
    // --------------------------------------------------------------
    const textPrompt = `
Create a **photorealistic, studio-quality e-commerce product photo** of a **${colorName} ${productName}** on an invisible mannequin.

**PRINTED DESIGN:**
- Use the **exact image provided** as the base design.
- **Apply this edit to the design before printing:** "${userEdit || 'keep original'}"
  - If style (e.g., "anime", "cartoon"): convert the design fully.
  - If color (e.g., "red tones"): recolor the design.
  - If effect (e.g., "add sparkles"): apply it.
  - If empty: keep original.
- The **edited design must follow every fabric fold, wrinkle, and contour**.
- Apply **realistic textile printing**: ink absorption, micro-texture, subtle color shift to match fabric.
- Edges **fade naturally into seams** — **no hard rectangle**.
- On dark shirts: slightly desaturate and darken the print.

**LIGHTING & COMPOSITION:**
- Soft, diffused key light from 45° above.
- Clean neutral background (white or light gray).
- Slight depth-of-field blur.
- Resolution: 2048×2048, ultra-sharp, commercial grade.

**NO ARTIFACTS:** no watermarks, no placeholder text, no visible seams from pasting.`;

    console.log('[Merch API] User edit:', userEdit || '(none)');
    console.log('[Merch API] Prompt (150 chars):', textPrompt.slice(0, 150) + '...');

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