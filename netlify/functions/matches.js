const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  const loadBackup = () => {
    const backupPath = path.join(__dirname, 'matches-backup.json');
    if (fs.existsSync(backupPath)) {
      return JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    }
    return null;
  };

  if (!apiKey) {
    const backup = loadBackup();
    if (backup) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'Fallback-Cache' },
        body: JSON.stringify(backup),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured on server and no backup available.' }),
    };
  }

  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': apiKey },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'Live-API' },
        body: JSON.stringify(data),
      };
    }

    console.warn(`API returned status ${res.status}. Trying local backup.`);
    const backup = loadBackup();
    if (backup) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'Fallback-Cache' },
        body: JSON.stringify(backup),
      };
    }

    const body = await res.json().catch(() => ({}));
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
  } catch (err) {
    console.error('Fetch error:', err.message);
    const backup = loadBackup();
    if (backup) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'Fallback-Cache' },
        body: JSON.stringify(backup),
      };
    }
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to reach football-data.org.' }),
    };
  }
};
