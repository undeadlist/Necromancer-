import { CONFIG } from './config.js';
import { AppState } from './state.js';
import { Utils } from './utils.js';
import { StatusController, ModalController } from './controllers/ui.js';
import { ApiKeyController } from './controllers/api-key.js';

/**
 * Gemini API client with rate limiting and request cancellation
 */
export const GeminiAPI = {
  lastRequestTime: 0,
  minRequestInterval: 2000,
  currentController: null,

  async call(prompt, systemPrompt) {
    console.log('[GeminiAPI] call() - checking AppState.apiKey:', AppState.apiKey ? 'exists' : 'NULL');
    if (!AppState.apiKey) {
      console.log('[GeminiAPI] call() - NO API KEY, opening modal');
      StatusController.show('Please add your Gemini API key first', 'error');
      ModalController.open('keyModal');
      return null;
    }
    console.log('[GeminiAPI] call() - API key exists, proceeding with request');

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      StatusController.show('Please wait before making another request', 'error');
      return null;
    }

    // Cancel any pending request
    if (this.currentController) {
      this.currentController.abort();
    }
    this.currentController = new AbortController();
    this.lastRequestTime = now;

    StatusController.showLoading('降霊中... Summoning...');

    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': AppState.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 65536
          }
        }),
        signal: this.currentController.signal
      });

      const data = await response.json();
      console.log('RAW GEMINI RESPONSE:', JSON.stringify(data, null, 2));

      if (data.error) {
        console.error('[GeminiAPI] API Error:', data.error.code, data.error.message, data.error);
        if (data.error.code === 401 || data.error.code === 403) {
          // Don't clear key on 403 - could be quota/permissions, not invalid key
          StatusController.show(`API Error: ${data.error.message}`, 'error');
          if (data.error.code === 401) {
            // Only clear on 401 (truly invalid key)
            ApiKeyController.clear();
            ModalController.open('keyModal');
          }
          return null;
        }
        throw new Error(data.error.message);
      }

      let text = '';
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = data.candidates[0].content.parts[0].text;
        console.log('RAW GEMINI TEXT:', text);
      }

      // Check for truncation and attempt recovery
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        console.warn('Response truncated due to MAX_TOKENS');
        // Attempt to recover by closing the SVG
        if (text.includes('<svg') && !text.includes('</svg>')) {
          text = text + '</svg>';
          console.log('Auto-closed truncated SVG');
        }
      }

      const svg = Utils.extractSVG(text);

      if (svg) {
        StatusController.show('復活！ Revived!', 'success');
        return svg;
      } else {
        console.error('No valid SVG in response:', text);
        StatusController.show('No SVG found in response', 'error');
        return null;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return null;
      }
      StatusController.show(`Error: ${error.message}`, 'error');
      return null;
    } finally {
      this.currentController = null;
    }
  }
};
