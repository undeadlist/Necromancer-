import { DOM } from '../state.js';
import { GeminiAPI } from '../api.js';
import { StatusController, PreviewController } from './ui.js';

/**
 * Quick fixes that don't require AI - instant and reliable
 */
function quickFixes(svg) {
  if (!svg || typeof svg !== 'string') return { fixed: svg, changes: [] };

  let result = svg;
  const changes = [];

  // 1. Add missing xmlns
  if (result.includes('<svg') && !result.includes('xmlns=')) {
    result = result.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    changes.push('Added missing xmlns');
  }

  // 2. Add missing viewBox (default 200x200)
  if (result.includes('<svg') && !result.includes('viewBox')) {
    // Try to extract width/height for viewBox
    const widthMatch = result.match(/width=["']?(\d+)/);
    const heightMatch = result.match(/height=["']?(\d+)/);
    const w = widthMatch ? widthMatch[1] : '200';
    const h = heightMatch ? heightMatch[1] : '200';
    result = result.replace(/<svg([^>]*)>/, `<svg$1 viewBox="0 0 ${w} ${h}">`);
    changes.push('Added missing viewBox');
  }

  // 3. Fix unescaped ampersands (but not already escaped ones)
  const ampRegex = /&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g;
  if (ampRegex.test(result)) {
    result = result.replace(ampRegex, '&amp;');
    changes.push('Escaped ampersands');
  }

  // 4. Fix self-closing tags that aren't properly closed
  const selfClosing = ['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'use', 'image', 'stop'];
  selfClosing.forEach(tag => {
    // Match tags that end with > but not /> and have no closing tag
    const openTagRegex = new RegExp(`<${tag}([^>]*[^/])>(?![\\s\\S]*</${tag}>)`, 'gi');
    if (openTagRegex.test(result)) {
      result = result.replace(new RegExp(`<${tag}([^>]*[^/])>`, 'gi'), `<${tag}$1/>`);
      changes.push(`Fixed self-closing <${tag}>`);
    }
  });

  // 5. Fix missing closing </svg> tag
  if (result.includes('<svg') && !result.includes('</svg>')) {
    result = result.trim() + '\n</svg>';
    changes.push('Added missing </svg>');
  }

  // 6. Fix common typos
  result = result
    .replace(/xlink:href=/g, (match) => {
      if (!result.includes('xmlns:xlink')) {
        changes.push('Note: xlink:href used without xmlns:xlink declaration');
      }
      return match;
    })
    .replace(/fill-opacity=["']?(\d+)["']?/gi, (match, val) => {
      // Fix opacity values > 1
      if (parseInt(val) > 1) {
        changes.push('Fixed fill-opacity > 1');
        return `fill-opacity="${Math.min(parseInt(val) / 100, 1)}"`;
      }
      return match;
    });

  // 7. Ensure proper XML declaration handling (remove if present, SVG doesn't need it in browsers)
  if (result.startsWith('<?xml')) {
    result = result.replace(/<\?xml[^?]*\?>\s*/i, '');
    changes.push('Removed XML declaration');
  }

  return { fixed: result, changes };
}

/**
 * Validate if SVG appears to be valid
 */
function validateSVG(svg) {
  const checks = {
    hasSvgTag: /<svg[^>]*>/i.test(svg),
    hasClosingSvg: /<\/svg>/i.test(svg),
    hasXmlns: /xmlns=/i.test(svg),
    balancedTags: (svg.match(/<[a-z]/gi) || []).length > 0
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const parseError = doc.querySelector('parsererror');

  return {
    valid: !parseError && checks.hasSvgTag && checks.hasClosingSvg,
    checks,
    parseError: parseError ? parseError.textContent : null
  };
}

/**
 * Fix controller - repairs broken SVG code (quick fixes first, then AI)
 */
export const FixController = {
  // Try quick fixes first before using AI
  useQuickMode: true,

  async handle() {
    console.log('[FixController] handle() called');
    const svgCode = DOM.svgEditor.value.trim();
    console.log('[FixController] SVG code length:', svgCode.length);

    if (!svgCode) {
      console.log('[FixController] No SVG code, showing error');
      StatusController.show('Please paste SVG code to fix', 'error');
      return;
    }

    DOM.fixBtn.disabled = true;
    DOM.fixBtn.textContent = '修復中...';

    let result = null;

    // Try quick fixes first (instant, no API)
    if (this.useQuickMode) {
      const { fixed, changes } = quickFixes(svgCode);
      console.log('[FixController] Quick fixes check - changes:', changes.length);

      if (changes.length > 0) {
        console.log('[FixController] Quick fixes applied:', changes);

        // Validate the quick-fixed SVG
        const validation = validateSVG(fixed);

        if (validation.valid) {
          result = fixed;
          StatusController.show(`Fixed: ${changes.join(', ')}`, 'success');
        } else {
          console.log('[FixController] Quick fix insufficient, falling back to AI:', validation.parseError);
        }
      } else {
        // No quick fixes needed - check if SVG is already valid
        const validation = validateSVG(svgCode);
        if (validation.valid) {
          console.log('[FixController] SVG already valid, no fixes needed');
          StatusController.show('SVG looks good! No fixes needed.', 'success');
          DOM.fixBtn.disabled = false;
          DOM.fixBtn.textContent = '🩹 修復 Fix SVG';
          return;
        }
      }
    }

    // Fall back to AI if quick fixes weren't enough
    if (!result) {
      const systemPrompt = `You are an SVG repair specialist. Fix the provided SVG code:

COMMON ISSUES TO FIX:
- Syntax errors (unclosed tags, missing quotes)
- Missing xmlns="http://www.w3.org/2000/svg"
- Missing viewBox attribute
- Unescaped special characters (& < > " ')
- Invalid attribute values
- Malformed path data in d="" attributes
- Missing closing tags

RULES:
1. Return ONLY the fixed SVG code
2. Start with <svg, end with </svg>
3. NO markdown, NO backticks, NO explanation
4. Preserve all content and styling
5. Keep text elements intact`;

      result = await GeminiAPI.call(`Fix this broken SVG:\n${svgCode}`, systemPrompt);

      if (result) {
        // Apply quick fixes to AI result too (belt and suspenders)
        const { fixed } = quickFixes(result);
        result = fixed;
      }
    }

    if (result) {
      DOM.svgEditor.value = result;
      PreviewController.update();
      StatusController.show('SVG repaired!', 'success');
    }

    DOM.fixBtn.disabled = false;
    DOM.fixBtn.textContent = '🩹 修復 Fix SVG';
  }
};
