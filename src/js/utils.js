import { CONFIG } from './config.js';

/**
 * General utility functions
 */
export const Utils = {
  debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  extractSVG(text) {
    if (!text) return null;
    // Strip markdown code blocks (```svg, ```xml, ```html, ```)
    let cleaned = text.replace(/```(?:svg|xml|html)?\n?/gi, '').replace(/```/g, '').trim();

    // Use indexOf-based extraction for robustness (fixes greedy regex issues)
    const svgStart = cleaned.indexOf('<svg');
    const svgEnd = cleaned.lastIndexOf('</svg>');

    if (svgStart !== -1 && svgEnd !== -1) {
      return cleaned.substring(svgStart, svgEnd + 6);
    }
    return null;
  }
};

/**
 * SVG Sanitizer - Security module to prevent XSS
 */
export const SVGSanitizer = {
  dangerousElements: ['script', 'foreignObject'],
  dangerousAttributes: [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
    'onmousedown', 'onmouseup', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onreset', 'onselect', 'onabort', 'ondblclick',
    'onkeydown', 'onkeypress', 'onkeyup', 'onmousemove',
    'onbegin', 'onend', 'onrepeat'
  ],

  sanitize(svgString) {
    if (!svgString || typeof svgString !== 'string') return null;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) return null;

      const svg = doc.querySelector('svg');
      if (!svg) return null;

      // Remove dangerous elements
      this.dangerousElements.forEach(tag => {
        svg.querySelectorAll(tag).forEach(el => el.remove());
      });

      // Remove dangerous attributes from all elements
      svg.querySelectorAll('*').forEach(el => {
        this.dangerousAttributes.forEach(attr => {
          el.removeAttribute(attr);
        });

        // Check href for javascript: and data: protocols
        ['href', 'xlink:href'].forEach(attrName => {
          const href = el.getAttribute(attrName);
          if (href) {
            const lowerHref = href.toLowerCase().trim();
            if (lowerHref.startsWith('javascript:') ||
                (lowerHref.startsWith('data:') && lowerHref.includes('script'))) {
              el.removeAttribute(attrName);
            }
          }
        });

        // Sanitize style for javascript: and expression()
        const style = el.getAttribute('style');
        if (style && /expression\s*\(|javascript:|behavior\s*:/i.test(style)) {
          el.removeAttribute('style');
        }
      });

      return new XMLSerializer().serializeToString(svg);
    } catch (e) {
      console.error('SVG sanitization error:', e);
      return null;
    }
  }
};

/**
 * Input validation utilities
 */
export const InputValidator = {
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') return false;
    if (prompt.length > CONFIG.MAX_PROMPT_LENGTH) return false;
    return prompt.trim().length > 0;
  },

  validateSvgCode(code) {
    if (!code || typeof code !== 'string') return false;
    if (code.length > CONFIG.MAX_SVG_LENGTH) return false;
    return /<svg[\s\S]*<\/svg>/i.test(code);
  },

  validateApiKey(key) {
    return key && typeof key === 'string' && key.startsWith('AIza') && key.length > 20;
  }
};
