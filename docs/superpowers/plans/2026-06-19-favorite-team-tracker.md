# Favorite Team Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redundant desktop right-panel featured card with an interactive "Favorite Team Tracker" that displays the selected team's standings, next/previous matches, and provides a customized team-only calendar sync download.

**Architecture:** Use a state variable `favoriteTeamId` saved to `localStorage` key `fav_team_id`. Extract all unique teams dynamically from matches data. Search the standings array for team progress details and filter matches array for team-specific results/schedules.

**Tech Stack:** Vanilla HTML, CSS, JavaScript (Local storage API, DOM manipulation).

---

### Task 1: Add HTML Container Structure

**Files:**
* Modify: [index.html](file:///Users/mauricioparada/desktop/sync-calendar/index.html#L140-L142)

- [ ] **Step 1: Replace container inside desktop hero section**
  Replace line 141 in [index.html](file:///Users/mauricioparada/desktop/sync-calendar/index.html) to add a class for specific styling and container hooks:
  ```html
  <div class="pr-section">
    <div class="pr-heading" id="pr-live-label">Favorite Team</div>
    <div id="hero-desktop" class="fav-team-container"></div>
  </div>
  ```

- [ ] **Step 2: Verify changes visually**
  Inspect [index.html](file:///Users/mauricioparada/desktop/sync-calendar/index.html) to verify the class is present and the tag structure is valid.

- [ ] **Step 3: Commit**
  ```bash
  git add index.html
  git commit -m "style: add fav-team-container hook in index.html"
  ```

---

### Task 2: Define UI Styles for the Widget

**Files:**
* Modify: [styles.css](file:///Users/mauricioparada/desktop/sync-calendar/styles.css) (append to the end of the file)

- [ ] **Step 1: Add CSS rules for the selector and dashboard views**
  Append the following CSS to [styles.css](file:///Users/mauricioparada/desktop/sync-calendar/styles.css):
  ```css
  /* ── Favorite Team Tracker ─────────────────────────────────────────────────── */
  .fav-team-box {
    background: var(--glass);
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
    border: 1px solid var(--edge);
    border-radius: var(--r-lg);
    padding: 14px;
    box-shadow: var(--shine);
    margin-bottom: 12px;
  }
  
  .fav-select-label {
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--t3);
    margin-bottom: 8px;
  }
  
  .fav-select-dropdown {
    width: 100%;
    background: var(--glass-md);
    border: 1px solid var(--edge);
    border-radius: var(--r-sm);
    color: var(--t1);
    font-family: var(--f-body);
    font-size: 0.78rem;
    padding: 8px;
    outline: none;
    cursor: pointer;
  }
  .fav-select-dropdown option {
    background: #111;
  }
  
  .fav-team-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  
  .fav-team-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--f-label);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--t1);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  
  .fav-btn-change {
    background: none;
    border: none;
    color: var(--t3);
    font-size: 0.68rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 4px;
  }
  .fav-btn-change:hover {
    color: var(--t1);
  }
  
  .fav-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }
  
  .fav-stat-card {
    background: var(--glass-md);
    border: 1px solid var(--edge);
    border-radius: var(--r-md);
    padding: 8px;
    text-align: center;
  }
  
  .fav-stat-lbl {
    font-size: 0.52rem;
    font-weight: 700;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  
  .fav-stat-val {
    font-family: var(--f-score);
    font-size: 1.15rem;
    color: var(--t1);
  }
  
  .fav-section-title {
    font-size: 0.58rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--t3);
    margin-bottom: 6px;
  }
  
  .fav-match-card {
    background: var(--glass-md);
    border: 1px solid var(--edge);
    border-radius: var(--r-md);
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .fav-match-teams {
    font-family: var(--f-label);
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--t1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .fav-match-score {
    font-family: var(--f-score);
    font-size: 0.88rem;
    color: var(--green);
  }
  
  .fav-match-meta {
    font-size: 0.6rem;
    color: var(--t3);
    margin-top: 4px;
  }
  
  .fav-btn-sync {
    width: 100%;
    background: var(--green-glass);
    border: 1px solid var(--green-edge);
    color: var(--green);
    border-radius: var(--r-md);
    padding: 8px 12px;
    font-family: var(--f-body);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s ease;
  }
  .fav-btn-sync:hover {
    background: var(--green);
    color: #000;
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add styles.css
  git commit -m "style: add favorite team tracker styles in styles.css"
  ```

---

### Task 3: Initialize State and Bootstrap Logic

**Files:**
* Modify: [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js)

- [ ] **Step 1: Declare global variables**
  Declare the dynamic variables at the top of [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js):
  ```javascript
  let allMatches   = [];
  let allStandings = [];
  let activeTab    = 'all';
  let activeGroupIdx = 0;
  let favoriteTeamId = null;
  ```

- [ ] **Step 2: Load favorite team from LocalStorage on init**
  Modify the `init()` bootstrap code to retrieve the saved team, extract unique teams, and render:
  ```javascript
  async function init() {
    try {
      const [matchesRes, standingsRes] = await Promise.allSettled([
        fetch('/.netlify/functions/matches'),
        fetch('/.netlify/functions/standings'),
      ]);
  
      if (matchesRes.status === 'rejected') throw new Error('Network error.');
  
      const matchesResp = matchesRes.value;
      if (!matchesResp.ok) {
        const body = await matchesResp.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${matchesResp.status}`);
      }
  
      const matchData = await matchesResp.json();
      allMatches = matchData.matches || [];
      if (!allMatches.length) throw new Error('No matches returned yet.');
  
      if (standingsRes.status === 'fulfilled' && standingsRes.value.ok) {
        const sData = await standingsRes.value.json();
        allStandings = sData.standings || [];
      }
  
      hide(loadingEl);
      show(mainContent);
      show(downloadBtn);
  
      // Load favorite team state
      const savedId = localStorage.getItem('fav_team_id');
      if (savedId) favoriteTeamId = parseInt(savedId, 10);
  
      // Populate all sections
      renderMobileStats();
      renderHero(document.getElementById('hero-section'), false);
      renderHero(document.getElementById('hero-center'), false);
      renderOverview();
      renderNextMatches();
      renderTournamentProgress();
      renderStandings();
      renderSchedule();
      renderFavoriteTeamWidget(); // New section
  
      // Tabs
      document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
          activeTab = btn.dataset.tab;
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          renderSchedule();
        });
      });
  
      teamSearch.addEventListener('input',   renderSchedule);
      stageFilter.addEventListener('change', renderSchedule);
  
      downloadBtn.addEventListener('click', () => {
        const visible = getFiltered();
        if (visible.length) downloadICS(visible, 'world-cup-2026.ics');
      });
  
    } catch (err) {
      showError(err.message);
    }
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add app.js
  git commit -m "feat: declare state and bootstrap favorite team in init()"
  ```

---

### Task 4: Implement Team Selector Dropdown

**Files:**
* Modify: [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js) (append logic functions before end of file)

- [ ] **Step 1: Write helper logic to extract teams and display selector**
  Append `renderFavoriteTeamWidget()`, `getUniqueTeams()`, and selection handlers to [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js):
  ```javascript
  // ── Favorite Team Tracker Logic ──────────────────────────────────────────────
  function renderFavoriteTeamWidget() {
    const container = document.getElementById('hero-desktop');
    if (!container) return;
  
    if (!favoriteTeamId) {
      // Selector state
      const teams = getUniqueTeams();
      container.innerHTML = `
        <div class="fav-team-box">
          <div class="fav-select-label">Choose your team</div>
          <select id="fav-team-select" class="fav-select-dropdown">
            <option value="">-- Select Team --</option>
            ${teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
        </div>
      `;
  
      document.getElementById('fav-team-select').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          favoriteTeamId = parseInt(val, 10);
          localStorage.setItem('fav_team_id', favoriteTeamId);
          renderFavoriteTeamWidget();
        }
      });
      return;
    }
  
    // Dashboard state
    renderFavTeamDashboard(container);
  }
  
  function getUniqueTeams() {
    const map = new Map();
    allMatches.forEach(m => {
      if (m.homeTeam?.id && m.homeTeam.name) map.set(m.homeTeam.id, m.homeTeam.name);
      if (m.awayTeam?.id && m.awayTeam.name) map.set(m.awayTeam.id, m.awayTeam.name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add app.js
  git commit -m "feat: implement getUniqueTeams and renderFavoriteTeamWidget selector view"
  ```

---

### Task 5: Implement Standings and Match Lookup for Selected Team

**Files:**
* Modify: [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js) (append to the end)

- [ ] **Step 1: Write dashboard render, standings, and match lookups**
  Append `renderFavTeamDashboard()`, `getFavTeamStanding()`, and match helper logic to [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js):
  ```javascript
  function renderFavTeamDashboard(container) {
    const teams = getUniqueTeams();
    const currentTeam = teams.find(t => t.id === favoriteTeamId);
    if (!currentTeam) {
      favoriteTeamId = null;
      localStorage.removeItem('fav_team_id');
      renderFavoriteTeamWidget();
      return;
    }
  
    // Fetch standing stats
    const standing = getFavTeamStanding(favoriteTeamId);
    const standingHTML = standing 
      ? `<div class="fav-stats-grid">
           <div class="fav-stat-card"><div class="fav-stat-lbl">Group</div><div class="fav-stat-val" style="font-size:0.8rem;font-weight:700">${standing.group.replace('GROUP_','')}</div></div>
           <div class="fav-stat-card"><div class="fav-stat-lbl">Rank</div><div class="fav-stat-val">#${standing.position}</div></div>
           <div class="fav-stat-card"><div class="fav-stat-lbl">Points</div><div class="fav-stat-val">${standing.points}</div></div>
         </div>`
      : `<p style="font-size:0.65rem;color:var(--t3);margin-bottom:10px">Standings currently unavailable</p>`;
  
    // Fetch Matches
    const teamMatches = allMatches.filter(m => m.homeTeam?.id === favoriteTeamId || m.awayTeam?.id === favoriteTeamId);
    
    // Previous match (most recently finished)
    const prevMatch = teamMatches
      .filter(m => normStatus(m.status) === 'finished')
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))[0];
  
    let prevHTML = `<p style="font-size:0.65rem;color:var(--t3)">No previous match results</p>`;
    if (prevMatch) {
      const isHome = prevMatch.homeTeam.id === favoriteTeamId;
      const oppName = isHome ? prevMatch.awayTeam.name : prevMatch.homeTeam.name;
      const hScore = prevMatch.score?.fullTime?.home ?? 0;
      const aScore = prevMatch.score?.fullTime?.away ?? 0;
      const resultText = isHome 
        ? `${hScore} - ${aScore} vs ${oppName}`
        : `${aScore} - ${hScore} vs ${oppName}`;
      prevHTML = `
        <div class="fav-match-card">
          <div class="fav-match-teams">
            <span>vs ${oppName}</span>
            <span class="fav-match-score">${hScore} - ${aScore}</span>
          </div>
          <div class="fav-match-meta">${isHome ? 'Home' : 'Away'} · FT</div>
        </div>`;
    }
  
    // Next match (first upcoming or live)
    const nextMatch = teamMatches
      .filter(m => normStatus(m.status) !== 'finished')
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0];
  
    let nextHTML = `<p style="font-size:0.65rem;color:var(--t3)">No upcoming matches scheduled</p>`;
    if (nextMatch) {
      const isHome = nextMatch.homeTeam.id === favoriteTeamId;
      const oppName = isHome ? nextMatch.awayTeam.name : nextMatch.homeTeam.name;
      const dateStr = new Date(nextMatch.utcDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = new Date(nextMatch.utcDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const statusLabel = normStatus(nextMatch.status) === 'live' ? '🔴 LIVE' : `${dateStr} · ${timeStr}`;
      nextHTML = `
        <div class="fav-match-card">
          <div class="fav-match-teams">
            <span>vs ${oppName}</span>
          </div>
          <div class="fav-match-meta">${statusLabel} ${nextMatch.venue ? `· ${nextMatch.venue}` : ''}</div>
        </div>`;
    }
  
    // Render complete Dashboard
    container.innerHTML = `
      <div class="fav-team-box">
        <div class="fav-team-header">
          <div class="fav-team-title">
            <span>⭐️ ${currentTeam.name}</span>
          </div>
          <button id="fav-btn-edit" class="fav-btn-change">Change</button>
        </div>
        
        ${standingHTML}
        
        <div class="fav-section-title">Last Result</div>
        ${prevHTML}
        
        <div class="fav-section-title">Next Match</div>
        ${nextHTML}
        
        <button id="fav-btn-download-cal" class="fav-btn-sync">📅 Sync Team Calendar</button>
      </div>
    `;
  
    // Listeners
    document.getElementById('fav-btn-edit').addEventListener('click', () => {
      favoriteTeamId = null;
      localStorage.removeItem('fav_team_id');
      renderFavoriteTeamWidget();
    });
  
    document.getElementById('fav-btn-download-cal').addEventListener('click', () => {
      downloadICS(teamMatches, `${currentTeam.name.toLowerCase().replace(/\s/g, '-')}-calendar.ics`);
    });
  }
  
  function getFavTeamStanding(teamId) {
    if (!allStandings.length) return null;
    const groups = allStandings.filter(s => s.type === 'TOTAL');
    for (const g of groups) {
      const row = (g.table || []).find(r => r.team?.id === teamId);
      if (row) {
        return {
          group: g.group || '—',
          position: row.position,
          points: row.points,
          won: row.won,
          draw: row.draw,
          lost: row.lost
        };
      }
    }
    return null;
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add app.js
  git commit -m "feat: add standings lookup, match filter, and calendar sync helper for favorite team"
  ```

---

### Task 6: Manual Testing and Verification

- [ ] **Step 1: Verify team selector load**
  Launch browser to `http://localhost:3000`. Verify that the top right panel shows "Choose your team" select dropdown listing World Cup teams alphabetically.

- [ ] **Step 2: Select team and check dashboard**
  Choose a team (e.g., *United States*). Check that:
  1. The selected team's crest/name is pinned at the top.
  2. The group, rank, and points are correctly shown.
  3. Last result and next match schedule match the database.
  4. Reload the page and ensure the choice persists in local storage.

- [ ] **Step 3: Click change team**
  Click the "Change" button next to the team title. Verify that the dropdown list reappears and local storage is cleared.

- [ ] **Step 4: Verify custom .ics calendar sync**
  Select a team again, click `📅 Sync Team Calendar`, verify that it downloads a file like `united-states-calendar.ics`, and inspect the file content to ensure it contains only USA matches.
