const fs   = require('fs');
const path = require('path');

// ── ICS helpers ───────────────────────────────────────────────────────────────
function fmtICS(d) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function fmtStage(stage, group) {
  const map = {
    GROUP_STAGE: 'Group Stage', LAST_32: 'R32', LAST_16: 'R16',
    QUARTER_FINALS: 'QF', SEMI_FINALS: 'SF', THIRD_PLACE: '3rd Place', FINAL: 'Final',
  };
  let l = map[stage] || stage;
  if (group) l += ` · ${group.replace('GROUP_', '')}`;
  return l;
}

function generateICS(matches, opts = {}) {
  const { emoji = '🏆', color = '#007AFF', includeScores = false } = opts;
  const stamp  = fmtICS(new Date());
  const prefix = emoji && emoji !== 'none' ? `${emoji} ` : '';

  const events = matches.map(m => {
    const start = new Date(m.utcDate);
    const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const home  = m.homeTeam?.name || 'TBD';
    const away  = m.awayTeam?.name || 'TBD';
    let desc    = fmtStage(m.stage, m.group);
    let summary = `${prefix}${home} vs ${away}`;

    if (m.status === 'FINISHED' || m.status === 'AWARDED') {
      const h = m.score?.fullTime?.home ?? '–';
      const a = m.score?.fullTime?.away ?? '–';
      desc += `\\nResult: ${home} ${h} – ${a} ${away}`;
      if (includeScores) summary = `${prefix}${home} ${h}–${a} ${away}`;
    }

    return [
      'BEGIN:VEVENT',
      `UID:wc2026-${m.id}@worldcup2026`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${fmtICS(start)}`,
      `DTEND:${fmtICS(end)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      m.venue ? `LOCATION:${m.venue}` : '',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//World Cup 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FIFA World Cup 2026',
    `X-APPLE-CALENDAR-COLOR:${color}`,
    'X-WR-TIMEZONE:UTC',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const params        = event.queryStringParameters || {};
  const emoji         = params.emoji  ?? '🏆';
  const color         = params.color  ?? '#007AFF';
  const includeScores = params.scores === 'true';

  // Load match data
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  const loadBackup = () => {
    const p = path.join(__dirname, 'matches-backup.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };

  let matchData = null;

  if (apiKey) {
    try {
      const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': apiKey },
      });
      if (res.ok) matchData = await res.json();
    } catch {}
  }

  if (!matchData) matchData = loadBackup();
  if (!matchData) {
    return { statusCode: 503, body: 'Match data unavailable.' };
  }

  const matches = matchData.matches || [];
  const ics     = generateICS(matches, { emoji, color, includeScores });

  return {
    statusCode: 200,
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="world-cup-2026.ics"',
      'Cache-Control':       'public, max-age=3600',
    },
    body: ics,
  };
};
