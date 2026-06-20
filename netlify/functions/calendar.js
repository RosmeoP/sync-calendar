const fs   = require('fs');
const path = require('path');

// ── Flag helpers ──────────────────────────────────────────────────────────────
// Converts a 2-letter ISO country code to its flag emoji
function isoToFlag(iso2) {
  return iso2.toUpperCase().split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('');
}

// TLA (football-data.org) → ISO 3166-1 alpha-2
const TLA_TO_ISO = {
  ARG:'AR', AUS:'AU', AUT:'AT', BEL:'BE', BOL:'BO', BRA:'BR',
  CAN:'CA', CHI:'CL', CMR:'CM', COD:'CD', COL:'CO', CIV:'CI',
  CRC:'CR', CRO:'HR', CZE:'CZ', DEN:'DK', ECU:'EC', EGY:'EG',
  ENG:'GB', ESP:'ES', FRA:'FR', GER:'DE', GHA:'GH', GRE:'GR',
  GTM:'GT', HND:'HN', HUN:'HU', IDN:'ID', IRN:'IR', IRQ:'IQ',
  ITA:'IT', JAM:'JM', JPN:'JP', KOR:'KR', KSA:'SA', MAR:'MA',
  MEX:'MX', MLI:'ML', MOR:'MA', NED:'NL', NGA:'NG', NOR:'NO',
  NZL:'NZ', PAK:'PK', PAN:'PA', PAR:'PY', PER:'PE', POL:'PL',
  POR:'PT', QAT:'QA', RSA:'ZA', ROU:'RO', SAU:'SA', SCO:'GB',
  SEN:'SN', SRB:'RS', SUI:'CH', SVK:'SK', SWE:'SE', TAN:'TZ',
  TUN:'TN', TUR:'TR', UKR:'UA', URU:'UY', USA:'US', VEN:'VE',
  WAL:'GB', ZIM:'ZW',
};

function teamFlag(team) {
  const tla = team?.tla;
  if (!tla) return '';
  const iso = TLA_TO_ISO[tla.toUpperCase()];
  if (!iso) return '';
  return isoToFlag(iso);
}

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
    const home     = m.homeTeam?.name || 'TBD';
    const away     = m.awayTeam?.name || 'TBD';
    const homeFlag = teamFlag(m.homeTeam);
    const awayFlag = teamFlag(m.awayTeam);
    const homePart = homeFlag ? `${homeFlag} ${home}` : home;
    const awayPart = awayFlag ? `${awayFlag} ${away}` : away;
    let desc    = fmtStage(m.stage, m.group);
    let summary = `${prefix}${homePart} vs ${awayPart}`;

    if (m.status === 'FINISHED' || m.status === 'AWARDED') {
      const h = m.score?.fullTime?.home ?? '–';
      const a = m.score?.fullTime?.away ?? '–';
      desc += `\\nResult: ${home} ${h} – ${a} ${away}`;
      if (includeScores) summary = `${prefix}${homePart} ${h}–${a} ${awayPart}`;
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
