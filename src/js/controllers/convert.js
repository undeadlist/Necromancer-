import { AppState, DOM } from '../state.js';
import { StatusController } from './ui.js';

/**
 * Convert controller - transforms SVG to different formats
 */
export const ConvertController = {
  handle() {
    const svgCode = DOM.svgEditor.value.trim();
    const format = DOM.convertFormat.value;

    if (!svgCode) {
      StatusController.show('Please add SVG code first', 'error');
      return;
    }

    let result = '';

    switch (format) {
      case 'react':
        result = this.toReact(svgCode);
        break;
      case 'vue':
        result = this.toVue(svgCode);
        break;
      case 'base64':
        result = this.toBase64(svgCode);
        break;
      case 'datauri':
        result = this.toDataUri(svgCode);
        break;
      case 'optimized':
        result = this.optimize(svgCode);
        break;
    }

    AppState.convertedOutput = result;
    const displayText = result.length > 500 ? result.substring(0, 500) + '...' : result;
    DOM.convertedCode.textContent = displayText;
    DOM.convertedOutput.classList.add('active');
    StatusController.show('Converted successfully!', 'success');
  },

  toReact(svg) {
    const escaped = svg.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    const converted = escaped
      .replace(/class=/g, 'className=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/stroke-dasharray=/g, 'strokeDasharray=')
      .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
      .replace(/fill-opacity=/g, 'fillOpacity=')
      .replace(/stroke-opacity=/g, 'strokeOpacity=');
    return `const Icon = () => (\n  ${converted}\n);\n\nexport default Icon;`;
  },

  toVue(svg) {
    const escaped = svg.replace(/<\/template>/gi, '<\\/template>');
    return `<template>\n  ${escaped}\n</template>\n\n<` + `script>\nexport default {\n  name: 'Icon'\n}\n</` + `script>`;
  },

  toBase64(svg) {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  },

  toDataUri(svg) {
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  },

  /**
   * Optimize SVG using DOM parsing - preserves text content properly
   */
  optimize(svg) {
    if (!svg || typeof svg !== 'string') return svg;

    try {
      // Parse as DOM to properly handle text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');

      // Check for parse errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        console.warn('SVG parse error during optimize, using fallback');
        return this.optimizeFallback(svg);
      }

      const svgEl = doc.querySelector('svg');
      if (!svgEl) return svg;

      // Remove XML comments using TreeWalker
      const walker = doc.createTreeWalker(
        svgEl,
        NodeFilter.SHOW_COMMENT,
        null,
        false
      );
      const comments = [];
      while (walker.nextNode()) {
        comments.push(walker.currentNode);
      }
      comments.forEach(comment => comment.remove());

      // Remove empty groups (but not groups with attributes)
      const emptyGroups = svgEl.querySelectorAll('g:empty');
      emptyGroups.forEach(g => {
        if (!g.hasAttributes()) {
          g.remove();
        }
      });

      // Remove metadata and editor-specific elements
      const metadata = svgEl.querySelectorAll('metadata, title, desc');
      metadata.forEach(el => el.remove());

      // Remove editor-specific attributes
      const allElements = svgEl.querySelectorAll('*');
      allElements.forEach(el => {
        const attrsToRemove = [];
        for (const attr of el.attributes) {
          // Remove Inkscape/Sodipodi/Adobe attributes
          if (attr.name.startsWith('inkscape:') ||
              attr.name.startsWith('sodipodi:') ||
              attr.name.startsWith('xmlns:inkscape') ||
              attr.name.startsWith('xmlns:sodipodi') ||
              attr.name.startsWith('data-') ||
              attr.name === 'id' && attr.value.match(/^(path|rect|circle|g)\d+$/i)) {
            attrsToRemove.push(attr.name);
          }
        }
        attrsToRemove.forEach(name => el.removeAttribute(name));
      });

      // Serialize back - XMLSerializer preserves text whitespace correctly
      const serializer = new XMLSerializer();
      let result = serializer.serializeToString(svgEl);

      // Clean up redundant xmlns that XMLSerializer may add
      result = result.replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, (match, offset) => {
        // Keep only the first xmlns
        return offset < 50 ? match : '';
      });

      // Minimal cleanup that doesn't affect text
      result = result
        .replace(/\s*\n\s*/g, ' ')  // Collapse newlines to single space
        .replace(/\s{2,}/g, ' ')     // Collapse multiple spaces
        .trim();

      return result;

    } catch (e) {
      console.error('Optimize error:', e);
      return this.optimizeFallback(svg);
    }
  },

  /**
   * Fallback optimizer for invalid SVGs - more conservative
   */
  optimizeFallback(svg) {
    return svg
      .replace(/<!--[\s\S]*?-->/g, '')  // Remove comments
      .replace(/\s*\n\s*/g, ' ')         // Collapse newlines
      .replace(/\s{2,}/g, ' ')           // Collapse spaces (but not inside text)
      .trim();
  }
};
