// LEONIDA LEDGER — GTA VI trophy guide + tracker (offline, no libraries).
// Loads app/data/trophies.json at run time, renders the checklist, the 7-stage
// platinum roadmap and the missable watchlist, and saves progress in localStorage.
const STORAGE_KEY = 'leonida-ledger-earned-v1';
const SPOILER_KEY = 'leonida-ledger-spoiler-v1';

const STAGES = [
  { n: 1, title: 'Chapter 1 — learn Leonida, do the one missable step', note: 'Play Gone Fishing and finish the chapter. Before you leave: Lucia’s balcony meditation (Positive Mental Attitude) — the only missable step in the list. Keep a manual save from the chapter start.' },
  { n: 2, title: 'Chapter 2 — switching opens, partner play begins', note: 'Breakfast Run unlocks switching between Jason and Lucia. Garages open after Daily Driver; the Scooter Bros app after Moses; Kingpin Bowling (Let’s Go Bowling) is here.' },
  { n: 3, title: 'Chapter 3 — jewelry, airport, races', note: 'Yasmani’s Jewelry Jobs gives the Snap Gun (Sneakthief). Race Yago the moment the time-sensitive race appears. VCIA is open for Catch Me If You Can.' },
  { n: 4, title: 'Chapter 4 — vaults, gangs, trucks', note: 'That’s Where The Money Is (optional, near the end) opens bank vaults: Maximum Withdrawal, Hot Together, A Classic Blitz Play, Dime on the Dollar. Rob one Illegal Operation per gang for Pest Control.' },
  { n: 5, title: 'Finale — the last mission', note: 'Complete the final mission (You Gotta Know When to Get Off). Keep an untouched manual save from just before it — no mission replay, no New Game Plus.' },
  { n: 6, title: 'Post-game cleanup — strands, collectibles, grinds', note: 'Stranger-strand finales (Andy, Kenton, Billy, Randy, Tyrone), 8 Strangers & Freaks strands, cards, WAiNK tags, stunts, challenges, vehicles, meditation spots, hunting, gym, shops and garages.' },
  { n: 7, title: 'Platinum — 100% completion, then the prize', note: 'A Long Road: 100% completion (checklist under Progress > Stats > 100% Completion). 300 stunts, 70 of 80 Challenges, 200 of 277 vehicles, all 8 vaults. Then Vice Got a Price! pops.' },
];

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', other: 'Other' };

let trophies = [];
let earned = new Set();
let openId = null;
let activeKind = 'all';

try { earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); } catch { earned = new Set(); }
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const noteEl = document.getElementById('filterNote');
const emptyEl = document.getElementById('emptyNote');

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function isSpoilerHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.name);
}

function trophyMatches(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  switch (activeKind) {
    case 'story': return t.kind === 'story';
    case 'missable': return t.missable === true;
    case 'collectibles': return t.kind === 'collectibles';
    case 'activities': return t.kind === 'activities';
    case 'online': return false;
    case 'unearned': return !earned.has(t.name);
    default: return true;
  }
}

function gradeBadge(t) {
  const span = document.createElement('span');
  span.className = `grade grade-${t.grade}`;
  span.textContent = t.grade;
  return span;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const pct = total ? Math.round((n / total) * 100) : 0;
  document.getElementById('progressText').textContent = `${n} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}% to platinum`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.name)) counts[t.grade]++;
  document.getElementById('gradeCounts').textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
  const miss = trophies.filter((t) => t.missable);
  const missEarned = miss.filter((t) => earned.has(t.name)).length;
  document.getElementById('missableCounts').textContent =
    `${missEarned}/${miss.length} missable earned`;
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapStages');
  ol.replaceChildren();
  for (const s of STAGES) {
    const stageTrophies = trophies.filter((t) => t.stage === s.n);
    const done = stageTrophies.filter((t) => earned.has(t.name)).length;
    const li = document.createElement('li');
    li.className = 'stage';
    const head = document.createElement('div');
    head.className = 'stage-head';
    const title = document.createElement('strong');
    title.textContent = `Stage ${s.n} — ${s.title}`;
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = `${done}/${stageTrophies.length} trophies`;
    head.append(title, count);
    const note = document.createElement('p');
    note.textContent = s.note;
    const chips = document.createElement('p');
    chips.className = 'stage-chips';
    for (const t of stageTrophies) {
      const chip = document.createElement('span');
      chip.className = `mini-chip${earned.has(t.name) ? ' done' : ''}`;
      chip.textContent = t.name;
      chips.append(chip);
    }
    li.append(head, note, chips);
    ol.append(li);
  }
}

function renderWatchlist() {
  const body = document.getElementById('watchlistBody');
  body.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = document.createElement('div');
    card.className = 'watch-card';
    const flag = document.createElement('p');
    flag.className = 'watch-flag';
    flag.textContent = earned.has(t.name) ? '✓ EARNED — safe' : '⚠ MISSABLE — do it in Chapter 1';
    const name = document.createElement('h3');
    name.textContent = `${t.name} — ${t.description}`;
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = `Sources: ${t.sources.map((s) => s.name).join(' · ')}`;
    card.append(flag, name, guide, src);
    body.append(card);
  }
}

function renderTrophyCard(t) {
  const card = document.createElement('article');
  card.className = `trophy${earned.has(t.name) ? ' earned' : ''}`;
  card.dataset.id = String(t.id);
  const hidden = isSpoilerHidden(t);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earn-box';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name); else earned.delete(t.name);
    saveEarned();
    renderAll();
  });

  const body = document.createElement('div');
  body.className = 'trophy-body';
  const head = document.createElement('button');
  head.type = 'button';
  head.className = 'trophy-head';
  head.addEventListener('click', () => {
    openId = openId === t.id ? null : t.id;
    renderAll();
  });
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : t.name;
  const meta = document.createElement('span');
  meta.className = 'trophy-meta';
  meta.append(gradeBadge(t));
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'tag tag-hidden';
    h.textContent = 'hidden on PS5';
    meta.append(h);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag tag-missable';
    m.textContent = '⚠ missable';
    meta.append(m);
  }
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = KIND_LABELS[t.kind] ?? t.kind;
  meta.append(kind);
  if (t.count != null) {
    const c = document.createElement('span');
    c.className = 'tag tag-count';
    c.textContent = t.kind === 'activities' && t.count >= 1000 ? `$${t.count.toLocaleString('en-US')}` : `× ${t.count}`;
    meta.append(c);
  }
  head.append(name, meta);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Name and description hidden by spoiler mode until earned.' : `“${t.description}” — official description`;
  body.append(head, desc);

  if (!hidden && openId === t.id) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    const label = document.createElement('p');
    label.className = 'guide-label';
    label.textContent = 'Guide (own words)';
    const text = document.createElement('p');
    text.textContent = t.guide;
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    t.sources.forEach((s, i) => {
      if (i) sources.append(document.createTextNode(' · '));
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.rel = 'noopener';
        a.textContent = s.name;
        sources.append(a);
      } else {
        sources.append(document.createTextNode(s.name));
      }
    });
    const stage = document.createElement('p');
    stage.className = 'guide-stage';
    stage.textContent = `Roadmap: Stage ${t.stage} of 7 — ${STAGES[t.stage - 1].title}`;
    guide.append(label, text, sources, stage);
    body.append(guide);
  } else if (!hidden) {
    const hint = document.createElement('p');
    hint.className = 'open-hint';
    hint.textContent = 'Click to open the guide + sources';
    body.append(hint);
  }
  card.append(box, body);
  return card;
}

function renderChecklist() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(renderTrophyCard(t));
  const label = activeKind === 'all' ? 'Trophy checklist' : `Trophy checklist — ${KIND_LABELS[activeKind] ?? activeKind}`;
  document.getElementById('listHeading').textContent = `${label} (${shown.length} of ${trophies.length})`;
  if (activeKind === 'online') {
    noteEl.textContent = 'No online trophies: all 55 are single-player (GGRecon, PowerPyx). The filter is here so the guide stays honest about it.';
    emptyEl.hidden = false;
    emptyEl.textContent = 'Nothing here — this list has 0 online trophies. Try Story, Missable, Collectibles or Activities.';
  } else {
    noteEl.textContent = '';
    if (shown.length === 0) {
      emptyEl.hidden = false;
      emptyEl.textContent = 'No trophies match this filter combination. Clear the search or pick another filter.';
    } else {
      emptyEl.hidden = true;
    }
  }
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderWatchlist();
  renderChecklist();
}

function exportProgress() {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned].sort() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-ledger-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    saveEarned();
    renderAll();
    noteEl.textContent = `Imported ${earned.size} earned trophies from ${file.name}.`;
  } catch {
    noteEl.textContent = `Could not import ${file.name}: not a Leonida Ledger progress file.`;
  }
}

async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  trophies = doc.trophies;
}

spoilerEl.checked = spoilerOn;
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveSpoiler();
  renderAll();
});
searchEl.addEventListener('input', renderChecklist);
gradeEl.addEventListener('change', renderChecklist);
document.querySelectorAll('.filters .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filters .chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeKind = chip.dataset.kind;
    renderChecklist();
  });
});
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (e) => {
  importProgress(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (window.confirm('Clear all earned ticks?')) {
    earned = new Set();
    saveEarned();
    renderAll();
  }
});

await loadTrophies();
renderAll();
