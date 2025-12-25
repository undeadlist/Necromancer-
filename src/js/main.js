import { AppState, DOM, initDOM } from './state.js';
import { Utils } from './utils.js';
import { ModalController, StatusController, TabController, PreviewController, ClipboardController } from './controllers/ui.js';
import { ApiKeyController } from './controllers/api-key.js';
import { GenerateController } from './controllers/generate.js';
import { FixController } from './controllers/fix.js';
import { AnimateController } from './controllers/animate.js';
import { ConvertController } from './controllers/convert.js';
import { ExportController } from './controllers/export.js';
import { ImageGenController } from './controllers/imageGen.js';

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // API Key Modal
  DOM.apiKeyBtn.addEventListener('click', () => ModalController.open('keyModal'));
  DOM.modalClose.addEventListener('click', () => ModalController.close('keyModal'));
  DOM.cancelKeyBtn.addEventListener('click', () => ModalController.close('keyModal'));

  DOM.saveKeyBtn.addEventListener('click', () => {
    const key = DOM.apiKeyInput.value.trim();
    if (ApiKeyController.save(key)) {
      StatusController.show('API key saved!', 'success');
      ModalController.close('keyModal');
    } else {
      StatusController.show('Invalid API key format', 'error');
    }
  });

  DOM.clearKeyBtn.addEventListener('click', () => {
    ApiKeyController.clear();
    DOM.apiKeyInput.value = '';
    StatusController.show('API key cleared', 'info');
    ModalController.close('keyModal');
  });

  // Close modal on overlay click
  DOM.keyModal.addEventListener('click', (e) => {
    if (e.target === DOM.keyModal) {
      ModalController.close('keyModal');
    }
  });

  // Tab Navigation
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) {
      TabController.switch(tab.dataset.tab);
    }
  });

  document.querySelector('.tabs').addEventListener('keydown', (e) => {
    if (e.target.classList.contains('tab')) {
      TabController.handleKeydown(e);
    }
  });

  // Editor live preview (debounced)
  DOM.svgEditor.addEventListener('input', Utils.debounce(() => {
    PreviewController.update();
  }, 300));

  // Feature buttons
  DOM.generateBtn.addEventListener('click', () => GenerateController.handle());
  DOM.fixBtn.addEventListener('click', () => FixController.handle());
  DOM.animateBtn.addEventListener('click', () => AnimateController.handle());
  DOM.convertBtn.addEventListener('click', () => ConvertController.handle());

  // Copy/Clear buttons
  DOM.copyCodeBtn.addEventListener('click', () => {
    ClipboardController.copy(DOM.svgEditor.value, 'SVG code copied!');
  });

  DOM.clearCodeBtn.addEventListener('click', () => {
    DOM.svgEditor.value = '';
    PreviewController.update();
    DOM.convertedOutput.classList.remove('active');
  });

  DOM.copyConvertedBtn.addEventListener('click', () => {
    ClipboardController.copy(AppState.convertedOutput, 'Converted code copied!');
  });

  // Export buttons
  DOM.downloadSvgBtn.addEventListener('click', () => ExportController.downloadSVG());
  DOM.downloadPngBtn.addEventListener('click', () => ExportController.downloadPNG());

  // Image generation
  DOM.imageGenBtn?.addEventListener('click', () => ImageGenController.handle());
  DOM.downloadImageBtn?.addEventListener('click', () => ImageGenController.download());

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.keyModal.classList.contains('active')) {
      ModalController.close('keyModal');
    }
  });
}

/**
 * Initialize the application
 */
function init() {
  initDOM();
  ApiKeyController.load();
  setupEventListeners();
  TabController.switch('generate');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
