import { AppState, DOM } from '../state.js';
import { StatusController } from './ui.js';

/**
 * API Endpoints for image generation
 */
const ENDPOINTS = {
  geminiFlash: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
  imagen4: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict',
  imagen4Fast: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict'
};

/**
 * Style prompts for image generation
 */
const IMAGE_STYLES = {
  modern: 'clean minimal design, geometric shapes, bold gradients, tech startup aesthetic',
  corporate: 'professional corporate logo, trustworthy, balanced, clean blue tones',
  playful: 'fun friendly design, rounded shapes, bright vibrant colors, approachable',
  minimal: 'ultra minimal, single color, iconic silhouette, memorable',
  tech: 'futuristic tech design, circuit patterns, neon accents, digital aesthetic',
  vintage: 'retro vintage style, classic typography, weathered texture, timeless'
};

/**
 * Build optimized prompt for logo/image generation
 */
function buildImagePrompt(userPrompt, options = {}) {
  const { style = 'modern', includeText = '' } = options;

  let prompt = `Professional logo design, vector art style, clean edges, high contrast,
suitable for business use, transparent-friendly design, minimalist yet distinctive.

SUBJECT: ${userPrompt}

STYLE: ${IMAGE_STYLES[style] || IMAGE_STYLES.modern}`;

  if (includeText) {
    prompt += `\n\nINCLUDE TEXT: "${includeText}" - make it legible, well-integrated with the design`;
  }

  prompt += '\n\nQuality: 4K resolution, crisp edges, professional quality, centered composition';

  return prompt;
}

/**
 * Generate image using Gemini Flash (free tier)
 */
async function generateWithGemini(prompt, apiKey) {
  const response = await fetch(`${ENDPOINTS.geminiFlash}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['image', 'text'],
        imageMimeType: 'image/png'
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${error}`);
  }

  const data = await response.json();

  // Extract image from response
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png'
        };
      }
    }
  }

  // Check for text response (error message)
  const textPart = data.candidates?.[0]?.content?.parts?.find(p => p.text);
  if (textPart) {
    throw new Error(textPart.text.substring(0, 200));
  }

  throw new Error('No image in response');
}

/**
 * Generate image using Imagen 4 (paid, higher quality)
 */
async function generateWithImagen(prompt, apiKey, model = 'imagen4') {
  const endpoint = model === 'imagen4Fast' ? ENDPOINTS.imagen4Fast : ENDPOINTS.imagen4;

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1'
      }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new Error('Imagen not enabled for this API key. Using Gemini Flash instead.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Try again in a moment.');
    }

    throw new Error(`Imagen API error: ${response.status}`);
  }

  const data = await response.json();
  const predictions = data.predictions || [];

  if (predictions.length === 0) {
    throw new Error('No images generated');
  }

  return {
    base64: predictions[0].bytesBase64Encoded,
    mimeType: 'image/png'
  };
}

/**
 * Current generated image data
 */
let currentImage = null;

/**
 * Image Generation Controller
 */
export const ImageGenController = {
  generating: false,

  async handle() {
    const prompt = DOM.imagePrompt?.value?.trim();
    const style = DOM.imageStyle?.value || 'modern';
    const model = DOM.imageModel?.value || 'gemini';
    const includeText = DOM.imageText?.value?.trim() || '';

    if (!prompt) {
      StatusController.show('Please describe the image you want', 'error');
      return;
    }

    if (!AppState.apiKey) {
      StatusController.show('Please add your API key first', 'error');
      return;
    }

    if (this.generating) {
      StatusController.show('Generation in progress...', 'info');
      return;
    }

    this.generating = true;
    DOM.imageGenBtn.disabled = true;
    DOM.imageGenBtn.textContent = '生成中...';

    try {
      const fullPrompt = buildImagePrompt(prompt, { style, includeText });
      console.log('Generating image with:', model);

      let result;

      if (model === 'gemini') {
        result = await generateWithGemini(fullPrompt, AppState.apiKey);
      } else {
        try {
          result = await generateWithImagen(fullPrompt, AppState.apiKey, model);
        } catch (imagenError) {
          console.warn('Imagen failed, falling back to Gemini:', imagenError.message);
          StatusController.show('Imagen unavailable, using Gemini Flash', 'info');
          result = await generateWithGemini(fullPrompt, AppState.apiKey);
        }
      }

      // Store and display the image
      currentImage = result;
      const dataUrl = `data:${result.mimeType};base64,${result.base64}`;

      DOM.generatedImage.src = dataUrl;
      DOM.imagePreview.style.display = 'block';
      DOM.previewArea.style.display = 'none';
      DOM.downloadImageBtn.disabled = false;

      StatusController.show('Image generated!', 'success');

    } catch (error) {
      console.error('Image generation error:', error);
      StatusController.show(error.message || 'Failed to generate image', 'error');
    } finally {
      this.generating = false;
      DOM.imageGenBtn.disabled = false;
      DOM.imageGenBtn.textContent = '生成 Generate Image';
    }
  },

  download() {
    if (!currentImage) {
      StatusController.show('No image to download', 'error');
      return;
    }

    const dataUrl = `data:${currentImage.mimeType};base64,${currentImage.base64}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'generated-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    StatusController.show('Image downloaded!', 'success');
  }
};
