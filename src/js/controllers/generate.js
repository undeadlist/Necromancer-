import { DOM } from '../state.js';
import { InputValidator } from '../utils.js';
import { GeminiAPI } from '../api.js';
import { StatusController, PreviewController } from './ui.js';

/**
 * Generate controller - handles SVG generation via AI
 */
export const GenerateController = {
  async handle() {
    const prompt = DOM.promptInput.value.trim();

    if (!InputValidator.validatePrompt(prompt)) {
      StatusController.show('Please enter a description', 'error');
      return;
    }

    DOM.generateBtn.disabled = true;
    DOM.generateBtn.textContent = '降霊中...';

    const systemPrompt = `You are an expert SVG designer creating professional vector graphics.

DESIGN PRINCIPLES:
- Create visually appealing, detailed, and polished graphics
- Use appropriate complexity for the request (logos need detail, simple icons can be minimal)
- Apply good design principles: balance, contrast, visual hierarchy
- Match the mood and theme of the request (dark/mystical for horror, bright/friendly for playful, etc.)
- Use gradients, shadows, and layering when they enhance the design
- Create distinctive, memorable visuals - not generic clip art

TECHNICAL REQUIREMENTS:
- Return ONLY valid SVG code, no explanation, no markdown
- Use viewBox for scalability (typically viewBox="0 0 100 100" or appropriate aspect ratio)
- Include width="200" height="200" attributes
- Use meaningful colors that fit the theme
- Ensure paths are smooth and well-crafted

For logos and icons: Create something distinctive with good use of negative space and recognizable silhouette.
For illustrations: Add appropriate detail, shading, and visual interest.`;

    const result = await GeminiAPI.call(prompt, systemPrompt);

    if (result) {
      DOM.svgEditor.value = result;
      PreviewController.update();
    }

    DOM.generateBtn.disabled = false;
    DOM.generateBtn.textContent = '召喚 Generate';
  }
};
