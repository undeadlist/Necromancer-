import { CONFIG } from '../config.js';
import { AppState, DOM } from '../state.js';
import { SVGSanitizer } from '../utils.js';

/**
 * Modal controller - handles dialog open/close and focus management
 */
export const ModalController = {
  previousFocus: null,
  boundKeyHandler: null,

  open(modalId) {
    this.previousFocus = document.activeElement;
    const modal = document.getElementById(modalId);
    modal.classList.add('active');

    if (modalId === 'keyModal' && AppState.apiKey) {
      DOM.apiKeyInput.value = AppState.apiKey;
    }

    const firstFocusable = modal.querySelector('input, button:not(.modal-close)');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }

    this.boundKeyHandler = this.handleKeydown.bind(this, modal);
    modal.addEventListener('keydown', this.boundKeyHandler);
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    modal.removeEventListener('keydown', this.boundKeyHandler);

    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  },

  handleKeydown(modal, e) {
    if (e.key === 'Escape') {
      this.close(modal.id);
    }

    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
};

/**
 * Status bar controller - shows notifications and loading states
 */
export const StatusController = {
  timeout: null,

  show(message, type = 'info') {
    clearTimeout(this.timeout);
    DOM.statusBar.textContent = message;
    DOM.statusBar.className = `status-bar active ${type}`;

    if (type !== 'loading') {
      // Longer timeout for errors so users notice them (5s vs 3s)
      const timeout = type === 'error' ? 5000 : CONFIG.STATUS_TIMEOUT;
      this.timeout = setTimeout(() => this.clear(), timeout);
    }
  },

  showLoading(message) {
    clearTimeout(this.timeout);
    DOM.statusBar.textContent = '';
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    DOM.statusBar.appendChild(spinner);
    DOM.statusBar.appendChild(document.createTextNode(' ' + message));
    DOM.statusBar.className = 'status-bar active loading';
  },

  clear() {
    clearTimeout(this.timeout);
    DOM.statusBar.className = 'status-bar';
    DOM.statusBar.textContent = '';
  }
};

/**
 * Tab navigation controller
 */
export const TabController = {
  switch(tabId) {
    AppState.currentTab = tabId;

    DOM.tabs.forEach(tab => {
      const isSelected = tab.dataset.tab === tabId;
      tab.setAttribute('aria-selected', isSelected);
      tab.tabIndex = isSelected ? 0 : -1;
    });

    DOM.panels.forEach(panel => {
      const isActive = panel.id === `panel-${tabId}`;
      panel.classList.toggle('active', isActive);
    });

    const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedTab && document.activeElement?.classList.contains('tab')) {
      selectedTab.focus();
    }
  },

  handleKeydown(e) {
    const tabs = Array.from(DOM.tabs);
    const currentIndex = tabs.findIndex(t => t.dataset.tab === AppState.currentTab);

    let nextIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    tabs[nextIndex].focus();
    this.switch(tabs[nextIndex].dataset.tab);
  }
};

/**
 * Preview controller - updates SVG preview area
 */
export const PreviewController = {
  update() {
    const rawSvg = DOM.svgEditor.value;

    if (!rawSvg.trim()) {
      DOM.previewArea.innerHTML = '<div class="preview-placeholder"><div class="empty-state-icon">✨</div><div class="empty-state-title">No SVG Yet</div><div class="empty-state-desc">Generate or paste SVG code to see it come to life</div></div>';
      return;
    }

    const sanitizedSvg = SVGSanitizer.sanitize(rawSvg);

    if (sanitizedSvg) {
      DOM.previewArea.innerHTML = sanitizedSvg;
    } else {
      DOM.previewArea.innerHTML = '<p class="preview-placeholder" style="color: var(--error);">Invalid SVG code</p>';
    }
  }
};

/**
 * Clipboard controller - handles copy operations
 */
export const ClipboardController = {
  async copy(text, successMessage = 'Copied!') {
    try {
      await navigator.clipboard.writeText(text);
      StatusController.show(successMessage, 'success');
    } catch (e) {
      StatusController.show('Failed to copy', 'error');
    }
  }
};
