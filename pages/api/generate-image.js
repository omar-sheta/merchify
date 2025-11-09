// pages/api/generate-image.js
import { generateImageFromPrompt } from '../../lib/gemini';
import { generateImageWithOpenAI } from '../../lib/openai';
import fs from 'fs';
import path from 'path';

/* ----------------------------- Color Mapping ----------------------------- */
const COLORS = {
  // UI color choices (matching customize.js)
  'white': '#FFFFFF',
  'black': '#212121',
  'navy': '#1E3A8A',
  'red': '#DC2626',
  // Additional descriptive color names
  'nano banana': '#FFE135',
  'banana': '#FFE135',
  'midnight sky': '#0A2540',
  'forest mist': '#A8DADC',
  'cream': '#F5F1E6',
  'ash': '#D6D6D6',
  'charcoal': '#333333',
  'blue': '#0000FF',
};

function getColorHex(colorName = 'white') {
  const key = String(colorName || '').trim().toLowerCase();
  return COLORS[key] || '#FFFFFF';
}

/* --------------------------- Product Mapping -------------------------- */
const PRODUCT_CONFIG = {
  'hoodie': { type: 'hoodie', folder: 'hoodie', prefix: 'hoodie', aspect: '1:1' },
  't-shirt': { type: 't-shirt', folder: 'tshirt', prefix: 'tshirt', aspect: '1:1' },
  'poster': { type: 'poster', folder: 'poster', prefix: 'poster', aspect: '3:4' },
  'mug': { type: 'mug', folder: 'cup', prefix: 'cup', aspect: '4:3' },
};

function getProductConfig(name) {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('hoodie')) return PRODUCT_CONFIG['hoodie'];
  if (n.includes('poster')) return PRODUCT_CONFIG['poster'];
  if (n.includes('cup') || n.includes('mug')) return PRODUCT_CONFIG['mug'];
  return PRODUCT_CONFIG['t-shirt'];
}

function getColorVariant(colorName = 'white') {
  const raw = String(colorName || '').toLowerCase().trim();
  // Direct mapping for UI color choices
  if (raw === 'black') return 'black';
  if (raw === 'navy') return 'navy';
  if (raw === 'red') return 'red';
  if (raw === 'white') return 'white';
  
  // Fallback: search for keywords in case color name is descriptive
  if (raw.includes('black') || raw.includes('charcoal')) return 'black';
  if (raw.includes('navy') || raw.includes('midnight')) return 'navy';
  if (raw.includes('red')) return 'red';
  
  // Default to white for unknown or light colors
  return 'white';
}

/* ----------------------------- Optimized Prompt Builder ---------------------------- */
function buildPrompt(productType, colorHex, userPrompt) {
  const hasCustomPrompt = userPrompt && userPrompt.trim().length > 0;
  const presenterRule = `\n**PRESERVE PEOPLE AND CAPTION**\n- Do NOT remove, crop out, or replace any people or caption in Image 1 unless the user's instruction explicitly says to do so.\n- By default, keep all people and caption visible and intact in the final design.\n- If the user's instruction explicitly says "caption only" or "remove people", then follow that; otherwise, always keep both people and caption.`;
  
  // Simplified, focused prompt for better reliability
  if (productType === 't-shirt' || productType === 'hoodie') {
  return (`Create a photorealistic product mockup: Take Image 1 (the design) ${hasCustomPrompt ? `and apply this style: "${userPrompt}". Then c` : 'and c'}omposite it onto Image 2 (the ${productType} template).

CRITICAL REQUIREMENTS:
1. Use Image 2 exactly as provided - do NOT change its color, it's already the correct color
2. Place the design from Image 1 centered on the chest area
3. Make the print look realistic - it should follow fabric contours naturally like DTG printing
4. Keep metal details (zippers, eyelets) in their original metallic finish
5. Studio lighting: soft, professional, no harsh shadows
6. Clean background, single product shot only

Output: One complete, photorealistic e-commerce product image.` + presenterRule);
  }
  
  if (productType === 'poster') {
  return (`Create a photorealistic product mockup: Take Image 1 (the design) ${hasCustomPrompt ? `and apply this style: "${userPrompt}". Then c` : 'and c'}omposite it onto Image 2 (the poster template).

CRITICAL REQUIREMENTS:
1. Use Image 2 exactly as provided - do NOT change the frame/border color, it's already correct
2. Place design from Image 1 as the central artwork on the poster
3. Flat, crisp presentation with subtle paper texture
4. Gallery-style lighting, no glare
5. Clean wall background

Output: One complete poster product image in portrait orientation.` + presenterRule);
  }
  
  if (productType === 'mug') {
  return (`Create a photorealistic product mockup: Take Image 1 (the design) ${hasCustomPrompt ? `and apply this style: "${userPrompt}". Then c` : 'and c'}omposite it onto Image 2 (the mug template).

CRITICAL REQUIREMENTS:
1. Use Image 2 exactly as provided - do NOT change its color, it's already the correct color
2. Wrap design from Image 1 around the visible mug surface naturally
3. Maintain ceramic glaze reflections and highlights
4. Professional product photography lighting
5. Clean background with subtle shadow

Output: One complete mug product image.` + presenterRule);
  }
  
  return (`Create a photorealistic ${productType} mockup with design from Image 1 on template Image 2. Use Image 2 as-is without color changes.` + presenterRule);
}

/* --------------------------------- API Handler -------------------------------- */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    capturedFrame,
    product,
    color,
    prompt: userPrompt,
    provider = 'gemini', // Default to Gemini
  } = req.body ?? {};

  // Validation
  if (!capturedFrame || typeof capturedFrame !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid captured frame' });
  }

  try {
    // Extract product info
    const productName = (product?.name ?? 't-shirt').toLowerCase().trim();
    const colorName = (color?.name ?? 'white').toLowerCase().trim();
    const config = getProductConfig(productName);
    const colorHex = getColorHex(colorName);

    console.log('[Merch API] Generating:', {
      product: config.type,
      color: colorName,
      hex: colorHex,
      hasPrompt: !!(userPrompt && userPrompt.trim()),
      provider,
    });

    // Parse frame image
    const frameMatch = capturedFrame.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    const frameMime = frameMatch ? frameMatch[1] : 'image/png';
    const frameBase64 = frameMatch ? frameMatch[2] : capturedFrame.replace(/\s+/g, '');

    // Build images array: [frame, template]
    const images = [{ mimeType: frameMime, data: frameBase64 }];
    
    // Determine template variant based on color and load template when available
    const variant = getColorVariant(colorName);
    let templateLoaded = false;
    let templateRelativePath = null;
    
    console.log('[Merch API] Color mapping:', {
      requested: colorName,
      variant,
      hex: colorHex,
    });
    
    if (provider === 'gemini' && config.folder && config.prefix) {
      try {
        templateRelativePath = path.join(config.folder, `${config.prefix}-${variant}.png`);
        const templatePath = path.join(process.cwd(), 'public', 'images', templateRelativePath);
        if (fs.existsSync(templatePath)) {
          const templateData = fs.readFileSync(templatePath, 'base64');
          images.push({ mimeType: 'image/png', data: templateData });
          templateLoaded = true;
          console.log('[Merch API] Template loaded:', templateRelativePath);
        } else {
          console.warn('[Merch API] Template not found:', templatePath);
        }
      } catch (err) {
        console.error('[Merch API] Template load error:', err.message);
      }
    }

    // Build prompt
    const finalPrompt = buildPrompt(config.type, colorHex, userPrompt?.trim() || '');
    console.log('[Merch API] Prompt length:', finalPrompt.length, 'chars');

    // Generate with retries
    let result = null;
    const maxAttempts = 2;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[Merch API] Attempt ${attempt}/${maxAttempts}`);
      
      if (provider === 'gemini') {
        // Use template if loaded, otherwise just the frame
        const imagesToSend = templateLoaded ? images : [images[0]];
        result = await generateImageFromPrompt(finalPrompt, imagesToSend, { 
          aspectRatio: config.aspect 
        });
      } else {
        // OpenAI fallback (no template support)
        const openaiSize = config.aspect === '3:4' ? '1024x1792' : 
                          config.aspect === '4:3' ? '1792x1024' : '1024x1024';
        result = await generateImageWithOpenAI(
          finalPrompt,
          [],
          'dall-e-3',
          openaiSize,
          { quality: 'hd', style: 'vivid' }
        );
      }

      if (result?.success && result?.imageUrl) {
        console.log('[Merch API] ✓ Success on attempt', attempt);
        return res.status(200).json({
          success: true,
          imageUrl: result.imageUrl,
          metadata: {
            product: config.type,
            color: colorName,
            colorVariant: variant,
            template: templateRelativePath,
            provider,
            attempt,
          }
        });
      }

      console.warn(`[Merch API] Attempt ${attempt} failed:`, result?.error || 'No image');
      
      // Wait before retry
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // All attempts failed
    throw new Error(result?.error || 'Failed to generate image after retries');

  } catch (err) {
    console.error('[Merch API] FATAL:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Generation failed',
      imageUrl: 'https://via.placeholder.com/1024x1024.png?text=Error',
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};