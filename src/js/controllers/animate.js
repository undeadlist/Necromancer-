import { ANIMATIONS } from '../config.js';
import { DOM } from '../state.js';
import { GeminiAPI } from '../api.js';
import { StatusController, PreviewController } from './ui.js';

/**
 * Quick CSS animations - no API call needed (fast & reliable)
 */
const QUICK_ANIMATIONS = {
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
    .animated { animation: pulse 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }`,

  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animated { animation: spin 3s linear infinite; transform-origin: center; transform-box: fill-box; }`,

  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animated { animation: bounce 0.6s ease-in-out infinite; }`,

  fade: `
    @keyframes fade {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animated { animation: fade 2s ease-in-out infinite; }`,

  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .animated { animation: float 3s ease-in-out infinite; }`,

  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
    .animated { animation: shake 0.4s ease-in-out infinite; }`,

  glow: `
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 3px currentColor); }
      50% { filter: drop-shadow(0 0 10px currentColor); }
    }
    .animated { animation: glow 2s ease-in-out infinite; }`,

  draw: `
    @keyframes draw {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
    }
    .animated { stroke-dasharray: 1000; animation: draw 2s ease-in-out forwards; }`
};

/**
 * Apply quick animation without API call
 */
function applyQuickAnimation(svg, type) {
  const animCSS = QUICK_ANIMATIONS[type];
  if (!animCSS) return null;

  // Wrap content in animated group
  let result = svg;

  // Check if SVG already has a style tag
  if (result.includes('<style>')) {
    // Inject into existing style
    result = result.replace('</style>', `${animCSS}\n</style>`);
  } else {
    // Add style after opening svg tag
    result = result.replace(/(<svg[^>]*>)/, `$1\n<style>${animCSS}</style>`);
  }

  // Wrap main content in animated group if not already wrapped
  if (!result.includes('class="animated"')) {
    // Find content after defs (or after svg if no defs)
    const defsMatch = result.match(/<defs[\s\S]*?<\/defs>/i);
    if (defsMatch) {
      // Has defs - wrap everything after defs
      const afterDefs = result.indexOf('</defs>') + 7;
      const beforeClose = result.lastIndexOf('</svg>');
      const content = result.substring(afterDefs, beforeClose);
      result = result.substring(0, afterDefs) +
               `\n<g class="animated">${content}</g>\n` +
               result.substring(beforeClose);
    } else {
      // No defs - wrap content after style
      result = result.replace(
        /(<style[\s\S]*?<\/style>)([\s\S]*)(<\/svg>)/i,
        `$1\n<g class="animated">$2</g>\n$3`
      );
    }
  }

  return result;
}

/**
 * Validate that animation was applied correctly
 */
function validateAnimation(svg) {
  const checks = {
    hasStyle: /<style[\s\S]*?<\/style>/i.test(svg),
    hasKeyframes: /@keyframes\s+\w+/i.test(svg),
    hasAnimation: /animation\s*:/i.test(svg)
  };

  return {
    valid: checks.hasStyle && checks.hasKeyframes && checks.hasAnimation,
    checks
  };
}

/**
 * Animate controller - adds CSS animations to SVGs
 */
export const AnimateController = {
  // Use quick mode by default (no API call)
  useQuickMode: true,

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

    let result;

    // Try quick animation first (instant, no API)
    if (this.useQuickMode && QUICK_ANIMATIONS[animationType]) {
      result = applyQuickAnimation(svgCode, animationType);
      if (result) {
        const validation = validateAnimation(result);
        console.log('Quick animation applied:', validation);
      }
    }

    // Fall back to AI if quick mode failed or disabled
    if (!result) {
      const animationDesc = typeof ANIMATIONS[animationType] === 'object'
        ? ANIMATIONS[animationType].description
        : ANIMATIONS[animationType];

      const systemPrompt = `You are an SVG animation expert. Add smooth CSS animation to this SVG.

ANIMATION TO ADD: ${animationDesc}

RULES (CRITICAL):
1. Add a <style> block INSIDE the <svg> element
2. Use @keyframes with descriptive name
3. Apply animation to elements using class="animated" or direct selectors
4. Use GPU-friendly properties: transform, opacity (NOT top/left/width/height)
5. Use ease-in-out or cubic-bezier for smooth motion
6. Set animation-iteration-count: infinite

IMPORTANT:
- transform-origin: center center; is REQUIRED for scale/rotate
- transform-box: fill-box; makes transform-origin work correctly
- Wrap elements in <g class="animated"> to animate as a group
- Keep existing gradients, filters, content intact

OUTPUT: Return ONLY the complete animated SVG. No markdown, no explanation.`;

      result = await GeminiAPI.call(`Add ${animationType} animation to this SVG:\n${svgCode}`, systemPrompt);
    }

    if (result) {
      DOM.svgEditor.value = result;
      PreviewController.update();
      StatusController.show('Animation applied!', 'success');
    }

    DOM.animateBtn.disabled = false;
    DOM.animateBtn.textContent = '🎬 Apply Animation';
  }
};
