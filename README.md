# Damarcus Lett — Personal Brand Site

A modern, animated personal branding website for **Damarcus Lett** — Technical Program Manager at Microsoft, engineer, and tech thought leader.

## Live URL

> **https://YOUR_USERNAME.github.io/damarcuslett**
> *(replace `YOUR_USERNAME` with your GitHub username after deployment)*

---

## Tech Stack

- **HTML5** — Semantic markup, accessibility-first
- **CSS3** — Glassmorphism, animations, CSS Grid/Flexbox, custom properties
- **Vanilla JavaScript** — Particle canvas, typing animation, Intersection Observer, scroll effects
- **Google Fonts CDN** — Inter + Space Grotesk
- **Font Awesome 6 CDN** — Icons
- **Wikimedia Commons** — Official company logos (SVG/PNG)
- **No frameworks. No build tools. Zero dependencies beyond CDN imports.**

---

## Features

- Animated particle background (canvas, 80 particles)
- Typing animation hero with 4 rotating titles
- Infinite CSS logo marquee with hover pause
- Glassmorphism cards throughout
- Scroll-triggered entrance animations (Intersection Observer)
- Vertical experience timeline (9 companies)
- Fully responsive — mobile, tablet, desktop
- SEO + Open Graph meta tags
- Contact form + newsletter form with JS success states

---

## GitHub Pages Deployment — Step by Step

### Step 1 — Create GitHub Repository
1. Go to **https://github.com/new**
2. Name the repository:
   - **Option A (cleanest URL):** `damarcuslett.github.io` → live at `https://damarcuslett.github.io`
   - **Option B (any name):** `damarcuslett` → live at `https://damarcuslett.github.io/damarcuslett`
3. Set visibility to **Public**
4. Do **NOT** initialize with README (you already have one)
5. Click **Create repository**

### Step 2 — Connect Local Repo to GitHub
Open your terminal in the `damarcuslett/` directory and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repo name.

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub
2. Click **Settings** (top tab)
3. Scroll to **Pages** in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Set **Branch** to `main` and folder to `/ (root)`
6. Click **Save**

### Step 4 — Go Live!
Wait **2–3 minutes** for GitHub to build and deploy your site.
Your site will be live at the URL shown in the Pages settings.

---

## Local Preview

Simply open `index.html` in any modern browser — no server required.

```bash
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

---

## Customization

All content is in a single `index.html` file:
- **Colors** — edit CSS custom properties in `:root` at the top of `<style>`
- **Content** — find each section by its `id` attribute
- **LinkedIn URL** — search for `damarcuslett` to update all links at once

---

© 2025 Damarcus Lett. Built with purpose.
