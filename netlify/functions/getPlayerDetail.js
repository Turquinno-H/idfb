import pg from 'pg';

const { Client } = pg;

const API_HOST = 'api-football-v1.p.rapidapi.com';
const API_BASE = 'https://api-football-v1.p.rapidapi.com/v3';
const CACHE_HOURS = 24;

function currentSeason() {
  const now = new Date();
  return now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
}

function searchKey(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '_');
}

async function dbClient() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS player_cache (
      search_key  TEXT PRIMARY KEY,
      player_name TEXT        NOT NULL,
      data        JSONB       NOT NULL,
      cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function fromCache(client, key) {
  const r = await client.query(
    `SELECT data FROM player_cache
     WHERE search_key = $1
       AND cached_at > NOW() - INTERVAL '${CACHE_HOURS} hours'`,
    [key]
  );
  return r.rows[0]?.data ?? null;
}

async function saveToCache(client, key, name, data) {
  await client.query(
    `INSERT INTO player_cache (search_key, player_name, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (search_key)
     DO UPDATE SET data = EXCLUDED.data, cached_at = NOW()`,
    [key, name, JSON.stringify(data)]
  );
}

async function fetchFromApiFootball(name, apiKey) {
  const season = currentSeason();
  const url = `${API_BASE}/players?search=${encodeURIComponent(name)}&season=${season}`;

  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key':  apiKey,
      'x-rapidapi-host': API_HOST,
    },
  });

  if (!res.ok) throw new Error(`API-Football ${res.status}`);

  const json = await res.json();
  if (!json.response?.length) return null;

  // Pick best match: exact name match first, then first result
  const exact = json.response.find(
    r => r.player.name.toLowerCase() === name.toLowerCase()
  );
  return exact ?? json.response[0];
}

function mapToIdfb(raw) {
  const p  = raw.player;
  const st = raw.statistics?.[0] ?? {};

  return {
    id:          p.id,
    name:        p.name,
    firstname:   p.firstname,
    lastname:    p.lastname,
    age:         p.age,
    nationality: p.nationality,
    height:      p.height,
    weight:      p.weight,
    photo:       p.photo,
    injured:     p.injured ?? false,
    position:    st.games?.position  ?? null,
    team:        st.team?.name       ?? null,
    teamLogo:    st.team?.logo       ?? null,
    league:      st.league?.name     ?? null,
    season:      st.league?.season   ?? null,
    stats: {
      appearances:   st.games?.appearences ?? 0,
      goals:         st.goals?.total       ?? 0,
      assists:       st.goals?.assists     ?? 0,
      rating:        st.games?.rating ? parseFloat(st.games.rating).toFixed(1) : null,
      minutesPlayed: st.games?.minutes     ?? 0,
      yellowCards:   st.cards?.yellow      ?? 0,
      redCards:      st.cards?.red         ?? 0,
      passes:        st.passes?.total      ?? 0,
      passAccuracy:  st.passes?.accuracy   ?? null,
      tackles:       st.tackles?.total     ?? 0,
      dribbles:      st.dribbles?.success  ?? 0,
      shots:         st.shots?.total       ?? 0,
      shotsOnTarget: st.shots?.on          ?? 0,
    },
  };
}

export const handler = async (event) => {
  const JSON_CT = { 'Content-Type': 'application/json' };

  const API_KEY     = process.env.API_FOOTBALL_KEY;
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!API_KEY)      return { statusCode: 500, headers: JSON_CT, body: JSON.stringify({ error: 'API_FOOTBALL_KEY not configured' }) };
  if (!DATABASE_URL) return { statusCode: 500, headers: JSON_CT, body: JSON.stringify({ error: 'DATABASE_URL not configured' }) };

  const name = event.queryStringParameters?.name?.trim();
  if (!name) return { statusCode: 400, headers: JSON_CT, body: JSON.stringify({ error: 'name parameter required' }) };

  const key = searchKey(name);
  let client;

  try {
    client = await dbClient();
    await ensureTable(client);

    // 1. PostgreSQL önbellek kontrolü
    const cached = await fromCache(client, key);
    if (cached) {
      return {
        statusCode: 200,
        headers: { ...JSON_CT, 'X-Cache': 'HIT' },
        body: JSON.stringify(cached),
      };
    }

    // 2. API-Football'dan çek
    const raw = await fetchFromApiFootball(name, API_KEY);
    if (!raw) {
      return {
        statusCode: 404,
        headers: JSON_CT,
        body: JSON.stringify({ error: `"${name}" API-Football'da bulunamadı` }),
      };
    }

    // 3. IDFB formatına dönüştür
    const data = mapToIdfb(raw);

    // 4. PostgreSQL'e kaydet
    await saveToCache(client, key, data.name, data);

    return {
      statusCode: 200,
      headers: { ...JSON_CT, 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify(data),
    };

  } catch (err) {
    console.error('[getPlayerDetail]', err);
    return {
      statusCode: 500,
      headers: JSON_CT,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client?.end().catch(() => {});
  }
};