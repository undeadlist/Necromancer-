# CLAUDE.md

## Project: SVG Necromancer
AI-powered SVG tool — Generate, Fix, Animate, Convert vectors using Gemini AI.

**Brand:** Part of UndeadList ecosystem
**Tagline:** "Resurrect your vectors" / ベクターを蘇らせる

## Tech Stack
- Pure HTML/CSS/JavaScript (no framework)
- Gemini 2.5 Flash API (Dec 2025)
- BYOK (Bring Your Own Key) model
- Zero backend — fully client-side

## File Structure
```
svg-necromancer/
├── src/
│   └── index.html      # Main app (all-in-one)
├── assets/             # Logo, favicon, etc.
├── public/             # Static files for deployment
├── package.json
├── README.md
└── CLAUDE.md
```

## Color Palette
```css
--bg-primary: #0a0a0f;        /* Deep black */
--bg-secondary: #12121a;      /* Card backgrounds */
--accent-pink: #ff3366;       /* Primary accent (from logo) */
--accent-pink-light: #ff6b9d; /* Hover states */
--accent-blue: #0066cc;       /* Secondary accent (UndeadList blue) */
--text-primary: #e8e8e8;
--text-muted: #a0a8b0;        /* Updated for WCAG AA contrast */
--border: #2a2a3a;
```

## Features
1. **Generate** — Text prompt → SVG via Gemini AI
2. **View/Edit** — Live preview + code editor
3. **Fix** — Repair broken/malformed SVGs
4. **Animate** — Add CSS animations (pulse, spin, bounce, fade, draw, float, shake, glow)
5. **Convert** — React, Vue, Base64, Data URI, Optimized

## Japanese Text Elements
- Logo tagline: ベクターを蘇らせる (Resurrect your vectors)
- Footer badge: 蘇生 (Resurrection)
- Tab labels: 召喚, 表示, 修復, 動作, 変換
- Loading: 降霊中... (Summoning...)
- Success: 復活！ (Revived!)

## ⛔ DO NOT
1. Add React/Vue/framework dependencies — keep it vanilla
2. Change the color scheme without approval
3. Remove Japanese text elements
4. Add external CSS frameworks (Tailwind, Bootstrap)
5. Store API keys server-side — BYOK only

## ✅ DO
1. Keep all code in single index.html for simplicity
2. Maintain dark theme consistency
3. Test all 5 tabs after changes
4. Preserve UndeadList branding in footer

## Commands
```bash
# Run dev server
npm run dev

# Or directly
npx serve src -p 5000
```

## Deployment
Static HTML — deploy anywhere:
- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages
- Self-hosted

## API Integration
Uses Gemini 2.5 Flash (Dec 2025). User provides their own API key (stored in localStorage).
```
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

## Related
- UndeadList: https://undeadlist.com
- Get Gemini API Key: https://aistudio.google.com/app/apikey
