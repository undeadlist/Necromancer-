import { DOM } from '../state.js';
import { GeminiAPI } from '../api.js';
import { StatusController, PreviewController } from './ui.js';

/**
 * Fix controller - repairs broken SVG code via AI
 */
export const FixController = {
  async handle() {
    const svgCode = DOM.svgEditor.value.trim();

    if (!svgCode) {
      StatusController.show('Please paste SVG code to fix', 'error');
      return;
    }

    DOM.fixBtn.disabled = true;
    DOM.fixBtn.textContent = '修復中...';

    const systemPrompt = `You are an SVG repair specialist. Fix the provided SVG code:
- Fix syntax errors
- Close unclosed tags
- Fix malformed attributes
- Ensure valid SVG structure
- Add missing xmlns if needed
- Add viewBox if missing
Return ONLY the fixed SVG code, no explanation, no markdown.`;

    const result = await GeminiAPI.call(`Fix this SVG:\n${svgCode}`, systemPrompt);

    if (result) {
      DOM.svgEditor.value = result;
      PreviewController.update();
    }

    DOM.fixBtn.disabled = false;
    DOM.fixBtn.textContent = '🩹 修復 Fix SVG';
  }
};
