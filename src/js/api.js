import { CONFIG } from './config.js';
import { AppState } from './state.js';
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
            maxOutputTokens: 4096
          }
        }),
        signal: this.currentController.signal
      });

      const data = await response.json();

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
      }

      const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);

      if (svgMatch) {
        StatusController.show('復活！ Revived!', 'success');
        return svgMatch[0];
      } else {
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
