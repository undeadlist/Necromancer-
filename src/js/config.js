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
 * Animation type descriptions for Gemini API
 */
export const ANIMATIONS = {
  pulse: 'Add a pulsing/breathing animation that scales the SVG slightly. Use transform: scale() with smooth easing.',
  spin: 'Add a continuous rotation animation around the center. Use transform: rotate() with linear timing.',
  bounce: 'Add a bouncing up and down animation. Use transform: translateY() with ease-in-out.',
  fade: 'Add a fade in/out opacity animation. Animate opacity from 0.3 to 1 smoothly.',
  draw: 'Add a stroke drawing animation that reveals the paths. Use stroke-dasharray and stroke-dashoffset animation.',
  float: 'Add a gentle floating/hovering animation with subtle translateY movement.',
  shake: 'Add a shake/wiggle animation. Use small rotate and translate transforms.',
  glow: 'Add a glowing effect animation using filter and drop-shadow that pulses.'
};
