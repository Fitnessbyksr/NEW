// KSR Coach — FitnessbyKSR coach dashboard

// ─── Utilities ───────────────────────────────────────────────────────────────

function uid() {
  return (crypto.randomUUID || (() =>
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  ))();
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const DB = {
  get(k)       { try { return JSON.parse(localStorage.getItem('ksr_' + k) || '[]'); } catch { return []; } },
  set(k, v)    { localStorage.setItem('ksr_' + k, JSON.stringify(v)); },
  find(k, id)  { return this.get(k).find(i => i.id === id); },
  save(k, item) {
    const arr = this.get(k);
    const idx = arr.findIndex(i => i.id === item.id);
    if (idx >= 0) arr[idx] = item; else arr.push(item);
    this.set(k, arr);
  },
  del(k, id)   { this.set(k, this.get(k).filter(i => i.id !== id)); },
};

// ─── Seed ────────────────────────────────────────────────────────────────────

function seed() {
  if (DB.get('_seeded').length) return;

  DB.set('exercises', [
    { id: uid(), name: 'Goblet Squat',      category: 'Lower Body', cues: 'Chest up, knees track over toes, sit into hips' },
    { id: uid(), name: 'Romanian Deadlift', category: 'Lower Body', cues: 'Hinge at hips, soft knee, bar close to legs' },
    { id: uid(), name: 'Single-Leg RDL',    category: 'Lower Body', cues: 'Hip-width stance, slow eccentric, control the balance' },
    { id: uid(), name: 'Hip Thrust',        category: 'Lower Body', cues: 'Drive through heels, full hip extension at top' },
    { id: uid(), name: 'Calf Raise',        category: 'Lower Body', cues: 'Slow 3-sec eccentric, full range of motion' },
    { id: uid(), name: 'Walking Lunge',     category: 'Lower Body', cues: 'Knee doesn\'t pass toe, tall torso throughout' },
    { id: uid(), name: 'Step-Up',           category: 'Lower Body', cues: 'Drive through front heel, don\'t push off back foot' },
    { id: uid(), name: 'Dumbbell Row',      category: 'Upper Body', cues: 'Elbow close to body, squeeze shoulder blade at top' },
    { id: uid(), name: 'Band Pull-Apart',   category: 'Upper Body', cues: 'Arms straight, controlled return, rear delts working' },
    { id: uid(), name: 'Push-Up',           category: 'Upper Body', cues: 'Elbows at 45 degrees, full chest to floor' },
    { id: uid(), name: 'Plank',             category: 'Core',       cues: 'Neutral spine, brace abs, squeeze glutes' },
    { id: uid(), name: 'Dead Bug',          category: 'Core',       cues: 'Lower back pressed to floor at all times' },
    { id: uid(), name: 'Pallof Press',      category: 'Core',       cues: 'Anti-rotation, resist the pull, don\'t twist' },
    { id: uid(), name: 'Copenhagen Plank',  category: 'Core',       cues: 'Hip stays level, adductor under load throughout' },
  ]);

  DB.set('stretches', [
    { id: uid(), name: 'Quad Stretch',         type: 'Static',    hold: '30–45 sec each side', when: 'Post-session' },
    { id: uid(), name: 'Calf Stretch (wall)',   type: 'Static',    hold: '30–45 sec each side', when: 'Post-session' },
    { id: uid(), name: 'Hamstring Stretch',     type: 'Static',    hold: '45 sec each side',    when: 'Post-session' },
    { id: uid(), name: 'Pigeon Pose',           type: 'Static',    hold: '60 sec each side',    when: 'Post-session' },
    { id: uid(), name: 'Low Lunge Hip Flexor',  type: 'Static',    hold: '45 sec each side',    when: 'Post-session' },
    { id: uid(), name: 'Figure-4 Glute',        type: 'Static',    hold: '45 sec each side',    when: 'Post-session' },
    { id: uid(), name: 'Child\'s Pose',         type: 'Static',    hold: '60 sec',              when: 'Post-session' },
    { id: uid(), name: 'Leg Swings',            type: 'Dynamic',   hold: '10 each leg',         when: 'Pre-session' },
    { id: uid(), name: 'Hip Circles',           type: 'Dynamic',   hold: '8 each direction',    when: 'Pre-session' },
    { id: uid(), name: 'Walking Lunges',        type: 'Dynamic',   hold: '10 each leg',         when: 'Pre-session' },
    { id: uid(), name: 'High Knees (slow)',     type: 'Dynamic',   hold: '20 metres',           when: 'Pre-session' },
    { id: uid(), name: 'Ankle Circles',         type: 'Dynamic',   hold: '8 each foot',         when: 'Pre-session' },
    { id: uid(), name: 'IT Band Roll',          type: 'Foam Roll', hold: '60–90 sec each side', when: 'Post-session' },
    { id: uid(), name: 'Quad Roll',             type: 'Foam Roll', hold: '60–90 sec each side', when: 'Post-session' },
    { id: uid(), name: 'Calf Roll',             type: 'Foam Roll', hold: '60–90 sec each side', when: 'Post-session' },
  ]);

  DB.set('_seeded', [{ v: 1 }]);
}

// ─── State ───────────────────────────────────────────────────────────────────

const S = {
  view: 'dashboard',
  filter: null,
  planId: null,
};

// ─── Navigation ──────────────────────────────────────────────────────────────

function go(view, opts = {}) {
  S.view   = view;
  S.filter = opts.filter || null;
  S.planId = opts.planId || null;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  const labels = {
    dashboard: 'Dashboard', clients: 'Clients', plans: 'Training Plans',
    exercises: 'Exercises', stretches: 'Stretches', notes: 'Session Notes',
  };
  document.getElementById('page-title').textContent = S.planId ? 'Plan Details' : labels[view];

  const addBtn = document.getElementById('btn-add');
  addBtn.style.display = (view === 'dashboard' || S.planId) ? 'none' : '';

  paint();
}

// ─── Render ──────────────────────────────────────────────────────────────────

function paint() {
  const el = document.getElementById('content');
  el.scrollTop = 0;
  switch (S.view) {
    case 'dashboard': el.innerHTML = vDashboard(); break;
    case 'clients':   el.innerHTML = vClients();   break;
    case 'plans':     el.innerHTML = S.planId ? vPlanDetail(S.planId) : vPlans(); break;
    case 'exercises': el.innerHTML = vExercises(); break;
    case 'stretches': el.innerHTML = vStretches(); break;
    case 'notes':     el.innerHTML = vNotes();     break;
  }
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

const EDIT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const DEL_ICON  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`;

function actions(collection, id) {
  return `<div class="card-actions">
    <button class="icon-btn" onclick="openForm('${collection}','${id}')" aria-label="Edit">${EDIT_ICON}</button>
    <button class="icon-btn del" onclick="confirmDel('${collection}','${id}')" aria-label="Delete">${DEL_ICON}</button>
  </div>`;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function vDashboard() {
  const clients   = DB.get('clients');
  const plans     = DB.get('plans');
  const exercises = DB.get('exercises');
  const stretches = DB.get('stretches');
  const active    = plans.filter(p => p.status === 'active').length;

  const recent3 = arr => arr.slice().reverse().slice(0, 3);
  const rClients = recent3(clients);
  const rPlans   = recent3(plans);

  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${clients.length}</div><div class="stat-label">Clients</div></div>
      <div class="stat-card"><div class="stat-value">${active}</div><div class="stat-label">Active Plans</div></div>
      <div class="stat-card"><div class="stat-value">${plans.length}</div><div class="stat-label">Total Plans</div></div>
      <div class="stat-card"><div class="stat-value">${exercises.length + stretches.length}</div><div class="stat-label">Library Items</div></div>
    </div>

    ${rClients.length ? `
      <div class="section-header">
        <span class="section-title">Recent Clients</span>
        <button class="view-all-btn" onclick="go('clients')">View all</button>
      </div>
      ${rClients.map(c => `
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">${esc(c.name)}</div><div class="card-subtitle">${esc(c.goal || 'No goal set')}</div></div>
          </div>
        </div>`).join('')}
    ` : ''}

    ${rPlans.length ? `
      <div class="section-header" style="margin-top:6px">
        <span class="section-title">Recent Plans</span>
        <button class="view-all-btn" onclick="go('plans')">View all</button>
      </div>
      ${rPlans.map(p => {
        const c = DB.find('clients', p.clientId);
        return `<div class="card" onclick="go('plans',{planId:'${p.id}'})">
          <div class="card-header">
            <div><div class="card-title">${esc(p.name)}</div><div class="card-subtitle">${c ? esc(c.name) : 'No client'}</div></div>
            <span class="badge badge-${p.status}">${p.status}</span>
          </div>
        </div>`;
      }).join('')}
    ` : `
      <div class="empty-state">
        <div class="empty-state-title">Welcome to KSR Coach</div>
        <p>Start by adding your first client using the Clients tab.</p>
      </div>
    `}
  `;
}

// ─── Clients ─────────────────────────────────────────────────────────────────

function vClients() {
  const clients = DB.get('clients');
  if (!clients.length) return `
    <div class="empty-state">
      <div class="empty-state-title">No clients yet</div>
      <p>Tap the + button to add your first client.</p>
    </div>`;

  return clients.map(c => {
    const planCount = DB.get('plans').filter(p => p.clientId === c.id).length;
    return `<div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(c.name)}</div>
          ${c.goal ? `<div class="card-subtitle">${esc(c.goal)}</div>` : ''}
        </div>
        ${actions('clients', c.id)}
      </div>
      <div class="card-meta">
        ${c.phone ? `<span class="meta-pill">${esc(c.phone)}</span>` : ''}
        ${c.email ? `<span class="meta-pill">${esc(c.email)}</span>` : ''}
        <span class="meta-pill">${c.sessions || 0} sessions</span>
        <span class="meta-pill">${planCount} plan${planCount !== 1 ? 's' : ''}</span>
      </div>
      ${c.notes ? `<div class="card-body">${esc(c.notes)}</div>` : ''}
    </div>`;
  }).join('');
}

// ─── Plans ────────────────────────────────────────────────────────────────────

function vPlans() {
  const plans  = DB.get('plans');
  const filter = S.filter || 'all';

  const count = st => plans.filter(p => p.status === st).length;
  const pills = [
    { k: 'all',      label: `All (${plans.length})` },
    { k: 'active',   label: `Active (${count('active')})` },
    { k: 'draft',    label: `Draft (${count('draft')})` },
    { k: 'complete', label: `Complete (${count('complete')})` },
  ];

  const filtered = filter === 'all' ? plans : plans.filter(p => p.status === filter);

  const filterBar = `<div class="filter-bar">${pills.map(p =>
    `<button class="filter-pill ${filter === p.k ? 'active' : ''}" onclick="setFilter('${p.k}')">${p.label}</button>`
  ).join('')}</div>`;

  if (!filtered.length) return filterBar + `
    <div class="empty-state">
      <div class="empty-state-title">${filter === 'all' ? 'No plans yet' : `No ${filter} plans`}</div>
      ${filter === 'all' ? '<p>Tap + to create your first training plan.</p>' : ''}
    </div>`;

  return filterBar + filtered.slice().reverse().map(p => {
    const c = DB.find('clients', p.clientId);
    return `<div class="card" onclick="go('plans',{planId:'${p.id}'})">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(p.name)}</div>
          <div class="card-subtitle">${c ? esc(c.name) : 'No client assigned'}</div>
        </div>
        <span class="badge badge-${p.status}">${p.status}</span>
      </div>
      <div class="card-meta">
        ${p.weeks    ? `<span class="meta-pill">${p.weeks} weeks</span>` : ''}
        ${p.sessions ? `<span class="meta-pill">${p.sessions}x / week</span>` : ''}
        ${p.goal     ? `<span class="meta-pill">${esc(p.goal)}</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

function vPlanDetail(id) {
  const plan = DB.find('plans', id);
  if (!plan) return '<p>Plan not found.</p>';
  const c = DB.find('clients', plan.clientId);

  return `
    <button class="back-btn" onclick="go('plans')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
      Back to Plans
    </button>
    <div class="plan-detail-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">
        <h2>${esc(plan.name)}</h2>
        <div class="plan-detail-actions">
          <button class="icon-btn" onclick="openForm('plans','${plan.id}')" aria-label="Edit">${EDIT_ICON}</button>
          <button class="icon-btn del" onclick="confirmDel('plans','${plan.id}')" aria-label="Delete">${DEL_ICON}</button>
        </div>
      </div>
      <div class="plan-detail-meta">
        <span class="badge badge-${plan.status}">${plan.status}</span>
        ${c ? `<span class="meta-pill">${esc(c.name)}</span>` : ''}
        ${plan.weeks    ? `<span class="meta-pill">${plan.weeks} weeks</span>` : ''}
        ${plan.sessions ? `<span class="meta-pill">${plan.sessions}x / week</span>` : ''}
      </div>
      ${plan.goal ? `<div class="plan-section"><div class="plan-section-label">Goal</div><div class="plan-section-content">${esc(plan.goal)}</div></div>` : ''}
      ${plan.phases ? `<div class="plan-section"><div class="plan-section-label">Phases &amp; Structure</div><div class="plan-section-content">${esc(plan.phases)}</div></div>` : ''}
      ${plan.notes ? `<div class="plan-section"><div class="plan-section-label">Notes</div><div class="plan-section-content">${esc(plan.notes)}</div></div>` : ''}
    </div>`;
}

// ─── Exercises ───────────────────────────────────────────────────────────────

function vExercises() {
  const all    = DB.get('exercises');
  const filter = S.filter || 'All';
  const cats   = ['All', 'Lower Body', 'Upper Body', 'Core', 'Cardio', 'Mobility'];
  const list   = filter === 'All' ? all : all.filter(e => e.category === filter);

  const filterBar = `<div class="filter-bar">${cats.map(c =>
    `<button class="filter-pill ${filter === c ? 'active' : ''}" onclick="setFilter('${c}')">${c}</button>`
  ).join('')}</div>`;

  if (!list.length) return filterBar + `<div class="empty-state"><div class="empty-state-title">No exercises in this category</div></div>`;

  return filterBar + list.map(e => `
    <div class="lib-card">
      <div class="lib-card-top">
        <div>
          <div class="lib-card-name">${esc(e.name)}</div>
          ${e.cues ? `<div class="lib-card-cues">${esc(e.cues)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="icon-btn" onclick="openForm('exercises','${e.id}')" aria-label="Edit">${EDIT_ICON}</button>
          <button class="icon-btn del" onclick="confirmDel('exercises','${e.id}')" aria-label="Delete">${DEL_ICON}</button>
        </div>
      </div>
      <div class="lib-card-tags"><span class="tag">${esc(e.category)}</span></div>
    </div>`).join('');
}

// ─── Stretches ───────────────────────────────────────────────────────────────

function vStretches() {
  const all    = DB.get('stretches');
  const filter = S.filter || 'All';
  const types  = ['All', 'Static', 'Dynamic', 'Foam Roll'];
  const list   = filter === 'All' ? all : all.filter(s => s.type === filter);

  const filterBar = `<div class="filter-bar">${types.map(t =>
    `<button class="filter-pill ${filter === t ? 'active' : ''}" onclick="setFilter('${t}')">${t}</button>`
  ).join('')}</div>`;

  if (!list.length) return filterBar + `<div class="empty-state"><div class="empty-state-title">No stretches in this category</div></div>`;

  return filterBar + list.map(s => `
    <div class="lib-card">
      <div class="lib-card-top">
        <div class="lib-card-name">${esc(s.name)}</div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="icon-btn" onclick="openForm('stretches','${s.id}')" aria-label="Edit">${EDIT_ICON}</button>
          <button class="icon-btn del" onclick="confirmDel('stretches','${s.id}')" aria-label="Delete">${DEL_ICON}</button>
        </div>
      </div>
      <div class="lib-card-tags">
        <span class="tag">${esc(s.type)}</span>
        ${s.hold ? `<span class="tag tag-muted">${esc(s.hold)}</span>` : ''}
        ${s.when ? `<span class="tag tag-muted">${esc(s.when)}</span>` : ''}
      </div>
    </div>`).join('');
}

// ─── Notes ───────────────────────────────────────────────────────────────────

function vNotes() {
  const notes = DB.get('notes');
  if (!notes.length) return `
    <div class="empty-state">
      <div class="empty-state-title">No session notes yet</div>
      <p>Tap + to log your first session note.</p>
    </div>`;

  return notes.slice().sort((a, b) => b.date.localeCompare(a.date)).map(n => {
    const c = DB.find('clients', n.clientId);
    return `<div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${c ? esc(c.name) : 'Unknown client'}</div>
          <div class="card-subtitle">${fmtDate(n.date)}</div>
        </div>
        ${actions('notes', n.id)}
      </div>
      <div class="card-body">${esc(n.note)}</div>
    </div>`;
  }).join('');
}

// ─── Bottom Sheet ────────────────────────────────────────────────────────────

function openSheet(title, html) {
  document.getElementById('sheet-title').textContent = title;
  document.getElementById('sheet-body').innerHTML = html;
  document.getElementById('sheet').classList.add('open');
  document.getElementById('sheet-overlay').classList.add('open');
  setTimeout(() => {
    const first = document.querySelector('#sheet-body input:not([type=hidden]), #sheet-body textarea, #sheet-body select');
    if (first) first.focus();
  }, 320);
}

function closeSheet() {
  document.getElementById('sheet').classList.remove('open');
  document.getElementById('sheet-overlay').classList.remove('open');
}

// ─── Form Router ─────────────────────────────────────────────────────────────

function openForm(collection, id) {
  const handlers = {
    clients: fClient, plans: fPlan, exercises: fExercise,
    stretches: fStretch, notes: fNote,
  };
  handlers[collection]?.(id || null);
}

function addRecord() {
  const map = {
    clients: 'clients', plans: 'plans', exercises: 'exercises',
    stretches: 'stretches', notes: 'notes',
  };
  openForm(map[S.view], null);
}

// ─── Client Form ─────────────────────────────────────────────────────────────

function fClient(id) {
  const d = id ? DB.find('clients', id) : {};
  openSheet(id ? 'Edit Client' : 'New Client', `
    <form onsubmit="sClient(event,'${id || ''}')">
      <div class="form-group">
        <label class="form-label">Name *</label>
        <input class="form-control" name="n" required value="${esc(d.name || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Goal</label>
        <input class="form-control" name="goal" value="${esc(d.goal || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input class="form-control" name="phone" type="tel" value="${esc(d.phone || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-control" name="email" type="email" value="${esc(d.email || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Sessions Completed</label>
        <input class="form-control" name="sessions" type="number" min="0" value="${d.sessions || 0}">
      </div>
      <div class="form-group">
        <label class="form-label">Notes (injuries, preferences)</label>
        <textarea class="form-control" name="notes">${esc(d.notes || '')}</textarea>
      </div>
      <button type="submit" class="form-submit">${id ? 'Save Changes' : 'Add Client'}</button>
    </form>`);
}

function sClient(e, id) {
  e.preventDefault();
  const f = e.target;
  DB.save('clients', {
    id: id || uid(),
    name:     f.elements['n'].value.trim(),
    goal:     f.elements['goal'].value.trim(),
    phone:    f.elements['phone'].value.trim(),
    email:    f.elements['email'].value.trim(),
    sessions: parseInt(f.elements['sessions'].value) || 0,
    notes:    f.elements['notes'].value.trim(),
    createdAt: id ? (DB.find('clients', id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
  });
  closeSheet(); paint();
}

// ─── Plan Form ───────────────────────────────────────────────────────────────

function fPlan(id) {
  const d       = id ? DB.find('plans', id) : {};
  const clients = DB.get('clients');
  openSheet(id ? 'Edit Plan' : 'New Plan', `
    <form onsubmit="sPlan(event,'${id || ''}')">
      <div class="form-group">
        <label class="form-label">Plan Name *</label>
        <input class="form-control" name="n" required value="${esc(d.name || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-control" name="clientId">
          <option value="">No client assigned</option>
          ${clients.map(c => `<option value="${c.id}" ${d.clientId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Duration (weeks)</label>
          <input class="form-control" name="weeks" type="number" min="1" value="${d.weeks || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Sessions / week</label>
          <input class="form-control" name="sessions" type="number" min="1" value="${d.sessions || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-control" name="status">
          <option value="draft"    ${(!d.status || d.status === 'draft')    ? 'selected' : ''}>Draft</option>
          <option value="active"   ${d.status === 'active'                  ? 'selected' : ''}>Active</option>
          <option value="complete" ${d.status === 'complete'                ? 'selected' : ''}>Complete</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Goal</label>
        <input class="form-control" name="goal" value="${esc(d.goal || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Phases &amp; Structure</label>
        <textarea class="form-control" name="phases" style="min-height:120px">${esc(d.phases || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-control" name="notes">${esc(d.notes || '')}</textarea>
      </div>
      <button type="submit" class="form-submit">${id ? 'Save Changes' : 'Add Plan'}</button>
    </form>`);
}

function sPlan(e, id) {
  e.preventDefault();
  const f    = e.target;
  const item = {
    id: id || uid(),
    name:      f.elements['n'].value.trim(),
    clientId:  f.elements['clientId'].value,
    weeks:     parseInt(f.elements['weeks'].value) || null,
    sessions:  parseInt(f.elements['sessions'].value) || null,
    status:    f.elements['status'].value,
    goal:      f.elements['goal'].value.trim(),
    phases:    f.elements['phases'].value.trim(),
    notes:     f.elements['notes'].value.trim(),
    createdAt: id ? (DB.find('plans', id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
  };
  DB.save('plans', item);
  closeSheet();
  if (S.planId) go('plans', { planId: item.id });
  else paint();
}

// ─── Exercise Form ───────────────────────────────────────────────────────────

function fExercise(id) {
  const d    = id ? DB.find('exercises', id) : {};
  const cats = ['Lower Body', 'Upper Body', 'Core', 'Cardio', 'Mobility'];
  openSheet(id ? 'Edit Exercise' : 'New Exercise', `
    <form onsubmit="sExercise(event,'${id || ''}')">
      <div class="form-group">
        <label class="form-label">Name *</label>
        <input class="form-control" name="n" required value="${esc(d.name || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select class="form-control" name="cat" required>
          ${cats.map(c => `<option value="${c}" ${d.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Coaching Cues</label>
        <textarea class="form-control" name="cues">${esc(d.cues || '')}</textarea>
      </div>
      <button type="submit" class="form-submit">${id ? 'Save Changes' : 'Add Exercise'}</button>
    </form>`);
}

function sExercise(e, id) {
  e.preventDefault();
  const f = e.target;
  DB.save('exercises', {
    id: id || uid(),
    name:     f.elements['n'].value.trim(),
    category: f.elements['cat'].value,
    cues:     f.elements['cues'].value.trim(),
  });
  closeSheet(); paint();
}

// ─── Stretch Form ────────────────────────────────────────────────────────────

function fStretch(id) {
  const d = id ? DB.find('stretches', id) : {};
  openSheet(id ? 'Edit Stretch' : 'New Stretch', `
    <form onsubmit="sStretch(event,'${id || ''}')">
      <div class="form-group">
        <label class="form-label">Name *</label>
        <input class="form-control" name="n" required value="${esc(d.name || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-control" name="type">
          ${['Static','Dynamic','Foam Roll'].map(t => `<option value="${t}" ${d.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Hold / Duration</label>
        <input class="form-control" name="hold" value="${esc(d.hold || '')}" placeholder="e.g. 30 sec each side">
      </div>
      <div class="form-group">
        <label class="form-label">When</label>
        <select class="form-control" name="when">
          ${['Pre-session','Post-session','Any time'].map(w => `<option value="${w}" ${d.when === w ? 'selected' : ''}>${w}</option>`).join('')}
        </select>
      </div>
      <button type="submit" class="form-submit">${id ? 'Save Changes' : 'Add Stretch'}</button>
    </form>`);
}

function sStretch(e, id) {
  e.preventDefault();
  const f = e.target;
  DB.save('stretches', {
    id:   id || uid(),
    name: f.elements['n'].value.trim(),
    type: f.elements['type'].value,
    hold: f.elements['hold'].value.trim(),
    when: f.elements['when'].value,
  });
  closeSheet(); paint();
}

// ─── Note Form ───────────────────────────────────────────────────────────────

function fNote(id) {
  const d       = id ? DB.find('notes', id) : {};
  const clients = DB.get('clients');
  const today   = new Date().toISOString().slice(0, 10);

  if (!clients.length) {
    openSheet('New Session Note', `<p style="color:var(--text-muted);font-size:14px;padding:8px 0">Add at least one client before logging a session note.</p>`);
    return;
  }

  openSheet(id ? 'Edit Note' : 'New Session Note', `
    <form onsubmit="sNote(event,'${id || ''}')">
      <div class="form-group">
        <label class="form-label">Client *</label>
        <select class="form-control" name="clientId" required>
          <option value="">Select client</option>
          ${clients.map(c => `<option value="${c.id}" ${d.clientId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input class="form-control" name="date" type="date" required value="${d.date || today}">
      </div>
      <div class="form-group">
        <label class="form-label">Note *</label>
        <textarea class="form-control" name="note" required style="min-height:140px">${esc(d.note || '')}</textarea>
      </div>
      <button type="submit" class="form-submit">${id ? 'Save Changes' : 'Save Note'}</button>
    </form>`);
}

function sNote(e, id) {
  e.preventDefault();
  const f = e.target;
  DB.save('notes', {
    id:        id || uid(),
    clientId:  f.elements['clientId'].value,
    date:      f.elements['date'].value,
    note:      f.elements['note'].value.trim(),
    createdAt: id ? (DB.find('notes', id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
  });
  closeSheet(); paint();
}

// ─── Delete ──────────────────────────────────────────────────────────────────

let _del = null;

function confirmDel(collection, id) {
  const item  = DB.find(collection, id);
  const label = item?.name || (item?.note ? item.note.slice(0, 40) + '…' : 'this item');
  _del = { collection, id };
  document.getElementById('confirm-text').textContent = `Delete "${label}"? This cannot be undone.`;
  document.getElementById('confirm-modal').classList.add('open');
  document.getElementById('confirm-overlay').classList.add('open');
}

function doDelete() {
  if (!_del) return;
  DB.del(_del.collection, _del.id);
  _del = null;
  closeDel();
  if (S.planId) go('plans');
  else paint();
}

function closeDel() {
  _del = null;
  document.getElementById('confirm-modal').classList.remove('open');
  document.getElementById('confirm-overlay').classList.remove('open');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setFilter(f) { S.filter = f; paint(); }

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  seed();

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => { S.filter = null; go(btn.dataset.view); });
  });

  document.getElementById('btn-add').addEventListener('click', addRecord);
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
  document.getElementById('sheet-overlay').addEventListener('click', closeSheet);
  document.getElementById('confirm-ok').addEventListener('click', doDelete);
  document.getElementById('confirm-cancel').addEventListener('click', closeDel);
  document.getElementById('confirm-overlay').addEventListener('click', closeDel);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  go('dashboard');
});
