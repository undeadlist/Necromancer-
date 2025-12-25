/**
 * Application configuration constants
 */
export const CONFIG = {
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  STORAGE_KEY: 'necromancer_api_key',
  MAX_PROMPT_LENGTH: 2000,
  MAX_SVG_LENGTH: 100000,
  STATUS_TIMEOUT: 3000
};

/**
 * Animation presets with CSS keyframes for quick animations
 */
export const ANIMATIONS = {
  pulse: {
    name: 'Pulse',
    description: 'Add a gentle breathing/pulse effect. Use transform: scale() animating from 1 to 1.05 and back. Duration: 2s, ease-in-out timing, infinite loop.',
    css: `@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`
  },
  spin: {
    name: 'Spin',
    description: 'Add continuous 360 degree rotation. Use transform: rotate() from 0deg to 360deg. Duration: 3s, linear timing, infinite loop.',
    css: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
  },
  bounce: {
    name: 'Bounce',
    description: 'Add vertical bouncing motion. Use transform: translateY() from 0 to -10px and back. Duration: 0.6s, ease-in-out timing, infinite loop.',
    css: `@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`
  },
  fade: {
    name: 'Fade',
    description: 'Add fade in/out breathing effect. Use opacity from 1 to 0.5 and back. Duration: 2s, ease-in-out timing, infinite loop.',
    css: `@keyframes fade { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`
  },
  float: {
    name: 'Float',
    description: 'Add gentle floating motion. Use transform: translateY() from 0 to -6px and back. Duration: 3s, ease-in-out timing, infinite loop.',
    css: `@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`
  },
  shake: {
    name: 'Shake',
    description: 'Add horizontal shake effect. Use transform: translateX() oscillating between -3px and 3px. Duration: 0.4s, ease-in-out timing, infinite loop.',
    css: `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }`
  },
  glow: {
    name: 'Glow',
    description: 'Add pulsing glow effect. Use filter: drop-shadow() with varying blur and opacity. Duration: 2s, ease-in-out timing, infinite loop.',
    css: `@keyframes glow { 0%, 100% { filter: drop-shadow(0 0 3px currentColor); } 50% { filter: drop-shadow(0 0 10px currentColor); } }`
  },
  draw: {
    name: 'Draw',
    description: 'Add stroke drawing animation. Set stroke-dasharray to path length, animate stroke-dashoffset from path length to 0. Duration: 2s, ease-in-out timing.',
    css: `@keyframes draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }`
  },
  morph: {
    name: 'Morph',
    description: 'Add subtle shape morphing. Use transform: scale() with different X and Y values. Duration: 4s, ease-in-out timing, infinite loop.',
    css: `@keyframes morph { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.03, 0.97); } }`
  },
  swing: {
    name: 'Swing',
    description: 'Add pendulum swing motion. Use transform: rotate() oscillating between -5deg and 5deg. Duration: 1s, ease-in-out timing, infinite loop.',
    css: `@keyframes swing { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }`
  }
};

/**
 * Style presets for SVG generation
 */
export const STYLES = {
  modern: {
    name: 'Modern',
    prompt: 'Clean geometric shapes, bold gradient combinations (purple to blue, orange to pink), minimal but impactful, sharp edges with subtle rounded corners'
  },
  dark: {
    name: 'Dark/Mystical',
    prompt: 'Deep purples (#1a0a2e), blacks, glowing accents (#00ff88, #ff00ff), ethereal glow effects using radial gradients, sharp angular shapes, mysterious atmosphere'
  },
  playful: {
    name: 'Playful',
    prompt: 'Rounded, bubbly shapes, bright saturated colors (coral, turquoise, yellow), soft shadows, approachable and fun aesthetic'
  },
  corporate: {
    name: 'Corporate',
    prompt: 'Blues (#0066cc, #003366) and grays, balanced symmetrical composition, clean lines, trustworthy feel, subtle gradients not flashy'
  },
  minimal: {
    name: 'Minimal',
    prompt: 'Maximum 3 colors, clever use of negative space, clean lines, flat design no gradients, iconic memorable silhouette'
  },
  vintage: {
    name: 'Vintage',
    prompt: 'Muted earth tones (rust, olive, cream, brown), textured appearance using patterns, ornate decorative details, classic timeless feel'
  },
  neon: {
    name: 'Neon',
    prompt: 'Bright neon colors (#00ffff, #ff00ff, #00ff00) on dark background (#0a0a0f), glowing effects using drop-shadow filters, cyberpunk synthwave aesthetic'
  }
};
