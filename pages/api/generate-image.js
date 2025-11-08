// pages/api/generate-merch.js
import { generateImageFromPrompt } from '../../lib/gemini';
import { generateImageWithOpenAI } from '../../lib/openai';
import fs from 'fs'
import path from 'path'

// Small helper to normalize product into types we care about
function normalizeProductType(name) {
  const n = (name || '').toLowerCase();

  if (n.includes('hoodie')) return 'hoodie';
  if (n.includes('poster')) return 'poster';
  if (n.includes('cup') || n.includes('mug')) return 'mug';
  if (n.includes('t-shirt') || n.includes('tshirt') || n.includes('tee')) return 't-shirt';

  // default
  return 't-shirt';
}

function buildMerchPrompt({ productName, colorName, userEdit }) {
  const productType = normalizeProductType(productName);

  let baseProductBlock = '';
  let printBlock = '';
  let lightingBlock = '';
  let extraNotes = '';

  if (productType === 't-shirt' || productType === 'hoodie') {
    baseProductBlock = `
Create a **photorealistic, studio-quality e-commerce product photo** of a **${colorName} ${productName}** on an invisible mannequin or neatly arranged flat lay.`;
    printBlock = `
**PRINTED DESIGN (APPAREL):**
- Use the **exact image provided** as the base graphic.
- **Apply this edit to the design before printing:** "${userEdit || 'keep original'}"
  - If the edit describes a style (e.g., "anime", "cartoon"), convert the design fully into that style.
  - If the edit describes colors (e.g., "neon palette", "red tones"), recolor the design accordingly.
  - If the edit describes effects (e.g., "add sparkles", "comic halftone"), apply them to the design.
  - If the edit is empty, keep the original design as is.
- Place the design centered on the chest area.
- The print must **follow every fabric fold, wrinkle, and contour**.
- Use **realistic textile printing**: slight ink absorption, subtle texture, and soft edges.
- Edges should **blend naturally into seams** — absolutely **no hard rectangular edges** or stickers.
- On darker fabrics, slightly deepen and desaturate the print so it looks realistic.`;
    lightingBlock = `
**LIGHTING & COMPOSITION (APPAREL):**
- Soft, diffused key light from 45° above.
- Clean neutral background (white or light gray).
- Subtle floor shadow under the garment to ground it.
- Slight depth-of-field blur, but keep the product fully sharp.
- Center the product with room for cropping on all sides.`;
    extraNotes = `
**NO ARTIFACTS:**
- No watermarks, no logos, no placeholder text.
- No AI glitches, no floating prints, no clipping.`;
  } else if (productType === 'poster') {
    baseProductBlock = `
Create a **photorealistic, studio-quality product photo** of a **${colorName} poster** hanging on a wall or standing in a simple frame.`;
    printBlock = `
**PRINTED DESIGN (POSTER):**
- Use the **exact image provided** as the central artwork.
- **Apply this edit to the artwork before printing:** "${userEdit || 'keep original'}"
  - Style → convert entirely (e.g., "minimalist line art", "comic style").
  - Color → recolor palette.
  - Effects → add to the artwork.
- The artwork should be perfectly flat and sharp.
- Maintain crisp edges, no fabric folds or textile texture.
- Slight paper or print gloss is allowed, but no glare that hides the design.`;
    lightingBlock = `
**LIGHTING & COMPOSITION (POSTER):**
- Soft, even lighting across the poster.
- Neutral, modern background wall (white, light gray, or subtle interior).
- Slight shadow around the poster to show depth.
- Front-facing camera angle, minimal distortion.`;
    extraNotes = `
**NO ARTIFACTS:**
- No extra text, logos, or watermarks.
- No hands, no people unless explicitly implied.
- No mockup placeholders.`;
  } else {
    // mug / cup
    baseProductBlock = `
Create a **photorealistic, studio-quality product photo** of a **${colorName} ceramic mug** on a clean surface.`;
    printBlock = `
**PRINTED DESIGN (MUG/CUP):**
- Use the **exact image provided** as the main printed graphic.
- **Apply this edit to the design before printing:** "${userEdit || 'keep original'}"
  - Style edits → restyle the art.
  - Color edits → recolor palette.
  - Effect edits → apply to the graphic.
- Place the graphic on the side of the mug facing the camera.
- The design must **wrap naturally around the curved surface** of the mug.
- Respect reflections and highlights; the print should look integrated, not pasted.
- No hard rectangular bounding box; blend edges slightly with the mug surface.`;
    lightingBlock = `
**LIGHTING & COMPOSITION (MUG/CUP):**
- Soft studio lighting from 45° above.
- Neutral background (e.g., light gray or soft gradient).
- A subtle shadow on the surface under the mug.
- Focus on the mug with shallow depth of field for the background.`;
    extraNotes = `
**NO ARTIFACTS:**
- No watermarks, logos, or text overlays.
- No visible seams around the print.
- No double handles, distorted shapes, or extra mugs unless clearly intentional.`;
  }

  return `
${baseProductBlock}

${printBlock}

${lightingBlock}

${extraNotes}
`.trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    capturedFrame,
    product,
    color,
    prompt,
    provider = 'gemini',
    model = 'dall-e-3',
    size = '1024x1024',
  } = req.body ?? {};

  if (!capturedFrame || typeof capturedFrame !== 'string') {
    return res.status(400).json({ error: 'Missing captured frame' });
  }

  try {
  const productName = (product?.name ?? 't-shirt').toLowerCase();
  const colorName   = (color?.name ?? 'white').toLowerCase();
  const userEdit    = (prompt ?? '').trim();
  const productType = normalizeProductType(productName)

    // Extract clean base64
    const mimeMatch = capturedFrame.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const base64 = mimeMatch ? mimeMatch[2] : capturedFrame.replace(/\s+/g, '');

  // Build merch-specific prompt (hoodie / poster / cup / t-shirt)
  const textPrompt = buildMerchPrompt({ productName, colorName, userEdit });

    // Prepare images payload. Always include the captured frame first.
    const images = [{ mimeType: mime, data: base64 }]

    // Try to attach a local product template (hoodie / tshirt / cup / poster) so the model can composite
    try {
      const templateFiles = {
        'hoodie': { folder: 'hoodie', file: 'hoodie-white.png' },
        't-shirt': { folder: 'tshirt', file: 'tshirt-white.png' },
        'poster': { folder: 'poster', file: 'poster-white.png' },
        'mug': { folder: 'cup', file: 'cup-white.png' },
      }

      const tplInfo = templateFiles[productType]
      if (tplInfo) {
        const templatePath = path.join(process.cwd(), 'public', 'images', tplInfo.folder, tplInfo.file)
        if (fs.existsSync(templatePath)) {
          const tpl = fs.readFileSync(templatePath)
          images.push({ mimeType: 'image/png', data: tpl.toString('base64') })
        } else {
          console.warn('[Merch API] Template not found:', templatePath)
        }
      }
    } catch (e) {
      console.warn('[Merch API] Could not attach product template:', e.message)
    }

    // If we attached a template (e.g., hoodie) inform the model explicitly how to use the images
    let finalPrompt = textPrompt
    if (images.length > 1) {
      const tplName = productType === 't-shirt' ? 't-shirt template' : `${productType} template`
      finalPrompt += `\n\nATTN: You have been given two inline images. The FIRST is the design to print. The SECOND is a ${tplName} image. Composite the FIRST image onto the SECOND image as a realistic print on the product (follow fabric folds, curvature, shadows, and seams as applicable). Do NOT output a separated artwork — output a finished product photo. Remove any hard rectangular borders; blend edges naturally.`
    }

    // Choose an aspect ratio appropriate for the product/template so the model can output a compatible image
    const aspectMap = {
      hoodie: '1:1',       // square works fine for most apparel mockups
      't-shirt': '1:1',
      poster: '3:4',       // portrait poster
      mug: '4:3',          // slightly rectangular to allow wrap
    }
    const aspectRatio = aspectMap[productType] || '1:1'

    let result;
    if (provider === 'gemini') {
      // Primary attempt with full prompt and chosen aspect
      result = await generateImageFromPrompt(finalPrompt, images, { aspectRatio })

      // If Gemini returned no image, retry with a much shorter explicit prompt and alternate aspect ratios
      const needRetry = !result?.success && result?.error && /no image/i.test(String(result.error))
      if (needRetry || !result?.success) {
        console.warn('[Merch API] Gemini returned no image, retrying with simplified prompt/aspect...')

        const simplifiedPrompt = `Composite the FIRST inline image (design) onto the SECOND inline image (product template) as a photorealistic finished product photo. Center the design on the product and follow folds, curvature, and shadows. No watermarks, no text.`

        // Try a small set of fallback aspect ratios (poster may need 2:3 or 3:4 etc.)
        const fallbackAspects = [aspectRatio]
        if (productType === 'poster') fallbackAspects.push('2:3', '4:5')
        if (productType === 'mug') fallbackAspects.push('4:3', '3:2')
        if (productType === 't-shirt' || productType === 'hoodie') fallbackAspects.push('1:1')

        for (const asp of fallbackAspects) {
          try {
            const attempt = await generateImageFromPrompt(simplifiedPrompt, images, { aspectRatio: asp })
            if (attempt?.success) {
              result = attempt
              break
            }
          } catch (e) {
            console.warn('[Merch API] retry attempt failed:', e?.message)
          }
        }
      }
    } else {
      // For non-gemini providers, pass size through as before (model/size may control output dims)
      result = await generateImageWithOpenAI(
        finalPrompt,
        images,
        model,
        size,
        { quality: 'hd', style: 'vivid', aspectRatio }
      )
    }

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
