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

  optimize(svg) {
    return svg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*\/>/g, '/>')
      .trim();
  }
};
