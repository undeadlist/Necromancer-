import { ANIMATIONS } from '../config.js';
import { DOM } from '../state.js';
import { GeminiAPI } from '../api.js';
import { StatusController, PreviewController } from './ui.js';

/**
 * Animate controller - adds CSS animations to SVGs via AI
 */
export const AnimateController = {
  async handle() {
    const svgCode = DOM.svgEditor.value.trim();
    const animationType = DOM.animationType.value;

    if (!svgCode) {
      StatusController.show('Please add SVG code first', 'error');
      return;
    }

    if (!animationType) {
      StatusController.show('Please select an animation type', 'error');
      return;
    }

    DOM.animateBtn.disabled = true;
    DOM.animateBtn.textContent = '動作中...';

    const animationDesc = ANIMATIONS[animationType];
    const systemPrompt = `You are an SVG animation specialist. ${animationDesc}
Use CSS animations inside a <style> tag within the SVG.
Make sure the animation loops infinitely.
Keep the animation smooth and performant.
Ensure the animation works standalone without external CSS.
Return ONLY the animated SVG code, no explanation, no markdown.`;

    const result = await GeminiAPI.call(`Add animation to this SVG:\n${svgCode}`, systemPrompt);

    if (result) {
      DOM.svgEditor.value = result;
      PreviewController.update();
    }

    DOM.animateBtn.disabled = false;
    DOM.animateBtn.textContent = '🎬 Apply Animation';
  }
};
