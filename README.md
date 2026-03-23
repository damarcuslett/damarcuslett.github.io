# Damarcus Lett — Personal Brand Site

A production-quality personal branding website for **Damarcus Lett** — Technical Program Manager at Microsoft Xbox, engineer, and tech thought leader. This is the $100K-quality upgrade featuring a fully externalized CSS/JS architecture, accessibility-first design, dark/light theme toggle, Plausible analytics, particle canvas, custom cursor, magnetic buttons, and a complete 9-company career timeline.

## Live URL

**https://damarcuslett.github.io**

---

## File Structure

```
damarcuslett/
├── index.html              Semantic HTML5 shell — zero inline CSS or JS
├── assets/
│   ├── css/
│   │   └── styles.css      Complete production stylesheet (990+ lines)
│   ├── js/
│   │   └── main.js         Complete production JavaScript (450+ lines)
│   └── logos/              Locally cached company logos
│       ├── microsoft.svg
│       ├── xbox.svg
│       ├── intel.svg
│       ├── dell.png
│       ├── boeing.svg
│       ├── eaton.svg
│       ├── ge.svg
│       ├── jj.svg
│       └── emerson.svg
├── README.md
└── .gitignore
```

---

## Tech Stack

- **HTML5** — Semantic markup, ARIA roles, skip links, Open Graph + Twitter Card meta tags
- **CSS3** — Custom Properties (design tokens), Grid, Flexbox, Glassmorphism, CSS animations, dark/light themes
- **Vanilla JavaScript ES6+** — Particle canvas, typing animation, Intersection Observer, scroll effects, magnetic buttons, animated counters, form validation
- **Google Fonts CDN** — Syne (700, 800) + DM Sans (400, 500)
- **Font Awesome 6 CDN** — Icons (solid + brands subsets)
- **Plausible Analytics** — Privacy-first, GDPR-compliant analytics
- **No frameworks. No build tools. Zero runtime dependencies beyond CDN imports.**

---

## Features

- Animated particle background (canvas, 80 particles, blue color palette, connection lines)
- Custom dual-element cursor with lerp smoothing (desktop only)
- Typing animation cycling through 4 professional titles
- Scroll progress bar (3px gradient across top of viewport)
- Frosted glass navigation that activates on scroll
- Infinite CSS dual-row logo marquee with hover pause
- Glassmorphism cards throughout all sections
- Scroll-triggered entrance animations (left/right/up, staggered)
- Vertical alternating experience timeline for 9 companies
- Animated stat counters with ease-out cubic
- Magnetic button hover effect (desktop)
- Dark/light theme toggle with localStorage persistence
- Contact form + newsletter form with validation and toast notifications
- Scroll spy highlighting active nav link
- All 9 company logos cached locally with text fallbacks on error
- Full accessibility: skip link, ARIA labels, roles, focus styles
- SEO: canonical, Open Graph, Twitter Card, robots meta
- Responsive: mobile, tablet, desktop, large desktop

---

## GitHub Pages Deployment

### Step 1 — Create GitHub Repository
1. Go to **https://github.com/new**
2. Name the repository `damarcuslett.github.io` for the cleanest URL
3. Set visibility to **Public**
4. Do NOT initialize with README (you already have one)
5. Click **Create repository**

### Step 2 — Connect Local Repo to GitHub
Open your terminal in the `damarcuslett/` directory and run:

```bash
git remote add origin https://github.com/damarcuslett/damarcuslett.github.io.git
git branch -M main
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub
2. Click **Settings** (top tab)
3. Scroll to **Pages** in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Set **Branch** to `main` and folder to `/ (root)`
6. Click **Save**

### Step 4 — Go Live
Wait 2-3 minutes for GitHub to build and deploy. Your site will be live at **https://damarcuslett.github.io**.

---

## Local Preview

Open `index.html` directly in any modern browser — no build step or server required.

```bash
start index.html       # Windows
open index.html        # macOS
xdg-open index.html    # Linux
```

For a local server (recommended for full feature testing):

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .
```

---

## Customization

- **Colors and tokens** — edit CSS custom properties in `:root` in `assets/css/styles.css`
- **Content** — find each section by its `id` attribute in `index.html`
- **LinkedIn URL** — search for `damarcuslett` to update all links
- **Typing phrases** — edit the `phrases` array in `assets/js/main.js` (initTypingAnimation function)
- **Particle count/colors** — edit the constants in `initParticleCanvas` in `assets/js/main.js`

---

© 2025 Damarcus Lett. Built with purpose. All rights reserved.
