import OpenAI from "openai";

const MODEL_ID = "dall-e-3";

export async function generateImageWithOpenAI(
  prompt,
  inlineImages = [],
  model = MODEL_ID,
  size = "1024x1024",
  options = {}
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key") {
    console.warn("[OpenAI] API key missing → mock result");
    return {
      imageUrl: "https://via.placeholder.com/400x400.png?text=AI+Mockup",
      error: "OPENAI_API_KEY not set",
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    let img_b64;

    if (model === "dall-e-2") {
      // Placeholder for DALL·E 2 edit endpoint (not implemented)
      // You can add multipart/form-data logic here for inpainting
      throw new Error("DALL·E 2 edit not implemented");
    } else {
      const response = await client.images.generate({
        model,
        prompt,
        n: 1,
        size,
        response_format: "b64_json",
        // default merch-friendly settings for DALL·E 3
        ...(model === "dall-e-3"
          ? {
              quality: options.quality || "hd",
              style: options.style || "vivid",
            }
          : options),
      });

      img_b64 = response.data[0].b64_json;
    }

    return {
      imageUrl: `data:image/png;base64,${img_b64}`,
      success: true,
    };
  } catch (err) {
    console.error("[OpenAI] Error", err);
    return {
      imageUrl: "https://via.placeholder.com/400x400.png?text=Failed",
      error: err?.message || "Generation failed",
    };
  }
}
