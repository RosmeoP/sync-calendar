# Design Spec: Match Hero KPI Card UI Improvements

* **Date**: 2026-06-20
* **Feature**: Featured Match Hero Card UI
* **Design Pattern**: Option A - iOS Liquid Light Glass Widget

---

## 1. Goal & Objectives
Improve the visual quality, readability, and interaction design of the main featured match hero card (`.hero-card`). It should function as a premium, eye-catching "Hero KPI" at the top of the schedule dashboard (on mobile) and in the desktop layout.

---

## 2. Visual Specifications (Option A: Refined iOS Liquid Light Glass)

We will modify `styles.css` to update the following visual properties:

### 2.1 Card Container (`.hero-card`)
* **Background**: `rgba(255, 255, 255, 0.90)` (very rich white glassmorphism).
* **Backdrop Filter**: `blur(30px) saturate(190%)` for strong frosted distortion.
* **Borders**: 
  * Solid `1px solid rgba(0, 0, 0, 0.07)` border.
  * Highlight top-border `rgba(255, 255, 255, 0.55)` and left-border `rgba(255, 255, 255, 0.55)`.
* **Shadows**:
  * Outer: `0 12px 40px rgba(0, 0, 0, 0.25)`.
  * Inner: `inset 0 1px 0 rgba(255, 255, 255, 0.65)`.
* **Reflection**: A subtle top lens reflection highlight on the `::before` pseudo-element.

### 2.2 Text & Contrast Hierarchy
* **Primary Text** (`.team-name-hero`, `.score-main`, `.score-time`): `#1c1c1e` (Apple system dark gray/black).
* **Secondary Labels** (`.team-tla`, `.venue-small`): `rgba(28, 28, 30, 0.55)`.
* **Score Styling**:
  * Font family: `var(--f-score)` (`Bebas Neue`).
  * Font size: `3.4rem` to `3.6rem` inside `.score-main.hero-score`.
  * Letter spacing: `4px` or `6px` depending on panel container.

### 2.3 Status & Stage Badges
* **Stage Badge (`.badge-stage`)**:
  * Background: `rgba(0, 0, 0, 0.05)`.
  * Color: `rgba(28, 28, 30, 0.7)`.
  * Border: `1px solid rgba(0, 0, 0, 0.08)`.
* **Live Status Badge (`.badge-live`)**:
  * Background: `rgba(255, 59, 48, 0.12)`.
  * Color: `#d12c22`.
  * Border: `1px solid rgba(255, 59, 48, 0.25)`.
  * Pulse indicator dot: glowing red live dot.
* **Upcoming Badge (`.badge-upcoming`)**:
  * Background: `rgba(48, 209, 88, 0.12)`.
  * Color: `#24b248`.
  * Border: `1px solid rgba(48, 209, 88, 0.25)`.

### 2.4 Crest Containers
* **Wrapper (`.crest-wrap.large`)**:
  * Border-radius: `50%`.
  * Background: `rgba(255, 255, 255, 0.9)`.
  * Padding: `6px`.
  * Border: `1px solid rgba(0, 0, 0, 0.08)`.
  * Shadow: `0 4px 12px rgba(0, 0, 0, 0.06)`.
  * Alignment: centered layout ensuring crest images display beautifully.

### 2.5 Action Button (`.btn-cal-hero`)
* **Background**: `rgba(0, 0, 0, 0.05)`.
* **Color**: `#1c1c1e`.
* **Border**: `1px solid rgba(0, 0, 0, 0.08)`.
* **Micro-interactions**:
  * Hover state: `background: rgba(0, 0, 0, 0.1)`.
  * Active press state: `transform: scale(0.97)` transition effect.

---

## 3. Implementation Details
* Update the CSS styles for `.hero-card` and related nested elements inside `styles.css`.
* Ensure that the desktop widgets (Center Panel Hero, Right Panel Hero) adapt styling rules (e.g. font-size overrides on smaller containers) without breaking alignment.
* Maintain clean CSS structure without redundant definitions or overriding default `.match-card` list elements.

---

## 4. Verification & Testing
* Verify rendering for all three states: **LIVE**, **Upcoming**, and **Finished** (FT).
* Verify layout responsiveness on both desktop viewports and simulated mobile viewports.
* Verify "+ Add to Calendar" button behavior and hover/active states.
