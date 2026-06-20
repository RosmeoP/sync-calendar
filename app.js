let allMatches   = [];
let allStandings = [];
let activeTab    = 'all';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const mainContent    = document.getElementById('main-content');
const loadingEl      = document.getElementById('loading');
const errorEl        = document.getElementById('error-msg');
const scheduleEl     = document.getElementById('schedule');
const heroEl         = document.getElementById('hero-section');
const standingsEl    = document.getElementById('standings-section');
const standingsTable = document.getElementById('standings-table');
const groupSelect    = document.getElementById('group-select');
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

    if (!allMatches.length) throw new Error('No matches returned yet. The schedule may not be published.');

    if (standingsRes.status === 'fulfilled' && standingsRes.value.ok) {
      const sData = await standingsRes.value.json();
      allStandings = sData.standings || [];
    }

    hide(loadingEl);
    show(mainContent);

    renderStats();
    renderHero();
    renderStandings();
    renderSchedule();

    show(downloadBtn);

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
    downloadBtn.addEventListener('click',  () => {
      const visible = getFiltered();
      if (visible.length) downloadICS(visible, 'world-cup-2026.ics');
    });

    groupSelect.addEventListener('change', renderStandingsTable);

  } catch (err) {
    showError(err.message);
  }
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function renderStats() {
  const today = todayDateStr();
  let live = 0, todayCount = 0, upcoming = 0, finished = 0;

  allMatches.forEach(m => {
    const s = normStatus(m.status);
    if (s === 'live')     live++;
    if (s === 'finished') finished++;
    if (s === 'upcoming') upcoming++;
    if (matchDateStr(m) === today && s !== 'finished') todayCount++;
  });

  document.getElementById('stat-live').textContent     = live;
  document.getElementById('stat-today').textContent    = todayCount;
  document.getElementById('stat-upcoming').textContent = upcoming;
  document.getElementById('stat-finished').textContent = finished;
}

// ── Hero card ─────────────────────────────────────────────────────────────────
function renderHero() {
  const live = allMatches.filter(m => normStatus(m.status) === 'live');
  const featured = live.length
    ? live[0]
    : allMatches.find(m => normStatus(m.status) === 'upcoming');

  if (!featured) return;

  heroEl.innerHTML = '';
  const card = buildMatchCard(featured, true);
  heroEl.appendChild(card);
}

// ── Standings ─────────────────────────────────────────────────────────────────
function renderStandings() {
  if (!allStandings.length) return;

  const groupStandings = allStandings.filter(s => s.type === 'TOTAL');
  if (!groupStandings.length) return;

  groupSelect.innerHTML = '';
  groupStandings.forEach((g, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = g.group ? g.group.replace('GROUP_', 'Group ') : `Stage ${i + 1}`;
    groupSelect.appendChild(opt);
  });

  show(standingsEl);
  renderStandingsTable();
}

function renderStandingsTable() {
  const idx  = parseInt(groupSelect.value, 10) || 0;
  const data = allStandings.filter(s => s.type === 'TOTAL')[idx];
  if (!data) return;

  const rows = (data.table || []).map((row, i) => {
    const crest = row.team?.crest
      ? `<img class="st-crest" src="${row.team.crest}" alt="${row.team.name}" loading="lazy" />`
      : '<div class="st-crest" style="background:var(--surface3)"></div>';

    const rankClass = i < 2 ? 'st-rank top2' : 'st-rank';

    return `<tr>
      <td class="${rankClass}">${row.position}</td>
      <td><div class="st-team">${crest}<span class="st-name">${row.team?.name || ''}</span></div></td>
      <td>${row.playedGames}</td>
      <td>${row.won}</td>
      <td>${row.draw}</td>
      <td>${row.lost}</td>
      <td>${row.goalsFor}</td>
      <td>${row.goalsAgainst}</td>
      <td class="st-pts">${row.points}</td>
    </tr>`;
  }).join('');

  standingsTable.innerHTML = `
    <table class="standings-table">
      <thead><tr>
        <th>#</th><th style="text-align:left">Team</th>
        <th>P</th><th>W</th><th>D</th><th>L</th>
        <th>GF</th><th>GA</th><th>Pts</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── Schedule ──────────────────────────────────────────────────────────────────
function renderSchedule() {
  scheduleEl.innerHTML = '';
  const matches = getFiltered();

  if (!matches.length) {
    scheduleEl.innerHTML = '<p class="no-matches">No matches found.</p>';
    return;
  }

  const groups = {};
  matches.forEach(m => {
    const key = dateGroupKey(m);
    if (!groups[key]) groups[key] = { label: dateGroupLabel(m), matches: [] };
    groups[key].matches.push(m);
  });

  Object.values(groups).forEach(({ label, matches: list }) => {
    const g = document.createElement('div');
    g.className = 'date-group';

    const dl = document.createElement('div');
    dl.className = 'date-label';
    dl.textContent = label;
    g.appendChild(dl);

    list.forEach(m => g.appendChild(buildMatchCard(m, false)));
    scheduleEl.appendChild(g);
  });
}

// ── Card builder ──────────────────────────────────────────────────────────────
function buildMatchCard(m, isHero) {
  const card = document.createElement('div');
  card.className = isHero ? 'hero-card' : 'match-card';

  const st      = normStatus(m.status);
  const home    = m.homeTeam?.name  || 'TBD';
  const away    = m.awayTeam?.name  || 'TBD';
  const homeTLA = m.homeTeam?.tla   || '';
  const awayTLA = m.awayTeam?.tla   || '';

  if (st === 'live') card.classList.add('is-live');

  const matchDate  = new Date(m.utcDate);
  const timeStr    = matchDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const homeScore  = m.score?.fullTime?.home;
  const awayScore  = m.score?.fullTime?.away;
  const hasScore   = homeScore !== null && homeScore !== undefined;

  const stageLabel = fmtStage(m.stage, m.group);
  const badgeHTML  = buildBadge(st, m.status);

  const homeCrestHTML = buildCrest(m.homeTeam, home, isHero);
  const awayCrestHTML = buildCrest(m.awayTeam, away, isHero);

  let scoreHTML;
  if (st === 'live' || st === 'finished') {
    scoreHTML = `<span class="score-main${isHero ? ' hero-score' : ''}">${hasScore ? homeScore : '-'}&nbsp;:&nbsp;${hasScore ? awayScore : '-'}</span>`;
  } else {
    scoreHTML = `<span class="score-vs">VS</span><span class="score-time">${timeStr}</span>`;
  }

  const calBtn = isHero
    ? `<button class="btn-cal-hero">+ Add to Calendar</button>`
    : `<button class="btn-cal">+ Cal</button>`;

  const topSection = isHero ? `
    <div class="hero-top">
      <span class="badge badge-stage">${stageLabel}</span>
      ${badgeHTML}
    </div>` : `
    <div class="card-top">
      <span class="badge badge-stage">${stageLabel}</span>
      ${badgeHTML}
    </div>`;

  const bottomSection = isHero ? `
    <div class="hero-footer">
      <span class="venue-small">${m.venue || ''}</span>
      ${calBtn}
    </div>` : `
    <div class="card-bottom">
      ${m.venue ? `<span class="venue-chip">${m.venue}</span>` : '<span></span>'}
      ${calBtn}
    </div>`;

  card.innerHTML = `
    ${topSection}
    <div class="teams-display">
      <div class="team-side">
        ${homeCrestHTML}
        <span class="team-name-hero">${home}</span>
        ${homeTLA ? `<span class="team-tla">${homeTLA}</span>` : ''}
      </div>
      <div class="score-center">
        ${scoreHTML}
      </div>
      <div class="team-side away">
        ${awayCrestHTML}
        <span class="team-name-hero">${away}</span>
        ${awayTLA ? `<span class="team-tla">${awayTLA}</span>` : ''}
      </div>
    </div>
    ${bottomSection}
  `;

  card.querySelector(isHero ? '.btn-cal-hero' : '.btn-cal').addEventListener('click', () => {
    downloadICS([m], `wc2026-${home.replace(/\s/g, '-')}-vs-${away.replace(/\s/g, '-')}.ics`);
  });

  return card;
}

function buildCrest(team, name, large) {
  const cls = `crest-wrap${large ? ' large' : ''}`;
  if (team?.crest) {
    return `<div class="${cls}"><img class="team-crest" src="${team.crest}" alt="${name}" loading="lazy" /></div>`;
  }
  const initials = name.slice(0, 2).toUpperCase();
  return `<div class="${cls}"><div class="team-crest-placeholder">${initials}</div></div>`;
}

function buildBadge(st, raw) {
  if (st === 'live')     return `<span class="badge badge-live"><span class="badge-live-dot"></span> LIVE</span>`;
  if (st === 'finished') return `<span class="badge badge-ft">FT</span>`;
  if (raw === 'POSTPONED') return `<span class="badge badge-ft">Postponed</span>`;
  return `<span class="badge badge-upcoming">Upcoming</span>`;
}

// ── Filtering ─────────────────────────────────────────────────────────────────
function getFiltered() {
  const query = teamSearch.value.trim().toLowerCase();
  const stage = stageFilter.value;
  const today = todayDateStr();

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
    if (activeTab === 'today'    && matchDateStr(m) !== today) return false;

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
    const stage = fmtStage(m.stage, m.group);
    let desc = stage;
    if (m.status === 'FINISHED') {
      const h = m.score?.fullTime?.home ?? '-';
      const a = m.score?.fullTime?.away ?? '-';
      desc += `\\nResult: ${home} ${h} - ${a} ${away}`;
    }
    return [
      'BEGIN:VEVENT',
      `UID:wc2026-${m.id}@worldcup2026`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${fmtICS(start)}`,
      `DTEND:${fmtICS(end)}`,
      `SUMMARY:🏆 ${home} vs ${away}`,
      `DESCRIPTION:${desc}`,
      m.venue ? `LOCATION:${m.venue}` : '',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//World Cup 2026//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:FIFA World Cup 2026',
    'X-WR-TIMEZONE:UTC',
    ...events, 'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(matches, filename) {
  const blob = new Blob([generateICS(matches)], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normStatus(raw) {
  if (['FINISHED', 'AWARDED'].includes(raw))            return 'finished';
  if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(raw)) return 'live';
  return 'upcoming';
}

function fmtStage(stage, group) {
  const map = {
    GROUP_STAGE: 'Group Stage', LAST_32: 'R32', LAST_16: 'R16',
    QUARTER_FINALS: 'QF', SEMI_FINALS: 'SF', THIRD_PLACE: '3rd Place', FINAL: 'Final',
  };
  let label = map[stage] || stage;
  if (group) label += ` · ${group.replace('GROUP_', '')}`;
  return label;
}

function fmtICS(d) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function matchDateStr(m) {
  return new Date(m.utcDate).toISOString().slice(0, 10);
}

function dateGroupKey(m) {
  return new Date(m.utcDate).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function dateGroupLabel(m) {
  return new Date(m.utcDate).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function showError(msg) {
  hide(loadingEl);
  errorEl.innerHTML = `
    <p style="color:#ff3b3b;font-size:0.95rem;margin-bottom:14px;">⚠️ ${msg}</p>
    <button class="btn-ghost" onclick="location.reload()">Retry</button>
  `;
  show(errorEl);
}
