import { PLAYERS, COACHES } from './data.js';

const POS_TR = {
  GOALKEEPER: 'Kaleci',
  DEFENDER:   'Defans',
  MIDFIELDER: 'Orta Saha',
  FORWARD:    'Forvet',
  ATTACKER:   'Forvet',
};

async function fetchLiveData(competition = 'PL') {
  try {
    const res = await fetch(`/.netlify/functions/getPlayers?competition=${competition}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    console.log(`[IDFB API] ${json.competition} (${json.season}): ${json.total} oyuncu`);
    return json;
  } catch (err) {
    console.warn('[IDFB API] Bağlantı hatası:', err.message);
    return null;
  }
}

function renderApiSection(json) {
  const section = document.getElementById('apiSection');
  if (!section) return;

  if (!json || !json.players?.length) {
    section.innerHTML = '';
    return;
  }

  const { competition, season, players } = json;

  section.innerHTML = `
    <div class="sec-label">
      ⚡ ${competition}${season ? ' ' + season : ''} — Canlı Kadro
      <span style="font-weight:500;font-size:9px;color:var(--t3);letter-spacing:0">${players.length} oyuncu</span>
    </div>
    <div class="card-grid" id="apiCardGrid"></div>`;

  const grid = document.getElementById('apiCardGrid');
  players.forEach(p => {
    const lastName = p.name.split(' ').pop();
    const pos = POS_TR[p.position] || p.position || 'Oyuncu';
    const d = document.createElement('div');
    d.className = 'pc';
    d.onclick = () => showApiPlayer(p);
    d.innerHTML = `
      <div class="pc-cat">${pos}</div>
      <div class="pc-nick">${lastName}</div>
      <div style="font-size:10px;color:var(--t3);margin-top:8px;font-weight:500">${p.name}</div>
      <div style="font-size:10px;color:var(--gold);margin-top:2px">${p.teamShort}</div>`;
    grid.appendChild(d);
  });
}

function apiProfileShell(p) {
  const pos = POS_TR[p.position] || p.position || '—';
  const age = p.age ? `${p.age} yaş` : '—';
  const dob = p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('tr-TR') : '—';
  document.getElementById('homeView').classList.remove('show');
  document.getElementById('profileView').classList.add('show');
  document.getElementById('backLabel').textContent = 'Oyunculara dön';
  document.getElementById('scoutHero').innerHTML = `
    <div class="scout-hero-main" style="padding-bottom:28px">
      <div class="scout-avatar-col">
        <div class="scout-avatar" style="background:#1a1a1a;font-size:42px" id="apiAvatarBox">
          ${p.teamCrest ? `<img src="${p.teamCrest}" style="width:60px;height:60px;object-fit:contain" onerror="this.replaceWith('⚽')">` : '⚽'}
        </div>
        <div class="scout-overall" id="apiOverallBox" style="font-size:11px;font-weight:800;color:#000;text-align:center;padding:4px">
          ${pos.slice(0, 3).toUpperCase()}
        </div>
      </div>
      <div class="scout-info-col">
        <div style="font-size:10px;font-weight:700;color:var(--gold);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">${p.league}</div>
        <div class="scout-name">${p.name}</div>
        <div class="scout-role" id="apiRoleBox">${p.team} · <span class="hl">${pos}</span></div>
        <div class="scout-kpis" id="apiKpisBox" style="margin-top:14px">
          <div class="scout-kpi-pill"><i class="ti ti-flag"></i>${p.nationality || '—'}</div>
          <div class="scout-kpi-pill"><i class="ti ti-cake"></i>${age} (${dob})</div>
          <div class="scout-kpi-pill"><i class="ti ti-shirt"></i>${p.teamShort || p.team}</div>
        </div>
      </div>
    </div>`;
  document.getElementById('scoutStatsBar').innerHTML = '';
  document.getElementById('scoutAiBanner').innerHTML = '';
  document.getElementById('stabs').innerHTML = '';
}

function renderApiRichProfile(p, d) {
  // Upgrade avatar to real photo
  if (d.photo) {
    const box = document.getElementById('apiAvatarBox');
    if (box) box.innerHTML = `<img src="${d.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:4px" onerror="this.replaceWith('⚽')">`;
  }
  // Upgrade role
  const pos = POS_TR[d.position] || d.position || '—';
  const roleBox = document.getElementById('apiRoleBox');
  if (roleBox) roleBox.innerHTML = `${d.team || p.team} · <span class="hl">${pos}</span>`;
  // Upgrade KPIs
  const kpisBox = document.getElementById('apiKpisBox');
  if (kpisBox) kpisBox.innerHTML = `
    <div class="scout-kpi-pill"><i class="ti ti-flag"></i>${d.nationality || p.nationality || '—'}</div>
    <div class="scout-kpi-pill"><i class="ti ti-cake"></i>${d.age ? d.age + ' yaş' : '—'}</div>
    <div class="scout-kpi-pill"><i class="ti ti-ruler"></i>${d.height || '—'}</div>
    <div class="scout-kpi-pill"><i class="ti ti-weight"></i>${d.weight || '—'}</div>`;

  // Stats bar
  const st = d.stats;
  document.getElementById('scoutStatsBar').innerHTML = [
    { val: st.appearances,   lbl: 'Maç'         },
    { val: st.goals,         lbl: 'Gol'          },
    { val: st.assists,       lbl: 'Asist'        },
    { val: st.rating || '—', lbl: 'Puan'         },
    { val: st.minutesPlayed, lbl: 'Dakika'       },
    { val: st.yellowCards,   lbl: 'Sarı Kart'    },
  ].map(i => `
    <div class="scout-stat-item">
      <div class="scout-stat-val" style="color:${i.lbl==='Puan'?'var(--gold)':'var(--t1)'}">${i.val}</div>
      <div class="scout-stat-lbl">${i.lbl}</div>
    </div>`).join('');

  // Content
  document.getElementById('pcontent').innerHTML = `
    <div class="card">
      <div class="card-head"><i class="ti ti-chart-bar"></i>Sezon İstatistikleri${d.season ? ' — ' + d.season : ''}</div>
      ${[
        ['Pas',           st.passes,        st.passes],
        ['İsabetli Şut',  st.shotsOnTarget, st.shots || 1],
        ['Dribling',      st.dribbles,      Math.max(st.dribbles, 10)],
        ['Top Kapma',     st.tackles,       Math.max(st.tackles, 10)],
      ].map(([lbl, val, max]) => `
        <div class="pbar-row">
          <div class="pbar-label">${lbl}</div>
          <div class="pbar-track"><div class="pbar-fill" style="width:${Math.min(100,Math.round(val/max*100))}%;background:var(--gold)"></div></div>
          <div class="pbar-val">${val}</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-head"><i class="ti ti-info-circle"></i>Oyuncu Bilgisi</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
        ${[
          ['Tam İsim',   `${d.firstname || ''} ${d.lastname || ''}`.trim() || d.name],
          ['Milliyet',   d.nationality || '—'],
          ['Boy',        d.height || '—'],
          ['Kilo',       d.weight || '—'],
          ['Lig',        d.league || p.league || '—'],
          ['Takım',      d.team || p.team || '—'],
          ['Yaralanma',  d.injured ? '🔴 Yaralı' : '🟢 Sağlıklı'],
          ['Sezon',      d.season || '—'],
        ].map(([k, v]) => `
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:10px 12px">
            <div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">${k}</div>
            <div style="font-weight:600;color:var(--t1)">${v}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

async function showApiPlayer(p) {
  // Temel kabuğu hemen göster (blocking değil)
  apiProfileShell(p);

  document.getElementById('scoutAiBanner').innerHTML = `
    <div style="padding:16px 28px;color:var(--t3);font-size:13px;display:flex;align-items:center;gap:10px">
      <i class="ti ti-loader ti-spin" style="font-size:18px;color:var(--gold)"></i>
      API-Football'dan veri çekiliyor…
    </div>`;
  document.getElementById('pcontent').innerHTML = '';

  let detail = null;
  try {
    const res = await fetch(`/.netlify/functions/getPlayerDetail?name=${encodeURIComponent(p.name)}`);
    if (res.ok) detail = await res.json();
    else console.warn('[IDFB] getPlayerDetail:', res.status, await res.text());
  } catch (e) {
    console.warn('[IDFB] getPlayerDetail hatası:', e.message);
  }

  document.getElementById('scoutAiBanner').innerHTML = '';

  if (!detail || detail.error) {
    // Temel profille devam et
    document.getElementById('pcontent').innerHTML = `
      <div class="card" style="color:var(--t3);font-size:13px;text-align:center;padding:32px">
        ${detail?.error ?? 'API verisi alınamadı'} — Temel profil gösteriliyor.
      </div>`;
    return;
  }

  renderApiRichProfile(p, detail);
}

const PAGE = document.body.dataset.page || 'home';
let currentLeague = 'all';
let currentData = null;
let chartInst = null;
let radarInst = null;

const BACK_LABELS = {
  home: 'Öne Çıkan İsimlere dön',
  players: 'Oyunculara dön',
  coaches: 'Teknik Direktörlere dön'
};

function getAllData() {
  if (PAGE === 'players') return PLAYERS;
  if (PAGE === 'coaches') return COACHES;
  return [...PLAYERS, ...COACHES].sort((a, b) => b.fanScore - a.fanScore);
}

function applyFilters() {
  let data = getAllData();
  if (currentLeague !== 'all') {
    data = data.filter(p => p.league === currentLeague);
  }
  renderCards(data);
}

function filterByLeague(league, el) {
  currentLeague = league;
  document.querySelectorAll('.league-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

function renderCards(data) {
  const g = document.getElementById('cardGrid');
  g.innerHTML = '';
  data.forEach(p => {
    const d = document.createElement('div');
    d.className = 'pc';
    d.onclick = () => openProfile(p);
    d.innerHTML = `
      <div class="pc-cat">${p.type === 'player' ? 'OYUNCU' : 'TEKNİK DIREKTÖR'}</div>
      <div class="pc-nick">${p.name}</div>`;
    g.appendChild(d);
  });
}

function handleSearch(v) {
  if (v.length < 2) { applyFilters(); return; }
  renderCards(getAllData().filter(p => p.name.toLowerCase().includes(v.toLowerCase())));
}

function goHome() {
  document.getElementById('homeView').classList.add('show');
  document.getElementById('profileView').classList.remove('show');
}

function exportPDF() {
  window.print();
}

const P_TABS = ['Genel Bakış', 'Kariyer', 'Kimya', 'Kupa Dolabı', 'Dönüm Noktaları'];
const C_TABS = ['Genel Bakış', 'Formasyon & Kariyer', 'Oyuncu Kimyası', 'Kupa Dolabı'];

function openProfile(p) {
  currentData = p;
  document.getElementById('homeView').classList.remove('show');
  document.getElementById('profileView').classList.add('show');
  document.getElementById('backLabel').textContent = BACK_LABELS[PAGE] || 'Geri dön';

  const hero = document.getElementById('scoutHero');
  hero.style.background = `
    radial-gradient(ellipse 70% 90% at -8% 50%, ${p.bannerColor}22 0%, transparent 65%),
    radial-gradient(ellipse 50% 60% at 108% -10%, ${p.bannerColor}14 0%, transparent 60%),
    linear-gradient(160deg, #1E293B 0%, #0F172A 100%)`;

  const av = document.getElementById('scoutAvatar');
  av.style.background = `linear-gradient(135deg, ${p.avatarBg}, ${p.avatarBg}cc)`;
  av.style.color = p.avatarText;
  av.innerHTML = `<i class="ti ${p.icon}"></i>`;

  document.getElementById('scoutOverall').innerHTML =
    `<span class="scout-overall-num">${p.overall}</span><span class="scout-overall-lbl">OVR</span>`;

  document.getElementById('scoutTopBadges').innerHTML =
    p.badges.map(b => `<span class="badge ${b.t}">${b.l}</span>`).join('');

  document.getElementById('scoutName').textContent = p.name;
  document.getElementById('scoutRole').innerHTML =
    `<span class="hl">${p.nickname}</span> &nbsp;·&nbsp; ${p.sub}`;

  document.getElementById('scoutKpis').innerHTML = [
    { icon: 'ti-map-pin', text: p.role },
    { icon: 'ti-flag',    text: p.nat }
  ].map(k => `<div class="scout-kpi-pill"><i class="ti ${k.icon}"></i>${k.text}</div>`).join('');

  document.getElementById('scoutValueCard').innerHTML =
    `<div class="scout-value-label">${p.type === 'player' ? 'Piyasa Değeri' : 'Kariyer Değeri'}</div>
     <div class="scout-value-num">${p.marketValue || '—'}</div>`;

  document.getElementById('scoutFanCard').innerHTML =
    `<div class="scout-fan-label">Taraftar Puanı</div>
     <div class="scout-fan-num" style="color:${p.bannerColor}">${p.fanScore}</div>`;

  document.getElementById('scoutStatsBar').innerHTML =
    p.stats.map(s => `
      <div class="scout-stat-item">
        <div class="scout-stat-val">${s.v}</div>
        <div class="scout-stat-lbl">${s.l}</div>
      </div>`).join('');

  document.getElementById('scoutAiBanner').innerHTML =
    `<div class="scout-ai-icon"><i class="ti ti-brain"></i></div>
     <div class="scout-ai-text">
       <div class="scout-ai-label">YZ Skaut Özeti</div>
       <div class="scout-ai-summary">${p.aiStrong}</div>
       <div class="scout-ai-chips">${p.aiStrong_chips.map(x => `<span class="scout-ai-chip">${x}</span>`).join('')}</div>
     </div>`;

  const tabs = p.type === 'player' ? P_TABS : C_TABS;
  document.getElementById('stabs').innerHTML =
    tabs.map((t, i) => `<div class="stab${i === 0 ? ' on' : ''}" onclick="switchTab(${i},this)">${t}</div>`).join('');
  renderTab(0);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchTab(idx, el) {
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  renderTab(idx);
}

function renderTab(idx) {
  const p = currentData;
  const c = document.getElementById('pcontent');
  c.innerHTML = '';
  if (chartInst) { chartInst.destroy(); chartInst = null; }
  if (radarInst) { radarInst.destroy(); radarInst = null; }
  p.type === 'player' ? renderP(p, idx, c) : renderC(p, idx, c);
}

/* ── HELPERS ── */
function bars(perfs) {
  return perfs.map(r => `
    <div class="pbar-row">
      <div class="pbar-label">${r.label}</div>
      <div class="pbar-track"><div class="pbar-fill" style="width:${r.val}%;background:${r.color}"></div></div>
      <div class="pbar-val">${r.val}</div>
    </div>`).join('');
}

function tlHTML(arr) {
  return arr.map((t, i) => `
    <div class="tl-row">
      <div class="tl-yr">${t.yr}</div>
      <div class="tl-dot-col">
        <div class="tl-dot"></div>
        ${i < arr.length - 1 ? '<div class="tl-vline"></div>' : ''}
      </div>
      <div class="tl-body">
        <div class="tl-club">${t.title}</div>
        <div class="tl-desc">${t.desc}</div>
        <div class="tl-tag"><i class="ti ti-star" style="font-size:9px"></i>${t.tag}</div>
      </div>
    </div>`).join('');
}

function chemHTML(ch) {
  return ch.map(c => `
    <div class="chem-row">
      <div class="chem-init" style="background:${c.bg};color:${c.tc}">${c.initials}</div>
      <div class="chem-info">
        <div class="chem-name">${c.name}</div>
        <div class="chem-pos">${c.pos}</div>
        <div class="chem-track"><div class="chem-fill" style="width:${c.pct}%"></div></div>
      </div>
      <div class="chem-pct">${c.pct}%</div>
    </div>`).join('');
}

function trophyHTML(arr) {
  return `<div class="card">
    <div class="card-head"><i class="ti ti-trophy"></i>Kupa Dolabı <span class="card-head-count">${arr.length} Kupa</span></div>
    <div class="trophy-showcase">
      ${arr.map(t => `
        <div class="trophy-showcase-item">
          <div class="trophy-showcase-icon"><i class="ti ${t.icon}"></i></div>
          <div class="trophy-showcase-title">${t.title}</div>
          <div class="trophy-showcase-meta">${t.club}</div>
          <div class="trophy-showcase-yr">${t.yr}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

function aiHTML(p) {
  return `<div class="card">
    <div class="card-head"><i class="ti ti-brain"></i>Yapay Zekâ Analizi</div>
    <div class="ai-block" style="background:rgba(52,211,153,0.08)">
      <div class="ai-label" style="color:#34D399"><i class="ti ti-thumb-up"></i>Güçlü Yönler</div>
      <div class="ai-text" style="color:#94A3B8">${p.aiStrong}</div>
      <div class="ai-chips">${p.aiStrong_chips.map(x => `<span class="ai-chip" style="background:rgba(52,211,153,0.12);color:#34D399">${x}</span>`).join('')}</div>
    </div>
    <div class="ai-block" style="background:rgba(239,68,68,0.08)">
      <div class="ai-label" style="color:#FC8181"><i class="ti ti-alert-triangle"></i>Geliştirilebilir Yönler</div>
      <div class="ai-text" style="color:#94A3B8">${p.aiWeak}</div>
      <div class="ai-chips">${p.aiWeak_chips.map(x => `<span class="ai-chip" style="background:rgba(239,68,68,0.12);color:#FC8181">${x}</span>`).join('')}</div>
    </div>
    <div class="ai-block" style="background:rgba(99,102,241,0.08)">
      <div class="ai-label" style="color:#A5B4FC"><i class="ti ti-telescope"></i>Gelecek Tahmini</div>
      <div class="ai-text" style="color:#94A3B8">${p.aiFuture}</div>
    </div>
  </div>`;
}

function msHTML(ms) {
  return `<div class="card">
    <div class="card-head"><i class="ti ti-flag-2"></i>Dönüm Noktaları</div>
    <div class="ms-list">
      ${ms.map(m => `
        <div class="ms-item">
          <div class="ms-icon" style="background:${m.bg}"><i class="ti ${m.icon}" style="color:${m.ic};font-size:17px"></i></div>
          <div>
            <div class="ms-title">${m.title}</div>
            <div class="ms-desc">${m.desc}</div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

const CHART_OPTS = {
  grid:  { color: 'rgba(255,255,255,0.06)' },
  ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } }
};

function makeChart(id, p) {
  setTimeout(() => {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (id === 'pc') {
      chartInst = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Ağu', 'Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar'],
          datasets: [{
            label: 'Puan', data: [6.8, 7.2, 7.8, 8.1, 7.5, 8.4, 8.7, 9.1],
            borderColor: p.bannerColor, backgroundColor: p.bannerColor + '22',
            tension: 0.4, fill: true, pointBackgroundColor: p.bannerColor, pointRadius: 4, borderWidth: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 5, max: 10, grid: CHART_OPTS.grid, ticks: CHART_OPTS.ticks },
            x: { grid: { display: false }, ticks: CHART_OPTS.ticks }
          }
        }
      });
    } else {
      chartInst = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [{ label: 'Galibiyet', data: [28, 31, 24, 35, 38, 41, 33], backgroundColor: p.bannerColor + 'cc', borderRadius: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: CHART_OPTS.ticks },
            y: { grid: CHART_OPTS.grid,   ticks: CHART_OPTS.ticks }
          }
        }
      });
    }
  }, 50);
}

function makeRadarChart(id, p) {
  setTimeout(() => {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (radarInst) { radarInst.destroy(); radarInst = null; }
    radarInst = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: p.perfs.map(r => r.label),
        datasets: [{
          label: 'Performans',
          data: p.perfs.map(r => r.val),
          borderColor: p.bannerColor,
          backgroundColor: p.bannerColor + '28',
          borderWidth: 2.5,
          pointBackgroundColor: p.bannerColor,
          pointBorderColor: '#0F172A',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.07)' },
            angleLines: { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#64748B', font: { family: 'Inter', size: 9 }, backdropColor: 'transparent', stepSize: 25, display: false },
            pointLabels: { color: '#CBD5E1', font: { family: 'Inter', size: 11, weight: '600' } }
          }
        }
      }
    });
  }, 60);
}

/* ── PLAYER TABS ── */
function renderP(p, idx, c) {
  if (idx === 0) {
    c.innerHTML = `
      <div class="overview-grid">
        <div class="card">
          <div class="card-head"><i class="ti ti-chart-radar"></i>Performans Radarı</div>
          <div class="radar-wrap"><canvas id="radarChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><i class="ti ti-sliders"></i>Özellik Detayları</div>
          ${bars(p.perfs)}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="ti ti-chart-line"></i>Sezon Grafiği</div>
        <div style="position:relative;width:100%;height:190px"><canvas id="pc"></canvas></div>
      </div>`;
    makeRadarChart('radarChart', p);
    makeChart('pc', p);
  } else if (idx === 1) {
    c.innerHTML = `<div class="card"><div class="card-head"><i class="ti ti-timeline"></i>Kariyer Zaman Çizelgesi</div><div class="tl">${tlHTML(p.timeline)}</div></div>`;
  } else if (idx === 2) {
    c.innerHTML = `<div class="card"><div class="card-head"><i class="ti ti-users"></i>En İyi Kimya Kurduğu Oyuncular</div><div class="chem-list">${chemHTML(p.chemistry)}</div></div>`;
  } else if (idx === 3) {
    c.innerHTML = trophyHTML(p.trophies);
  } else if (idx === 4) {
    c.innerHTML = msHTML(p.milestones);
  }
}

/* ── COACH TABS ── */
function renderC(p, idx, c) {
  if (idx === 0) {
    c.innerHTML = `
      <div class="overview-grid">
        <div class="card">
          <div class="card-head"><i class="ti ti-chart-radar"></i>Direktör Profili</div>
          <div class="radar-wrap"><canvas id="radarChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><i class="ti ti-sliders"></i>Özellik Detayları</div>
          ${bars(p.perfs)}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="ti ti-chart-bar"></i>Galibiyet Trendi</div>
        <div style="position:relative;width:100%;height:190px"><canvas id="cc"></canvas></div>
      </div>`;
    makeRadarChart('radarChart', p);
    makeChart('cc', p);
  } else if (idx === 1) {
    c.innerHTML = `
      <div class="card"><div class="card-head"><i class="ti ti-layout-grid"></i>Tercih Edilen Formasyon</div>
        <div class="formation-grid">${p.formations.map(f => `<div class="fmn-card"><div class="fmn-name">${f.name}</div><div class="fmn-sub">${f.sub}</div></div>`).join('')}</div>
      </div>
      <div class="card"><div class="card-head"><i class="ti ti-timeline"></i>Kariyer</div><div class="tl">${tlHTML(p.timeline)}</div></div>`;
  } else if (idx === 2) {
    c.innerHTML = `<div class="card"><div class="card-head"><i class="ti ti-users"></i>Kimya Kurduğu Oyuncular</div><div class="chem-list">${chemHTML(p.chemistry)}</div></div>`;
  } else if (idx === 3) {
    c.innerHTML = trophyHTML(p.trophies);
  }
}

/* ── INIT ── */
applyFilters();
if (PAGE === 'players') {
  fetchLiveData('PL').then(renderApiSection);
}

/* ── Global helpers (HTML onclick= erişimi için) ── */
window.filterByLeague = filterByLeague;
window.handleSearch   = handleSearch;
window.goHome         = goHome;
window.exportPDF      = exportPDF;
window.switchTab      = switchTab;