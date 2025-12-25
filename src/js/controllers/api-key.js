import { CONFIG } from '../config.js';
import { AppState, DOM } from '../state.js';
import { InputValidator } from '../utils.js';

/**
 * API Key controller - manages Gemini API key storage
 */
export const ApiKeyController = {
  load() {
    const key = localStorage.getItem(CONFIG.STORAGE_KEY);
    console.log('[ApiKey] load() - key:', key ? 'found' : 'not found');
    if (InputValidator.validateApiKey(key)) {
      AppState.apiKey = key;
      console.log('[ApiKey] load() - valid, AppState set');
      this.updateButton(true);
      return true;
    }
    console.log('[ApiKey] load() - invalid or missing');
    return false;
  },

  save(key) {
    console.log('[ApiKey] save() - validating...');
    if (InputValidator.validateApiKey(key)) {
      localStorage.setItem(CONFIG.STORAGE_KEY, key);
      AppState.apiKey = key;
      console.log('[ApiKey] save() - SUCCESS');
      this.updateButton(true);
      return true;
    }
    console.log('[ApiKey] save() - FAILED validation');
    return false;
  },

  clear() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    AppState.apiKey = null;
    this.updateButton(false);
  },

  updateButton(hasKey) {
    if (hasKey) {
      DOM.apiKeyBtn.textContent = '🔑 API Key Set';
      DOM.apiKeyBtn.className = 'key-btn set';
    } else {
      DOM.apiKeyBtn.textContent = '🔑 Add API Key';
      DOM.apiKeyBtn.className = 'key-btn empty';
    }
  }
};
