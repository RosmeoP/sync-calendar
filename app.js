let allMatches   = [];
let allStandings = [];
let activeTab    = 'all';
let activeGroupIdx = 0;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const mainContent    = document.getElementById('main-content');
const loadingEl      = document.getElementById('loading');
const errorEl        = document.getElementById('error-msg');
const scheduleEl     = document.getElementById('schedule');
const downloadBtn    = document.getElementById('download-all-btn');
const teamSearch     = document.getElementById('team-search');
const stageFilter    = document.getElementById('stage-filter');

// ── Bootstrap ─────────────────────────────────────────────────────────────────
init();

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

    // Populate all sections
    renderMobileStats();
    renderHero(document.getElementById('hero-section'), false);
    renderHero(document.getElementById('hero-center'), false);
    renderHero(document.getElementById('hero-desktop'), true);
    renderOverview();
    renderNextMatches();
    renderTournamentProgress();
    renderStandings();
    renderSchedule();

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

// ── Mobile stats strip ────────────────────────────────────────────────────────
function renderMobileStats() {
  const today = todayStr();
  let live = 0, todayCount = 0, upcoming = 0, finished = 0;
  allMatches.forEach(m => {
    const s = normStatus(m.status);
    if (s === 'live')     live++;
    if (s === 'finished') finished++;
    if (s === 'upcoming') upcoming++;
    if (matchDay(m) === today) todayCount++;
  });
  setText('stat-live',     live);
  setText('stat-today',    todayCount);
  setText('stat-upcoming', upcoming);
  setText('stat-finished', finished);
}

// ── Left panel — Overview grid ────────────────────────────────────────────────
function renderOverview() {
  const el = document.getElementById('overview-grid');
  if (!el) return;

  const today = todayStr();
  let live = 0, upcoming = 0, finished = 0, todayCount = 0;
  let totalGoals = 0;

  allMatches.forEach(m => {
    const s = normStatus(m.status);
    if (s === 'live')     live++;
    if (s === 'upcoming') upcoming++;
    if (s === 'finished') {
      finished++;
      totalGoals += (m.score?.fullTime?.home ?? 0) + (m.score?.fullTime?.away ?? 0);
    }
    if (matchDay(m) === today) todayCount++;
  });

  const avgGoals = finished > 0 ? (totalGoals / finished).toFixed(1) : '—';

  el.innerHTML = `
    <div class="ov-card">
      <div class="ov-label">Matches</div>
      <div class="ov-main">${live > 0 ? live : upcoming}</div>
      <div class="ov-sub ${live > 0 ? 'ov-sub-red' : ''}">
        ${live > 0 ? `${live} live now` : `${upcoming} upcoming`}
      </div>
    </div>
    <div class="ov-card">
      <div class="ov-label">Goals</div>
      <div class="ov-main">${totalGoals}</div>
      <div class="ov-sub">${avgGoals} per match</div>
    </div>
    <div class="ov-card">
      <div class="ov-label">Played</div>
      <div class="ov-main">${finished}</div>
      <div class="ov-sub">${allMatches.length} total</div>
    </div>
    <div class="ov-card">
      <div class="ov-label">Today</div>
      <div class="ov-main ${todayCount > 0 ? 'ov-sub-green' : ''}">${todayCount}</div>
      <div class="ov-sub">match${todayCount !== 1 ? 'es' : ''}</div>
    </div>
  `;
}

// ── Left panel — Next matches ─────────────────────────────────────────────────
function renderNextMatches() {
  const el = document.getElementById('next-matches-list');
  if (!el) return;

  const upcoming = allMatches
    .filter(m => normStatus(m.status) === 'upcoming')
    .slice(0, 4);

  if (!upcoming.length) {
    el.innerHTML = `<p style="font-size:.72rem;color:var(--t3);padding:4px 0">No upcoming matches</p>`;
    return;
  }

  el.innerHTML = upcoming.map(m => {
    const home    = m.homeTeam?.name  || 'TBD';
    const away    = m.awayTeam?.name  || 'TBD';
    const homeTLA = m.homeTeam?.tla   || home.slice(0,3).toUpperCase();
    const awayTLA = m.awayTeam?.tla   || away.slice(0,3).toUpperCase();
    const time    = new Date(m.utcDate).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
    const hCrest  = m.homeTeam?.crest ? `<img class="nm-crest" src="${m.homeTeam.crest}" alt="${home}" loading="lazy">` : `<div class="nm-crest" style="display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:700;color:var(--t2)">${homeTLA}</div>`;
    const aCrest  = m.awayTeam?.crest ? `<img class="nm-crest" src="${m.awayTeam.crest}" alt="${away}" loading="lazy">` : `<div class="nm-crest" style="display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:700;color:var(--t2)">${awayTLA}</div>`;
    const stage   = fmtStage(m.stage, m.group);
    return `
      <div class="next-match-item">
        <div class="nm-crests">${hCrest}${aCrest}</div>
        <div class="nm-info">
          <div class="nm-teams">${homeTLA} vs ${awayTLA}</div>
          <div class="nm-meta">${stage}</div>
        </div>
        <div class="nm-time">${time}</div>
      </div>`;
  }).join('');
}

// ── Left panel — Tournament progress ─────────────────────────────────────────
function renderTournamentProgress() {
  const el = document.getElementById('tournament-progress');
  if (!el) return;

  const finished = allMatches.filter(m => normStatus(m.status) === 'finished').length;
  const total    = allMatches.length;
  const pct      = total > 0 ? Math.round((finished / total) * 100) : 0;

  // Determine current stage
  const live    = allMatches.find(m => normStatus(m.status) === 'live');
  const next    = allMatches.find(m => normStatus(m.status) === 'upcoming');
  const current = live || next || allMatches[allMatches.length - 1];
  const stageLabel = current ? fmtStageOnly(current.stage) : 'Tournament';

  el.innerHTML = `
    <div class="tournament-bar-wrap">
      <div class="t-label">Current Stage</div>
      <div class="t-stage">${stageLabel}</div>
      <div class="t-bar-bg"><div class="t-bar-fill" style="width:${pct}%"></div></div>
      <div class="t-percent">${finished} of ${total} matches played · ${pct}%</div>
    </div>`;
}

// ── Hero card ─────────────────────────────────────────────────────────────────
function renderHero(container, isDesktop) {
  if (!container) return;
  container.innerHTML = '';

  const live = allMatches.filter(m => normStatus(m.status) === 'live');
  const featured = live.length
    ? live[0]
    : allMatches.find(m => normStatus(m.status) === 'upcoming');

  if (!featured) return;

  // Update right panel label
  if (isDesktop) {
    const label = document.getElementById('pr-live-label');
    if (label) label.textContent = live.length ? 'Live Now' : 'Next Match';
  }

  const wrap = document.createElement('div');
  wrap.style.padding = isDesktop ? '0' : '0 18px 8px';
  wrap.appendChild(buildMatchCard(featured, true));
  container.appendChild(wrap);
}

// ── Standings ─────────────────────────────────────────────────────────────────
function renderStandings() {
  if (!allStandings.length) return;
  const groups = allStandings.filter(s => s.type === 'TOTAL');
  if (!groups.length) return;

  // Populate both selects
  ['group-select-mobile', 'group-select-desktop'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    groups.forEach((g, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = g.group ? g.group.replace('GROUP_', 'Group ') : `Stage ${i+1}`;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', (e) => {
      activeGroupIdx = parseInt(e.target.value, 10);
      renderStandingsTable(groups);
    });
  });

  // Show standing sections
  const mob = document.getElementById('standings-section-mobile');
  const dsk = document.getElementById('standings-section-desktop');
  if (mob) show(mob);
  if (dsk) dsk.style.display = 'block';

  renderStandingsTable(groups);
}

function renderStandingsTable(groups) {
  const data = groups[activeGroupIdx];
  if (!data) return;

  const html = buildStandingsHTML(data);
  const mob = document.getElementById('standings-table-mobile');
  const dsk = document.getElementById('standings-table-desktop');
  if (mob) mob.innerHTML = html;
  if (dsk) dsk.innerHTML = html;

  // Sync selects
  ['group-select-mobile', 'group-select-desktop'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.value = activeGroupIdx;
  });
}

function buildStandingsHTML(data) {
  const rows = (data.table || []).map((row, i) => {
    const crest = row.team?.crest
      ? `<img class="st-crest" src="${row.team.crest}" alt="${row.team.name}" loading="lazy">`
      : `<div class="st-crest" style="background:var(--glass-md)"></div>`;
    return `<tr>
      <td class="st-rank${i < 2 ? ' top2' : ''}">${row.position}</td>
      <td><div class="st-team">${crest}<span class="st-name">${row.team?.name || ''}</span></div></td>
      <td>${row.playedGames}</td><td>${row.won}</td><td>${row.draw}</td><td>${row.lost}</td>
      <td class="st-pts">${row.points}</td>
    </tr>`;
  }).join('');

  return `<table class="standings-table">
    <thead><tr><th>#</th><th style="text-align:left">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Schedule ──────────────────────────────────────────────────────────────────
function renderSchedule() {
  scheduleEl.innerHTML = '';

  // Find featured match so we can skip it in the list
  const liveMatches = allMatches.filter(m => normStatus(m.status) === 'live');
  const featured    = liveMatches.length
    ? liveMatches[0]
    : allMatches.find(m => normStatus(m.status) === 'upcoming');
  const featuredId  = featured?.id;

  const matches = getFiltered().filter(m => m.id !== featuredId);

  if (!matches.length) {
    scheduleEl.innerHTML = '<p class="no-matches">No matches found.</p>';
    return;
  }

  // Group by date
  const groups = {};
  matches.forEach(m => {
    const key   = matchDay(m);
    const label = new Date(m.utcDate).toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    if (!groups[key]) groups[key] = { label, matches: [] };
    groups[key].matches.push(m);
  });

  Object.values(groups).forEach(({ label, matches: list }) => {
    const g  = document.createElement('div');
    g.className = 'date-group';
    const dl = document.createElement('div');
    dl.className = 'date-label';
    dl.textContent = label;
    g.appendChild(dl);

    let delay = 0;
    list.forEach(m => {
      const card = buildMatchCard(m, false);
      card.style.animationDelay = `${delay}ms`;
      delay += 45;
      g.appendChild(card);
    });
    scheduleEl.appendChild(g);
  });
}

// ── Card builder ──────────────────────────────────────────────────────────────
function buildMatchCard(m, isHero) {
  const card = document.createElement('div');
  card.className = isHero ? 'hero-card' : 'match-card';

  const st       = normStatus(m.status);
  const home     = m.homeTeam?.name  || 'TBD';
  const away     = m.awayTeam?.name  || 'TBD';
  const homeTLA  = m.homeTeam?.tla   || '';
  const awayTLA  = m.awayTeam?.tla   || '';
  const hScore   = m.score?.fullTime?.home;
  const aScore   = m.score?.fullTime?.away;
  const hasScore = hScore !== null && hScore !== undefined;
  const timeStr  = new Date(m.utcDate).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });

  if (st === 'live') card.classList.add('is-live');
  if (!isHero) card.classList.add(`status-${st}`);

  const badge = st === 'live'
    ? `<span class="badge badge-live"><span class="badge-live-dot"></span> LIVE</span>`
    : st === 'finished'
    ? `<span class="badge badge-ft">FT</span>`
    : `<span class="badge badge-upcoming">Upcoming</span>`;

  const scoreHTML = (st === 'live' || st === 'finished')
    ? `<span class="score-main${isHero ? ' hero-score' : ''}">${hasScore ? hScore : '–'}&thinsp;:&thinsp;${hasScore ? aScore : '–'}</span>`
    : `<span class="score-vs">VS</span><span class="score-time">${timeStr}</span>`;

  const calBtn = isHero
    ? `<button class="btn-cal-hero">+ Add to Calendar</button>`
    : `<button class="btn-cal">+ Cal</button>`;

  card.innerHTML = `
    <div class="${isHero ? 'hero-top' : 'card-top'}">
      <span class="badge badge-stage">${fmtStage(m.stage, m.group)}</span>
      ${badge}
    </div>
    <div class="teams-display">
      <div class="team-side">
        ${buildCrest(m.homeTeam, home, isHero)}
        <span class="team-name-hero">${home}</span>
        ${homeTLA ? `<span class="team-tla">${homeTLA}</span>` : ''}
      </div>
      <div class="score-center">${scoreHTML}</div>
      <div class="team-side">
        ${buildCrest(m.awayTeam, away, isHero)}
        <span class="team-name-hero">${away}</span>
        ${awayTLA ? `<span class="team-tla">${awayTLA}</span>` : ''}
      </div>
    </div>
    <div class="${isHero ? 'hero-footer' : 'card-bottom'}">
      ${m.venue
        ? isHero
          ? `<span class="venue-small">${m.venue}</span>`
          : `<span class="venue-chip">${m.venue}</span>`
        : '<span></span>'}
      ${calBtn}
    </div>`;

  card.querySelector(isHero ? '.btn-cal-hero' : '.btn-cal')
    .addEventListener('click', () => downloadICS([m], `wc2026-${home.replace(/\s/g,'-')}-vs-${away.replace(/\s/g,'-')}.ics`));

  return card;
}

function buildCrest(team, name, large) {
  const cls = `crest-wrap${large ? ' large' : ''}`;
  if (team?.crest) return `<div class="${cls}"><img class="team-crest" src="${team.crest}" alt="${name}" loading="lazy"></div>`;
  return `<div class="${cls}"><div class="team-crest-placeholder">${name.slice(0,2).toUpperCase()}</div></div>`;
}

// ── Filtering ─────────────────────────────────────────────────────────────────
function getFiltered() {
  const query = teamSearch.value.trim().toLowerCase();
  const stage = stageFilter.value;
  const today = todayStr();

  return allMatches.filter(m => {
    if (query) {
      const h = (m.homeTeam?.name || '').toLowerCase();
      const a = (m.awayTeam?.name || '').toLowerCase();
      if (!h.includes(query) && !a.includes(query)) return false;
    }
    if (stage && m.stage !== stage) return false;
    const s = normStatus(m.status);
    if (activeTab === 'live'     && s !== 'live')     return false;
    if (activeTab === 'upcoming' && s !== 'upcoming') return false;
    if (activeTab === 'finished' && s !== 'finished') return false;
    if (activeTab === 'today'    && matchDay(m) !== today) return false;
    return true;
  });
}

// ── ICS ───────────────────────────────────────────────────────────────────────
function generateICS(matches) {
  const stamp = fmtICS(new Date());
  const events = matches.map(m => {
    const start = new Date(m.utcDate);
    const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const home  = m.homeTeam?.name || 'TBD';
    const away  = m.awayTeam?.name || 'TBD';
    let desc    = fmtStage(m.stage, m.group);
    if (m.status === 'FINISHED') {
      const h = m.score?.fullTime?.home ?? '–';
      const a = m.score?.fullTime?.away ?? '–';
      desc += `\\nResult: ${home} ${h} – ${a} ${away}`;
    }
    return ['BEGIN:VEVENT', `UID:wc2026-${m.id}@worldcup2026`,
      `DTSTAMP:${stamp}`, `DTSTART:${fmtICS(start)}`, `DTEND:${fmtICS(end)}`,
      `SUMMARY:🏆 ${home} vs ${away}`, `DESCRIPTION:${desc}`,
      m.venue ? `LOCATION:${m.venue}` : '', 'END:VEVENT'].filter(Boolean).join('\r\n');
  });
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//World Cup 2026//EN',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:FIFA World Cup 2026',
    'X-WR-TIMEZONE:UTC', ...events, 'END:VCALENDAR'].join('\r\n');
}

function downloadICS(matches, filename) {
  const blob = new Blob([generateICS(matches)], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normStatus(raw) {
  if (['FINISHED','AWARDED'].includes(raw))            return 'finished';
  if (['IN_PLAY','PAUSED','HALFTIME'].includes(raw))   return 'live';
  return 'upcoming';
}

function fmtStage(stage, group) {
  const map = { GROUP_STAGE:'Group Stage', LAST_32:'R32', LAST_16:'R16',
    QUARTER_FINALS:'QF', SEMI_FINALS:'SF', THIRD_PLACE:'3rd Place', FINAL:'Final' };
  let l = map[stage] || stage;
  if (group) l += ` · ${group.replace('GROUP_','')}`;
  return l;
}

function fmtStageOnly(stage) {
  const map = { GROUP_STAGE:'Group Stage', LAST_32:'Round of 32', LAST_16:'Round of 16',
    QUARTER_FINALS:'Quarter-finals', SEMI_FINALS:'Semi-finals',
    THIRD_PLACE:'3rd Place Play-off', FINAL:'Final' };
  return map[stage] || stage;
}

function fmtICS(d) { return d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'; }
function todayStr() {
  const d  = new Date();
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
}
function matchDay(m) {
  const d = new Date(m.utcDate);
  // Use local date components so grouping matches what the user sees
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
}

function show(el) { el?.classList.remove('hidden'); }
function hide(el) { el?.classList.add('hidden'); }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function showError(msg) {
  hide(loadingEl);
  errorEl.innerHTML = `
    <p style="color:var(--red);font-size:.94rem;margin-bottom:14px">⚠️ ${msg}</p>
    <button class="btn-ghost" onclick="location.reload()">Retry</button>`;
  show(errorEl);
}
