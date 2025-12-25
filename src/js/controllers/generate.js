import { STYLES } from '../config.js';
import { DOM } from '../state.js';
import { InputValidator } from '../utils.js';
import { GeminiAPI } from '../api.js';
import { StatusController, PreviewController } from './ui.js';

/**
 * Score SVG quality based on professional techniques used
 */
function scoreSVG(svg) {
  const checks = {
    hasGradient: /<(linear|radial)Gradient/i.test(svg),
    hasFilter: /<filter/i.test(svg),
    hasCurves: /\s[CcQqSs]\s*[\d.-]+/.test(svg),
    hasLayers: (svg.match(/<(path|circle|rect|ellipse|polygon|g)\s/gi) || []).length >= 3,
    hasOpacity: /opacity\s*[:=]\s*["']?0\.[3-9]/i.test(svg),
    goodColors: !/#(FF0000|00FF00|0000FF|000000|FFFFFF)[;"'\s]/i.test(svg)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const quality = score >= 5 ? 'excellent' : score >= 3 ? 'good' : 'basic';

  console.log('SVG Quality:', quality, `(${score}/6)`, checks);
  return { score, quality, checks };
}

/**
 * Generate controller - handles SVG generation via AI
 */
export const GenerateController = {
  async handle() {
    const prompt = DOM.promptInput.value.trim();
    const style = DOM.styleSelect?.value || 'modern';
    const textOverlay = DOM.textOverlay?.value?.trim() || '';

    if (!InputValidator.validatePrompt(prompt)) {
      StatusController.show('Please enter a description', 'error');
      return;
    }

    DOM.generateBtn.disabled = true;
    DOM.generateBtn.textContent = '降霊中...';

    // Build enhanced prompt with style and text
    let enhancedPrompt = prompt;

    if (STYLES[style]) {
      enhancedPrompt += `\n\nSTYLE: ${STYLES[style].prompt}`;
    }

    if (textOverlay) {
      enhancedPrompt += `\n\nINCLUDE TEXT: "${textOverlay}" - make it prominent, readable, and well-integrated with the design`;
    }

    const systemPrompt = `You are a world-class SVG artist creating premium vector graphics.

OUTPUT RULES (CRITICAL):
- Return ONLY the SVG code
- Start with <svg, end with </svg>
- NO markdown, NO backticks, NO explanation, NO prose
- MUST be valid XML

SVG STRUCTURE:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs><!-- gradients, filters here --></defs>
  <!-- artwork here -->
</svg>

MANDATORY TECHNIQUES (use ALL of these):

1. GRADIENTS - Every major shape uses gradient fills:
<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#667eea"/>
  <stop offset="100%" stop-color="#764ba2"/>
</linearGradient>

2. DEPTH - Include drop shadow filter:
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
  <feDropShadow dx="2" dy="3" stdDeviation="3" flood-opacity="0.3"/>
</filter>

3. LAYERING - Build depth with 3+ layers:
   - Background/ambient shapes (opacity 0.3-0.5)
   - Main subject
   - Highlights/accents on top

4. CURVES - Use bezier paths, not just rectangles:
   <path d="M10,50 C20,20 80,20 90,50 S80,80 50,80" />

5. COLOR PALETTE - Sophisticated colors:
   BAD: #FF0000, #00FF00, #0000FF (pure primaries)
   GOOD: #667eea, #f093fb, #4facfe, #00f2fe (modern gradients)

TEXT IN SVG (when requested):
<text x="100" y="170"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="24"
      font-weight="600"
      fill="url(#grad1)"
      text-anchor="middle">
  Your Text
</text>

QUALITY STANDARD:
- NOT clip art or basic shapes
- Professional, detailed, polished
- Would look good on a business card or app icon
- Gradients and shadows create premium feel`;

    const result = await GeminiAPI.call(enhancedPrompt, systemPrompt);

    if (result) {
      DOM.svgEditor.value = result;
      PreviewController.update();

      // Score and log quality
      const quality = scoreSVG(result);
      if (quality.score < 3) {
        console.warn('Low quality SVG generated. Consider regenerating.');
      }
    }

    DOM.generateBtn.disabled = false;
    DOM.generateBtn.textContent = '召喚 Generate';
  }
};
