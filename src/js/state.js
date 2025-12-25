/**
 * Application state management
 */
export const AppState = {
  apiKey: null,
  currentTab: 'generate',
  convertedOutput: ''
};

/**
 * DOM element cache
 */
export const DOM = {};

/**
 * Initialize DOM element references
 */
export function initDOM() {
  DOM.apiKeyBtn = document.getElementById('apiKeyBtn');
  DOM.keyModal = document.getElementById('keyModal');
  DOM.apiKeyInput = document.getElementById('apiKeyInput');
  DOM.saveKeyBtn = document.getElementById('saveKeyBtn');
  DOM.clearKeyBtn = document.getElementById('clearKeyBtn');
  DOM.cancelKeyBtn = document.getElementById('cancelKeyBtn');
  DOM.modalClose = DOM.keyModal.querySelector('.modal-close');
  DOM.statusBar = document.getElementById('statusBar');
  DOM.svgEditor = document.getElementById('svgEditor');
  DOM.previewArea = document.getElementById('previewArea');
  DOM.promptInput = document.getElementById('promptInput');
  DOM.styleSelect = document.getElementById('styleSelect');
  DOM.textOverlay = document.getElementById('textOverlay');
  DOM.generateBtn = document.getElementById('generateBtn');
  DOM.fixBtn = document.getElementById('fixBtn');
  DOM.animationType = document.getElementById('animationType');
  DOM.animateBtn = document.getElementById('animateBtn');
  DOM.convertFormat = document.getElementById('convertFormat');
  DOM.convertBtn = document.getElementById('convertBtn');
  DOM.convertedOutput = document.getElementById('convertedOutput');
  DOM.convertedCode = document.getElementById('convertedCode');
  DOM.copyConvertedBtn = document.getElementById('copyConvertedBtn');
  DOM.copyCodeBtn = document.getElementById('copyCodeBtn');
  DOM.clearCodeBtn = document.getElementById('clearCodeBtn');
  DOM.downloadSvgBtn = document.getElementById('downloadSvgBtn');
  DOM.downloadPngBtn = document.getElementById('downloadPngBtn');

  // Image tab elements
  DOM.imagePrompt = document.getElementById('imagePrompt');
  DOM.imageStyle = document.getElementById('imageStyle');
  DOM.imageModel = document.getElementById('imageModel');
  DOM.imageText = document.getElementById('imageText');
  DOM.imageGenBtn = document.getElementById('imageGenBtn');
  DOM.imagePreview = document.getElementById('imagePreview');
  DOM.generatedImage = document.getElementById('generatedImage');
  DOM.downloadImageBtn = document.getElementById('downloadImageBtn');

  DOM.tabs = document.querySelectorAll('.tab');
  DOM.panels = document.querySelectorAll('.tab-panel');
}
