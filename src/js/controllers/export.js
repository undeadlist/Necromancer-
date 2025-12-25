import { DOM } from '../state.js';
import { StatusController } from './ui.js';

/**
 * Export controller - handles SVG and PNG downloads
 */
export const ExportController = {
  downloadSVG() {
    const svgCode = DOM.svgEditor.value;
    if (!svgCode) {
      StatusController.show('No SVG to download', 'error');
      return;
    }

    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'necromancer-export.svg';
    a.click();
    URL.revokeObjectURL(url);
    StatusController.show('SVG downloaded!', 'success');
  },

  downloadPNG() {
    const svgCode = DOM.svgEditor.value;
    if (!svgCode) {
      StatusController.show('No SVG to download', 'error');
      return;
    }

    const svg = DOM.previewArea.querySelector('svg');
    if (!svg) {
      StatusController.show('Invalid SVG for PNG export', 'error');
      return;
    }

    // Get dimensions
    const viewBox = svg.getAttribute('viewBox');
    let width = 512, height = 512;

    if (viewBox) {
      const parts = viewBox.split(/\s+/);
      if (parts.length >= 4) {
        width = parseFloat(parts[2]) || 512;
        height = parseFloat(parts[3]) || 512;
      }
    }

    const svgWidth = svg.getAttribute('width');
    const svgHeight = svg.getAttribute('height');
    if (svgWidth && !svgWidth.includes('%')) width = parseFloat(svgWidth) || width;
    if (svgHeight && !svgHeight.includes('%')) height = parseFloat(svgHeight) || height;

    // Create high-res canvas
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const img = new Image();
    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'necromancer-export.png';
        a.click();
        URL.revokeObjectURL(url);
        StatusController.show('PNG downloaded!', 'success');
      }, 'image/png');
    };

    img.onerror = () => {
      StatusController.show('Could not render PNG', 'error');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }
};
