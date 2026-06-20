# Match Hero KPI Card UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the visual design of the featured match hero KPI card (`.hero-card`) to match a premium iOS light-glass widget aesthetic.

**Architecture:** We will modify `styles.css` to update the styling of `.hero-card` and its children (sheen, shadows, typography, badges, crest wraps, and buttons) and test the results across states (Live, Upcoming, Finished).

**Tech Stack:** HTML5, Vanilla CSS, Vanilla JavaScript.

---

### Task 1: Style the Refined Liquid Sheen and Frosted Background on `.hero-card`

**Files:**
- Modify: `styles.css:205-240`

- [ ] **Step 1: Replace background, backdrop-filter, borders, and shadows on `.hero-card`**
  Update the `.hero-card` and `.hero-card.is-live` classes to implement rich white glassmorphism:
  ```css
  .hero-card {
    background: rgba(255, 255, 255, 0.90);
    backdrop-filter: blur(30px) saturate(190%);
    -webkit-backdrop-filter: blur(30px) saturate(190%);
    border: 1px solid rgba(0, 0, 0, 0.07);
    border-top-color: rgba(255, 255, 255, 0.55);
    border-left-color: rgba(255, 255, 255, 0.55);
    border-radius: var(--r-xl);
    padding: 20px 20px 18px;
    position: relative;
    overflow: hidden;
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.65),
      0 12px 40px rgba(0, 0, 0, 0.25);
    color: #1c1c1e;
  }
  
  .hero-card.is-live { 
    border-color: rgba(0, 0, 0, 0.08);
    border-top-color: rgba(255, 255, 255, 0.65);
    border-left-color: rgba(255, 255, 255, 0.65);
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.70),
      0 0 25px rgba(255, 255, 255, 0.2),
      0 12px 40px rgba(0, 0, 0, 0.28);
  }
  ```

- [ ] **Step 2: Add specular lens reflection on `::before`**
  Refine the light catching sheen gradient overlay:
  ```css
  .hero-card::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add styles.css
  git commit -m "style: refine hero card background and liquid glassmorphism"
  ```

---

### Task 2: Define Text and Contrast Overrides for Child Elements

**Files:**
- Modify: `styles.css:241-266`, `styles.css:391`

- [ ] **Step 1: Apply contrast overrides for iOS Light Widget text**
  Ensure text remains readable with dark contrast colors:
  ```css
  .hero-card .team-name-hero {
    color: #1c1c1e !important;
    text-shadow: none !important;
  }
  
  .hero-card .team-tla {
    color: rgba(28, 28, 30, 0.55) !important;
  }
  
  .hero-card .score-main {
    color: #1c1c1e !important;
  }
  
  .hero-card .score-vs {
    color: rgba(28, 28, 30, 0.45) !important;
  }
  
  .hero-card .score-time {
    color: #1c1c1e !important;
  }
  
  .hero-card .venue-small {
    color: rgba(28, 28, 30, 0.55) !important;
  }
  ```

- [ ] **Step 2: Check and refine score font size**
  Modify line 391 for `.score-main.hero-score` to ensure a consistent, elegant character size:
  ```css
  .score-main.hero-score { font-size: 3.4rem; letter-spacing: 6px; }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add styles.css
  git commit -m "style: implement text contrast overrides for light widget"
  ```

---

### Task 3: Refine Stage, Live, and Upcoming Badges

**Files:**
- Modify: `styles.css:267-307`

- [ ] **Step 1: Style badges for light mode background compatibility**
  Replace badge classes with refined color palettes:
  ```css
  .hero-card .badge-stage {
    background: rgba(0, 0, 0, 0.05) !important;
    color: rgba(28, 28, 30, 0.7) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
  }
  
  .hero-card .badge-ft {
    background: rgba(0, 0, 0, 0.05) !important;
    color: rgba(28, 28, 30, 0.6) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
  }
  
  .hero-card .badge-upcoming {
    background: rgba(48, 209, 88, 0.12) !important;
    color: #24b248 !important;
    border: 1px solid rgba(48, 209, 88, 0.25) !important;
  }
  
  .hero-card .badge-live {
    background: rgba(255, 59, 48, 0.12) !important;
    color: #d12c22 !important;
    border: 1px solid rgba(255, 59, 48, 0.25) !important;
  }
  
  .hero-card .score-time-live {
    color: #d12c22 !important;
    background: rgba(255, 59, 48, 0.12) !important;
    border: 1px solid rgba(255, 59, 48, 0.25) !important;
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add styles.css
  git commit -m "style: update match status badges for hero card light theme"
  ```

---

### Task 4: Update Crest Wrap Containers and Team Crest Alignment

**Files:**
- Modify: `styles.css:308-319`

- [ ] **Step 1: Solidify background behind crests to avoid color overlaps**
  Ensure transparent PNG logos display cleanly on the light card:
  ```css
  .hero-card .team-crest-placeholder {
    color: #1c1c1e !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
    text-shadow: none !important;
  }
  
  .hero-card .team-crest {
    border-color: rgba(0, 0, 0, 0.06) !important;
    background: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
    padding: 6px !important;
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add styles.css
  git commit -m "style: polish team crest background container wraps"
  ```

---

### Task 5: Refine Action Button and Footer Layout

**Files:**
- Modify: `styles.css:291-300`, `styles.css:453` (inject overrides for footer top border)

- [ ] **Step 1: Add dark border top to footer when in light hero**
  Override the default white border for the `.hero-footer` when nested in a `.hero-card`:
  ```css
  .hero-card .hero-footer {
    border-top-color: rgba(0, 0, 0, 0.06) !important;
  }
  ```

- [ ] **Step 2: Polish `.btn-cal-hero` inside `.hero-card`**
  Make the calendar button look and act like an iOS style system button:
  ```css
  .hero-card .btn-cal-hero {
    background: rgba(0, 0, 0, 0.05) !important;
    color: #1c1c1e !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: none !important;
    transition: background 0.15s, transform 0.1s;
  }
  
  .hero-card .btn-cal-hero:hover {
    background: rgba(0, 0, 0, 0.1) !important;
  }
  
  .hero-card .btn-cal-hero:active {
    transform: scale(0.97) !important;
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add styles.css
  git commit -m "style: update hero calendar button and footer border"
  ```

---

### Task 6: Adjust Compact Overrides for Desktop Right-Panel Viewport

**Files:**
- Modify: `styles.css:1050-1062`

- [ ] **Step 1: Update right panel compact hero styles**
  Ensure the compact hero matches the new spacing and text sizes:
  ```css
  #hero-desktop .hero-card { padding: 16px 14px 14px; }
  #hero-desktop .crest-wrap { width: 48px; height: 48px; }
  #hero-desktop .crest-wrap.large { width: 54px; height: 54px; }
  #hero-desktop .team-name-hero { font-size: 0.82rem; max-width: 72px; }
  #hero-desktop .score-main.hero-score { font-size: 2.4rem; letter-spacing: 4px; }
  #hero-desktop .score-vs { font-size: 1rem; }
  #hero-desktop .score-time { font-size: 1rem; }
  #hero-desktop .score-center { min-width: 66px; }
  #hero-desktop .hero-footer { margin-top: 14px; border-top-color: rgba(0, 0, 0, 0.06); }
  #hero-desktop .btn-cal-hero { font-size: 0.7rem; padding: 7px 12px; }
  #hero-desktop #hero-section { padding: 0; }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add styles.css
  git commit -m "style: optimize compact desktop sidebar overrides"
  ```

---

### Task 7: Manual Quality Review and Dev Server Verification

**Files:**
- Verify: `index.html` via browser preview

- [ ] **Step 1: Check rendering in mobile simulated layout**
  Ensure that all match states display correctly in the browser:
  * Open simulated browser on local app (running on localhost:3000).
  * Verify that the main hero card stands out elegantly.
  * Verify the specular highlight top sheen is visible and adds depth.
  * Verify "+ Add to Calendar" button has subtle hover and scaling on click.

- [ ] **Step 2: Check rendering in desktop viewport layout**
  Ensure the right panel and center panel components display without layout issues:
  * Check center-panel featured match hero card.
  * Check right-panel compact match hero card.
  ```
