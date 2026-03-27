'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   OPJ ELITE — app_patch.js  (v53 — Correctifs + Module PV + Gamification)
   Chargé APRÈS app.js dans index.html :
     <script src="app.js"></script>
     <script src="app_patch.js"></script>

   Ce fichier corrige les bugs identifiés à l'audit et ajoute :
   1. BUG FIX — Suppression de la double déclaration FSRS dans app.js
   2. BUG FIX — Bug `loaded` non défini → loadState sécurisé
   3. BUG FIX — defaultState() sans () ligne 889 → corrigé
   4. BUG FIX — Light mode CSS tokens manquants → injectés
   5. FIX ACCESSIBILITÉ — font-sizes sous 12px remontés
   6. FEATURE — Sons de feedback (correct/incorrect/combo)
   7. FEATURE — Combo multiplier XP (×1→×4)
   8. FEATURE — Barre de progression de session visible
   9. FEATURE — Graphique d'activité 7 jours sur profil
  10. FEATURE — Module PV Interactif complet (rédaction guidée + correction auto)
  11. FEATURE — Notifications push PWA (demande permission)
  12. FEATURE — Disparition inquiétante (leçon manquante)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {

/* ─────────────────────────────────────────────────────────────────────────
   1. SÉCURISATION loadState  (corrige bug loaded + bug defaultState sans ())
   ───────────────────────────────────────────────────────────────────────── */
const _origLoadState = window.loadState;
window.loadState = function loadState() {
  let loaded = false; // FIX : variable enfin déclarée
  const STORAGE_KEY_LOCAL = window.STORAGE_KEY || 'opje_v51';
  const STATE_VERSION_LOCAL = window.STATE_VERSION || 51;

  try {
    const r = localStorage.getItem(STORAGE_KEY_LOCAL);
    if (!r) return;
    const s = JSON.parse(r);
    if (!s.v || s.v < STATE_VERSION_LOCAL) {
      // Migration douce
      const prev = s;
      window.S = (typeof defaultState === 'function') ? defaultState() : {};
      if (prev.user)    window.S.user    = { ...window.S.user, ...prev.user };
      if (prev.lessons) window.S.lessons = prev.lessons;
      if (prev.qcm?.cards) window.S.qcm.cards = prev.qcm.cards;
      if (prev.fiches)  window.S.fiches  = prev.fiches;
      if (prev.fs)      window.S.fs      = prev.fs;
      if (prev.pfs)     window.S.pfs     = prev.pfs;
      if (prev.printed) window.S.printed = prev.printed;
      if (prev.printDone) window.S.printDone = prev.printDone;
      if (prev.annalesDone) window.S.annalesDone = prev.annalesDone;
      window.S.isPro = prev.isPro || prev.user?.isPRO || false;
      window.S.page = 'home';
      if (typeof save === 'function') save();
      loaded = true;
      return;
    }
    window.S = { ...(typeof defaultState === 'function' ? defaultState() : {}), ...s, page: 'home' };
    // Assurer les clés critiques
    if (!window.S.badges)   window.S.badges   = {};
    if (!window.S.shield)   window.S.shield   = { count: 1, lastEarned: null };
    if (!window.S.activity) window.S.activity = {};
    if (!window.S.defi)     window.S.defi     = { lastDate: '', done: false };
    if (!window.S.pfs)      window.S.pfs      = {};
    if (!window.S.fs)       window.S.fs       = {};
    if (!window.S.annalesDone) window.S.annalesDone = {};
    if (!window.S.printed)  window.S.printed  = {};
    if (!window.S.printDone) window.S.printDone = 0;
    if (window.S.isPro === undefined) window.S.isPro = window.S.user?.isPRO || false;
    loaded = true;
  } catch (e) {
    console.warn('[OPJ v53] loadState error:', e);
  }

  // Migration legacy (maintenant avec loaded correctement défini)
  if (!loaded) {
    const oldKeys = ['opje_v30','opj_v30','opje_v29','opj_v29'];
    for (const k of oldKeys) {
      const old = localStorage.getItem(k);
      if (old) {
        try {
          const d = JSON.parse(old);
          // FIX BUG : defaultState() avec parenthèses
          window.S = { ...(typeof defaultState === 'function' ? defaultState() : {}), ...d };
          if (typeof save === 'function') save();
        } catch (e) { console.warn('[OPJ v53] Legacy migration error:', e); }
        break;
      }
    }
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   2. SUPPRESSION de la redéclaration FSRS dans app.js
      app.js déclare const FSRS={} ligne ~906 ce qui écrase window.FSRS de
      fsrs.js sans la méthode getDue(). On restaure window.FSRS depuis fsrs.js
      après le chargement complet de app.js.
   ───────────────────────────────────────────────────────────────────────── */
// Note : fsrs.js est chargé AVANT app.js ET app_patch.js (voir index.html)
// La redéclaration `const FSRS` dans app.js est scope-locale à son IIFE ou
// au module — elle n'écrase window.FSRS que si pas de 'use strict' global.
// On réassigne pour garantir que window.FSRS est bien notre version complète.
if (window.FSRS && !window.FSRS.getDue) {
  // app.js a écrasé notre FSRS sans getDue() → on restaure depuis fsrs.js
  console.warn('[OPJ v53] FSRS.getDue manquant — restauration depuis window._FSRS_FULL');
  if (window._FSRS_FULL) window.FSRS = window._FSRS_FULL;
}

/* ─────────────────────────────────────────────────────────────────────────
   3. INJECTION CSS — Light mode + font-sizes + tokens manquants
   ───────────────────────────────────────────────────────────────────────── */
const PATCH_CSS = `
/* ── Light mode tokens (manquants dans app.js/pages.css) ── */
[data-theme="light"] {
  --bg-0:#f0f2f8; --bg-1:#ffffff; --bg-2:#e8ecf4; --bg-3:#dde2ee; --bg-4:#c8d0e4;
  --accent:#1b6bff; --accent-l:#2563eb; --accent-xl:#1d4ed8;
  --accent-glow:rgba(27,107,255,.12); --accent-glow-l:rgba(27,107,255,.06);
  --gold:#b07d10; --gold-l:#c8921a; --gold-glow:rgba(176,125,16,.15);
  --ok:#059669; --ok-bg:rgba(5,150,105,.1);
  --warn:#d97706; --warn-bg:rgba(217,119,6,.1);
  --err:#dc2626; --err-bg:rgba(220,38,38,.1);
  --t1:#0f172a; --t2:#475569; --t3:#94a3b8;
  --brd:rgba(0,0,0,.08); --brd-l:rgba(0,0,0,.14);
  --brd-acc:rgba(27,107,255,.25); --brd-gold:rgba(176,125,16,.25);
}
[data-theme="light"] html,
[data-theme="light"] body { background:#f0f2f8; color:#0f172a; }
[data-theme="light"] .phone { background:#f0f2f8; }

/* ── Accessibilité : remonter les font-sizes illisibles ── */
.nb { font-size: 11px !important; }
.kpi-l { font-size: 11px !important; }
.slbl { font-size: 11px !important; }
.bubble-name { font-size: 10px !important; }
.hdr-pill { font-size: 9px !important; }

/* ── Barre de progression de session QCM ── */
.session-progress-bar-wrap {
  height: 5px;
  background: var(--bg-3);
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 10px;
}
.session-progress-bar-fill {
  height: 100%;
  border-radius: 100px;
  background: linear-gradient(90deg, var(--accent), var(--accent-l));
  transition: width 0.4s ease;
}
.session-progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.session-progress-label span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--t3);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.session-progress-label .spl-score {
  font-size: 11px;
  color: var(--accent-xl);
}

/* ── Graphique d'activité 7 jours ── */
.act7-wrap {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  padding: 8px 0 4px;
}
.act7-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.act7-bar-wrap {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: flex-end;
}
.act7-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: var(--bg-3);
  min-height: 4px;
  transition: height .4s ease;
}
.act7-bar.active {
  background: linear-gradient(180deg, var(--accent-l), var(--accent));
  box-shadow: 0 0 8px rgba(27,107,255,.35);
}
.act7-bar.today {
  background: linear-gradient(180deg, var(--gold-l), var(--gold));
  box-shadow: 0 0 8px rgba(200,146,26,.35);
}
.act7-day {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--t3);
  font-weight: 700;
  text-transform: uppercase;
}
.act7-day.today { color: var(--gold); }

/* ── Module PV Interactif ── */
.pv-modal-ov {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0,0,0,.8); backdrop-filter: blur(14px);
  display: none; align-items: flex-end;
}
.pv-modal-ov.show { display: flex; animation: pgIn .22s ease; }
.pv-sheet {
  width: 100%; max-width: 600px; margin: 0 auto;
  background: var(--bg-1); border-radius: 24px 24px 0 0;
  border-top: 1px solid var(--brd-l);
  max-height: 93dvh; overflow-y: auto;
  box-shadow: 0 -12px 60px rgba(0,0,0,.7);
  animation: sheetUp .3s cubic-bezier(.25,.46,.45,.94);
}
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.pv-header {
  padding: 18px 18px 0;
  position: sticky; top: 0;
  background: var(--bg-1);
  border-bottom: 1px solid var(--brd);
  padding-bottom: 14px;
  z-index: 10;
}
.pv-header-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}
.pv-type-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 20px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
}
.pv-title {
  font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 900;
  color: var(--t1); letter-spacing: -.02em;
}
.pv-phase-tabs {
  display: flex; gap: 6px; padding-top: 10px;
}
.pv-phase-tab {
  flex: 1; padding: 7px 4px; border-radius: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
  text-align: center; text-transform: uppercase; letter-spacing: .06em;
  background: var(--bg-3); color: var(--t3); border: 1px solid var(--brd);
  cursor: pointer; transition: all .18s ease;
}
.pv-phase-tab.active {
  background: var(--accent); color: #fff;
  border-color: var(--accent-l);
  box-shadow: 0 0 12px rgba(27,107,255,.3);
}
.pv-phase-tab.done {
  background: var(--ok-bg); color: var(--ok); border-color: rgba(0,201,122,.3);
}
.pv-body { padding: 16px 18px 80px; }
.pv-section-lbl {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
  color: var(--t3); text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 8px; margin-top: 14px;
  display: flex; align-items: center; gap: 6px;
}
.pv-section-lbl::after { content: ''; flex: 1; height: 1px; background: var(--brd); }
.pv-field-group { margin-bottom: 12px; }
.pv-label {
  font-size: 12px; font-weight: 700; color: var(--t2);
  margin-bottom: 5px; display: flex; align-items: center; gap: 6px;
}
.pv-label .req { color: var(--err); font-size: 10px; }
.pv-label .hint {
  font-size: 10px; color: var(--t3); font-weight: 400;
  font-family: 'JetBrains Mono', monospace;
}
.pv-input {
  width: 100%; background: var(--bg-2); border: 1.5px solid var(--brd-l);
  border-radius: 12px; padding: 11px 14px; font-size: 14px;
  color: var(--t1); font-family: 'Inter', sans-serif; outline: none;
  transition: border-color .18s, box-shadow .18s;
  box-sizing: border-box;
}
.pv-input:focus {
  border-color: var(--accent-l);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.pv-input.valid { border-color: var(--ok); }
.pv-input.invalid { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-bg); }
.pv-textarea {
  width: 100%; min-height: 90px; resize: vertical;
  background: var(--bg-2); border: 1.5px solid var(--brd-l);
  border-radius: 12px; padding: 11px 14px; font-size: 14px;
  color: var(--t1); font-family: 'Inter', sans-serif; outline: none;
  transition: border-color .18s, box-shadow .18s;
  box-sizing: border-box; line-height: 1.6;
}
.pv-textarea:focus {
  border-color: var(--accent-l);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.pv-aide-card {
  background: rgba(27,107,255,.06); border: 1px solid rgba(27,107,255,.2);
  border-radius: 12px; padding: 11px 13px; margin-bottom: 12px;
  font-size: 12px; color: var(--t2); line-height: 1.6;
}
.pv-aide-card strong { color: var(--accent-l); }
.pv-piege-card {
  background: var(--err-bg); border: 1px solid rgba(255,61,87,.2);
  border-radius: 12px; padding: 10px 13px; margin-bottom: 10px;
}
.pv-piege-lbl {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  font-weight: 700; color: var(--err); text-transform: uppercase;
  letter-spacing: .08em; margin-bottom: 4px;
}
.pv-piege-txt { font-size: 12px; color: var(--t2); line-height: 1.5; }
.pv-validate-bar {
  position: sticky; bottom: 0; padding: 14px 18px;
  background: linear-gradient(to top, var(--bg-1) 80%, transparent);
}
.pv-score-card {
  background: var(--bg-2); border: 1px solid var(--brd);
  border-radius: 16px; padding: 16px; margin-bottom: 12px;
}
.pv-score-total {
  font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700;
  text-align: center; margin-bottom: 4px;
}
.pv-score-lbl { text-align: center; font-size: 11px; color: var(--t3); margin-bottom: 16px; }
.pv-corr-item {
  background: var(--bg-1); border: 1px solid var(--brd);
  border-radius: 12px; padding: 12px 14px; margin-bottom: 8px;
}
.pv-corr-status {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.pv-corr-ok { color: var(--ok); }
.pv-corr-ko { color: var(--err); }
.pv-corr-answer {
  font-size: 11px; color: var(--t3); font-family: 'JetBrains Mono', monospace;
  margin-top: 4px;
}
.pv-mention-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;
}
.pv-mention-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-radius: 10px;
  background: var(--bg-2); border: 1px solid var(--brd);
  font-size: 11px; font-weight: 600; color: var(--t2);
  cursor: pointer; transition: all .15s ease;
}
.pv-mention-chip.checked {
  background: var(--ok-bg); border-color: rgba(0,201,122,.3);
  color: var(--ok);
}
.pv-mention-chip input { display: none; }

/* ── Bouton PV dans la nav Révision ── */
.pv-launch-card {
  background: linear-gradient(135deg, rgba(16,185,129,.1), rgba(16,185,129,.03));
  border: 1px solid rgba(16,185,129,.25);
  border-radius: 18px; padding: 16px; margin-bottom: 12px;
  cursor: pointer; transition: all .18s ease;
}
.pv-launch-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,.15); }
.pv-launch-title {
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 900;
  color: var(--t1); margin-bottom: 4px;
}
.pv-launch-sub { font-size: 12px; color: var(--t2); }
`;
const styleEl = document.createElement('style');
styleEl.id = 'opj-patch-v53-css';
styleEl.textContent = PATCH_CSS;
document.head.appendChild(styleEl);

/* ─────────────────────────────────────────────────────────────────────────
   4. SONS DE FEEDBACK (WebAudio, sans fichier externe)
   ───────────────────────────────────────────────────────────────────────── */
const SOUND = {
  _ctx: null,
  _get() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    return this._ctx;
  },
  _play(freq, dur = 0.12, type = 'sine', gain = 0.12, delay = 0) {
    const ctx = this._get(); if (!ctx) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur + 0.05);
    } catch (e) {}
  },
  correct() {
    // Accord majeur ascendant — son de succès
    this._play(523, 0.09, 'sine', 0.10, 0.00);
    this._play(659, 0.09, 'sine', 0.10, 0.07);
    this._play(784, 0.14, 'sine', 0.10, 0.14);
  },
  wrong() {
    // Descente dissonante — son d'erreur
    this._play(330, 0.1,  'square', 0.06, 0.00);
    this._play(220, 0.15, 'square', 0.06, 0.08);
  },
  combo() {
    // Flash court — son de combo
    this._play(880, 0.06, 'sine', 0.08, 0.00);
    this._play(1100, 0.1, 'sine', 0.08, 0.05);
  },
  levelUp() {
    // Fanfare montante
    [523, 659, 784, 1047].forEach((f, i) => this._play(f, 0.18, 'sine', 0.1, i * 0.1));
  }
};
window.SOUND_OPJ = SOUND;

/* ─────────────────────────────────────────────────────────────────────────
   5. PATCH answerQ — Sons + Combo multiplier + Barre de progression
   ───────────────────────────────────────────────────────────────────────── */
let _combo = 0, _comboTimer = null;

function _updateSessionProgressBar() {
  const idx = window.S?.qcm?.idx ?? 0;
  const tot = window.S?.qcm?.queue?.length ?? 0;
  const ok  = window.S?.qcm?.stats?.ok ?? 0;
  const ko  = window.S?.qcm?.stats?.ko ?? 0;

  // Injecter la barre si absente
  let bar = document.getElementById('opj-sess-progress');
  if (!bar) {
    const qcmBody = document.getElementById('qcm-body');
    if (!qcmBody) return;
    bar = document.createElement('div');
    bar.id = 'opj-sess-progress';
    bar.innerHTML = `
      <div class="session-progress-label">
        <span id="spl-counter">0/0</span>
        <span class="spl-score" id="spl-score">✓ 0 · ✗ 0</span>
      </div>
      <div class="session-progress-bar-wrap">
        <div class="session-progress-bar-fill" id="spl-fill" style="width:0%"></div>
      </div>`;
    qcmBody.parentElement?.insertBefore(bar, qcmBody);
  }

  const pct  = tot > 0 ? Math.round(idx / tot * 100) : 0;
  const fill = document.getElementById('spl-fill');
  const ctr  = document.getElementById('spl-counter');
  const scr  = document.getElementById('spl-score');
  if (fill) fill.style.width = pct + '%';
  if (ctr)  ctr.textContent  = idx + '/' + tot;
  if (scr)  scr.textContent  = `✓ ${ok} · ✗ ${ko}`;
}

function _showComboUI(combo) {
  let el = document.getElementById('opj-combo-hud');
  if (combo < 2) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement('div');
    el.id = 'opj-combo-hud';
    el.style.cssText = [
      'position:fixed', 'top:68px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:600', 'pointer-events:none',
      'background:rgba(212,175,55,.18)', 'border:1px solid rgba(212,175,55,.45)',
      'border-radius:100px', 'padding:5px 18px',
      'font-family:JetBrains Mono,monospace', 'font-size:13px', 'font-weight:700',
      'color:var(--gold)', 'backdrop-filter:blur(12px)',
      'animation:pgIn .2s ease'
    ].join(';');
    document.body.appendChild(el);
  }
  const icons = ['','','🔥','🔥🔥','⚡🔥⚡'];
  const mult = Math.min(combo, 4);
  el.textContent = `${icons[mult] || icons[4]} COMBO ×${mult}`;
  clearTimeout(_comboTimer);
  _comboTimer = setTimeout(() => { const e = document.getElementById('opj-combo-hud'); if (e) e.remove(); }, 2800);
}

// Patch answerQ
const __answerQ = window.answerQ;
window.answerQ = function (i) {
  const q       = window.S?.qcm?.queue?.[window.S?.qcm?.idx];
  const already = window.S?.qcm?.answered !== null;
  if (!q || already) {
    if (__answerQ) __answerQ(i);
    return;
  }

  const correct = (i === q.c);
  // Appeler l'original d'abord
  if (__answerQ) __answerQ(i);

  if (correct) {
    _combo++;
    const mult = Math.min(_combo, 4);

    // Son
    if (_combo >= 3) SOUND_OPJ.combo();
    else SOUND_OPJ.correct();

    // Bonus XP combo (s'applique EN PLUS du XP de base déjà donné par answerQ)
    if (_combo >= 3 && typeof addXP === 'function') {
      const bonus = (mult - 1) * 5; // ×2 = +5, ×3 = +10, ×4 = +15
      addXP(bonus);
      if (typeof showToast === 'function' && _combo === 3)
        showToast(`🔥 COMBO ×${mult} ! +${bonus} XP bonus`, 'ok');
    }
    _showComboUI(_combo);
    // Incrémenter missions via le patch existant
    if (window.MISSIONS?.increment) window.MISSIONS.increment('qcm', 1);
  } else {
    SOUND_OPJ.wrong();
    _combo = 0;
    _showComboUI(0);
  }
  _updateSessionProgressBar();
};

// Patch finishSession — reset combo
const __finishSession = window.finishSession;
window.finishSession = function () {
  _combo = 0;
  _showComboUI(0);
  // Enlever la barre de session
  const bar = document.getElementById('opj-sess-progress');
  if (bar) bar.remove();
  if (__finishSession) __finishSession();
};

// Patch renderCurrentQ — mettre à jour la barre
const __renderCurrentQ = window.renderCurrentQ;
window.renderCurrentQ = function () {
  if (__renderCurrentQ) __renderCurrentQ();
  setTimeout(_updateSessionProgressBar, 40);
};

/* ─────────────────────────────────────────────────────────────────────────
   6. GRAPHIQUE D'ACTIVITÉ 7 JOURS (profil)
   ───────────────────────────────────────────────────────────────────────── */
function renderActivity7Days() {
  const container = document.getElementById('pr-activity-bars');
  if (!container) return;

  const today = new Date().toDateString();
  const DAYS_FR = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const cols = [];
  for (let i = 6; i >= 0; i--) {
    const d   = new Date(Date.now() - i * 86400000);
    const key = d.toDateString();
    cols.push({
      label:  DAYS_FR[d.getDay()],
      active: !!(window.S?.activity?.[key]),
      isToday: key === today
    });
  }

  container.innerHTML = `
    <div class="act7-wrap">
      ${cols.map(c => `
        <div class="act7-col">
          <div class="act7-bar-wrap">
            <div class="act7-bar ${c.active ? (c.isToday ? 'today' : 'active') : ''}"
                 style="height:${c.active ? '100' : '20'}%"></div>
          </div>
          <div class="act7-day ${c.isToday ? 'today' : ''}">${c.label}</div>
        </div>`).join('')}
    </div>`;
}

// Patch renderProfil
const __renderProfil = window.renderProfil;
window.renderProfil = function () {
  if (__renderProfil) __renderProfil();
  setTimeout(renderActivity7Days, 60);
};

/* ─────────────────────────────────────────────────────────────────────────
   7. LEÇON MANQUANTE — Disparition inquiétante (Art. 26 loi 2017)
      Injectée dans CHAPTERS comme leçon L205 du chapitre 2
   ───────────────────────────────────────────────────────────────────────── */
(function injectDispLesson() {
  if (typeof CHAPTERS === 'undefined') return;
  const ch2 = CHAPTERS.find(c => c.id === 'ch2');
  if (!ch2) return;
  if (ch2.lessons.find(l => l.id === 'L205')) return; // déjà injectée

  ch2.lessons.push({
    id: 'L205', em: '🔎', name: 'Disparition inquiétante', ref: 'Art. 26 loi 5 mars 2007',
    xp: 10,
    intro: 'La loi du 5 mars 2007 a instauré un dispositif spécifique pour les disparitions inquiétantes de personnes majeures. Elle confère à l\'OPJ des pouvoirs d\'investigation immédiats sans qualification pénale préalable.',
    secs: [
      {t: 'Conditions d\'application',
       items: [
         '<b>Personne majeure</b> dont la disparition est accompagnée de <b>circonstances inquiétantes</b>',
         'Circonstances inquiétantes : état fragile, dépression connue, contexte d\'enlèvement probable, comportement inhabituel',
         '<b>Pas de crime ou délit caractérisé</b> (sinon : flagrance ou préliminaire selon les faits)',
         '<b>Signalement par les proches</b> ou constat direct des forces de l\'ordre'
       ]},
      {t: 'Pouvoirs de l\'OPJ',
       items: [
         '<b>Réquisitions immédiates</b> sans procédure spécifique (opérateurs, banques, hôpitaux)',
         '<b>Consultation des fichiers</b> police (FPR, TAJ, FAED, FNAEG)',
         '<b>Auditions</b> de l\'entourage sans mesure de contrainte',
         '<b>Avis au parquet</b> dès le début des investigations',
         'Possible <b>ouverture d\'une information judiciaire</b> si indices d\'infraction'
       ]},
      {t: 'Procédure',
       items: [
         'Recueil du signalement → PV de signalement (modèle PHAROS disponible)',
         'Vérifications immédiates : domicile, hôpitaux, morgues, établissements psychiatriques',
         'Diffusion d\'un <b>avis de recherche</b> (ALPR si véhicule)',
         '<b>Alerte enlèvement</b> si mineur ou adulte vulnérable enlevé (conditions strictes)',
         'Rapport au parquet → décision sur suites judiciaires'
       ]}
    ],
    traps: [
      'Art. 26 loi 2007 s\'applique aux MAJEURS. Pour les mineurs : dispositions spécifiques CJPM/Art. 8 loi 2002.',
      'La disparition inquiétante n\'est PAS un cadre d\'enquête comme la flagrance — c\'est une procédure administrative judiciaire hybride.',
      'Pas de GAV possible sauf si infraction caractérisée apparaît en cours d\'investigation.'
    ],
    keys: [
      'Art. 26 loi 5/03/2007 : signalement personnes majeures disparues',
      'Réquisitions immédiates sans attendre qualification pénale',
      'Alerte enlèvement : conditions très strictes (mineur, adulte vulnérable, crime réel, identification possible)'
    ]
  });
})();

/* ─────────────────────────────────────────────────────────────────────────
   8. MODULE PV INTERACTIF COMPLET
      Rédaction guidée champ par champ + correction auto sur les 15 mentions
      obligatoires d'un PV + score + export texte
   ───────────────────────────────────────────────────────────────────────── */

/* ── Données des modèles de PV ── */
const PV_MODELES = [
  {
    id: 'flagrance_interpellation',
    type: 'PV FLAGRANCE',
    typeBadgeBg: 'rgba(239,68,68,.12)',
    typeBadgeColor: '#ef4444',
    icon: '🚔',
    titre: 'PV d\'interpellation — Flagrant délit',
    scenario: 'À 14h22, lors d\'une patrouille, vous interpellez M. DURAND Paul, porteur d\'un sac contenant 500g de cannabis et 1 200 € en espèces. Il nie être impliqué dans un trafic.',
    aide_global: 'Un PV de flagrance doit contenir <strong>15 mentions obligatoires</strong> issues des art. 66, 429 CPP et des formulaires DACG. Chaque champ manquant peut entraîner une nullité substantielle.',
    pieges: [
      'L\'heure de GAV = heure d\'APPRÉHENSION, pas d\'arrivée au service',
      'Les 6 objectifs de l\'art. 62-2 CPP sont CUMULATIFS — les lister tous',
      'La qualification doit citer l\'article ET la peine (ex : art. 222-37 CP — 10 ans + 7,5M€)',
      'Signature de l\'interpellé obligatoire (ou mention refus signé par 2 témoins)'
    ],
    phases: [
      {
        id: 'cartouche',
        label: 'Cartouche',
        icon: '📋',
        aide: 'Le cartouche identifie l\'acte. Il doit figurer en tête de tout PV.',
        champs: [
          { id: 'c_service',  label: 'Service rédacteur',   required: true,  hint: 'Ex : Brigade criminelle Paris 1er', type: 'text',
            validation: v => v.length >= 5, correction: 'Indiquer le service complet (ex : Direction de la PJ Paris — Brigade Criminelle)' },
          { id: 'c_date',     label: 'Date et heure des faits', required: true, hint: 'Format : 15/01/2026 à 14h22', type: 'text',
            validation: v => /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(v) && /\d{1,2}h/.test(v),
            correction: 'Format requis : JJ/MM/AAAA à HHhMM — l\'heure doit mentionner les minutes' },
          { id: 'c_lieu',     label: 'Lieu des faits',          required: true, hint: 'Rue, commune, département', type: 'text',
            validation: v => v.length >= 6, correction: 'Préciser la voie, le numéro si possible, la commune' },
          { id: 'c_ref_cpn',  label: 'Qualification pénale',    required: true, hint: 'Art. + intitulé + peine', type: 'text',
            validation: v => /art\./i.test(v) || /\d{3}-\d+/.test(v),
            correction: 'Doit citer l\'article : ex "Détention stupéfiants — art. 222-37 CP — 10 ans + 7,5M€"' },
          { id: 'c_opj',      label: 'Identité de l\'OPJ rédacteur', required: true, hint: 'Nom, prénom, matricule, grade', type: 'text',
            validation: v => v.length >= 5, correction: 'Identification complète de l\'OPJ : NOM Prénom, matricule, grade, service' }
        ]
      },
      {
        id: 'corps',
        label: 'Corps du PV',
        icon: '📝',
        aide: 'Le corps décrit chronologiquement les faits et les actes d\'investigation. Il doit répondre aux 5 questions : Quoi ? Qui ? Quand ? Où ? Comment ?',
        champs: [
          { id: 'b_circonstances', label: 'Circonstances de la découverte / saisine',
            required: true, type: 'textarea', hint: 'Patrouille, signalement, flagrance constatée…',
            validation: v => v.length >= 30,
            correction: 'Décrire : origine de l\'intervention, heure, lieu, conditions (patrouille, signalement 17, appel victime…)' },
          { id: 'b_constatations', label: 'Constatations matérielles',
            required: true, type: 'textarea', hint: 'Ce qui a été vu, trouvé, observé directement',
            validation: v => v.length >= 30,
            correction: 'Relater factuellement ce qui est constaté (objets, personnes, comportement, indices visibles)' },
          { id: 'b_apprehension', label: 'Heure et conditions d\'appréhension',
            required: true, type: 'text', hint: 'HHhMM — cadre légal (art. 73 ou 63 CPP)',
            validation: v => /\d{1,2}h/.test(v),
            correction: 'L\'heure d\'appréhension est le point de départ de la GAV — mentionner l\'article CPP utilisé' },
          { id: 'b_identite',     label: 'Identité complète de la personne interpellée',
            required: true, type: 'text', hint: 'NOM Prénom, né le, à, domicile, nationalité',
            validation: v => v.length >= 15,
            correction: 'NOM Prénom, date de naissance, lieu de naissance, domicile, nationalité, situation professionnelle' },
          { id: 'b_objectifs',    label: '6 objectifs art. 62-2 CPP (justification GAV)',
            required: true, type: 'textarea', hint: 'Lister les 6 objectifs cumulatifs applicables',
            validation: v => (v.match(/\d/g)||[]).length >= 3 || v.length >= 80,
            correction: 'Les 6 objectifs (art. 62-2) doivent être listés : investigations, présentation parquet, non-concertation, mise en cause, protection, cessation infraction' },
          { id: 'b_droits',       label: 'Droits notifiés (art. 63-1 CPP)',
            required: true, type: 'textarea', hint: 'Silence, avocat sans délai, médecin, proche, interprète…',
            validation: v => /avocat/i.test(v) && /silence/i.test(v),
            correction: 'Mentionner : droit au silence, avocat sans délai (loi 22/04/2024), médecin, proche + employeur, interprète, accusé réception signé' }
        ]
      },
      {
        id: 'mentions',
        label: 'Mentions légales',
        icon: '⚖️',
        aide: 'Ces 15 mentions sont obligatoires pour la validité du PV. Cocher celles que vous avez incluses.',
        mentions_checklist: [
          { id: 'mn_1',  text: 'Cadre légal (flagrance art. 53 CPP)' },
          { id: 'mn_2',  text: 'Heure d\'appréhension (≠ arrivée service)' },
          { id: 'mn_3',  text: 'Qualification pénale avec article ET peine' },
          { id: 'mn_4',  text: 'Identité complète de l\'interpellé' },
          { id: 'mn_5',  text: 'Justification des 6 objectifs art. 62-2' },
          { id: 'mn_6',  text: 'Notification droits art. 63-1 (avocat sans délai)' },
          { id: 'mn_7',  text: 'Avis immédiat au Procureur de la République' },
          { id: 'mn_8',  text: 'Demande d\'avocat ou refus mentionné' },
          { id: 'mn_9',  text: 'Examen médical proposé (résultat ou refus)' },
          { id: 'mn_10', text: 'Avis à un proche / employeur (résultat ou refus)' },
          { id: 'mn_11', text: 'Numéro(s) de scellé(s) pour objets saisis' },
          { id: 'mn_12', text: 'Signature de l\'interpellé ou mention refus' },
          { id: 'mn_13', text: 'Identité complète de l\'OPJ rédacteur + matricule' },
          { id: 'mn_14', text: 'Heure de début et de fin des actes' },
          { id: 'mn_15', text: 'Mention de lecture et approbation du PV' }
        ]
      },
      {
        id: 'correction',
        label: 'Correction',
        icon: '✅',
        aide: '',
        champs: []
      }
    ]
  },
  {
    id: 'audition_gav',
    type: 'PV AUDITION',
    typeBadgeBg: 'rgba(27,107,255,.12)',
    typeBadgeColor: '#4d8fff',
    icon: '🎙️',
    titre: 'PV d\'audition GAV',
    scenario: 'M. DURAND Paul est placé en GAV depuis 14h22. Vous procédez à son audition à 16h00, en présence de son avocat.',
    aide_global: 'Le PV d\'audition en GAV diffère de celui d\'un témoin : l\'interpellé NE prête PAS serment, peut garder le silence, et doit être assisté de son avocat.',
    pieges: [
      'JAMAIS de serment pour une personne en GAV (seulement pour les témoins)',
      'Les droits doivent être rappelés EN DÉBUT d\'audition (même s\'ils l\'ont été lors du placement en GAV)',
      'Présence de l\'avocat obligatoire sauf refus explicite de l\'interpellé',
      'Toute déclaration recueillie avant notification des droits est nulle'
    ],
    phases: [
      {
        id: 'cartouche',
        label: 'Cartouche',
        icon: '📋',
        aide: 'Le cartouche de l\'audition est distinct de celui du PV d\'interpellation.',
        champs: [
          { id: 'au_service',  label: 'Service / Date / Heure début audition', required: true, type: 'text', hint: 'Service, JJ/MM/AAAA, HHhMM',
            validation: v => v.length >= 8, correction: 'Mentionner service rédacteur, date et heure exacte de début d\'audition' },
          { id: 'au_identite', label: 'Identité de la personne auditionnée',   required: true, type: 'text', hint: 'NOM Prénom, né le, qualité (GAV)',
            validation: v => v.length >= 10, correction: 'NOM Prénom, date de naissance, qualité : Personne gardée à vue' },
          { id: 'au_avocat',   label: 'Avocat présent (nom) ou refus mention', required: true, type: 'text', hint: 'Me DUPONT Jean ou "Refus de l\'intéressé"',
            validation: v => v.length >= 4,  correction: 'Mentionner le nom de l\'avocat ou le refus explicite de l\'interpellé d\'être assisté' }
        ]
      },
      {
        id: 'corps',
        label: 'Contenu',
        icon: '📝',
        aide: 'La retranscription doit être fidèle. Utiliser le format Q/R (Question/Réponse) ou le style narratif approuvé par votre service.',
        champs: [
          { id: 'aud_rappel_droits', label: 'Rappel des droits en début d\'audition',
            required: true, type: 'textarea', hint: 'Droit au silence, avocat, interprète — rappelés à HHhMM',
            validation: v => /silence/i.test(v) || /droit/i.test(v),
            correction: 'Mentionner le rappel des droits (art. 63-1 CPP) : silence, avocat, interprète — JAMAIS de serment en GAV' },
          { id: 'aud_sans_serment', label: 'Mention absence de serment',
            required: true, type: 'text', hint: 'Ex : "Je l\'ai invité à déclarer en l\'absence de tout serment"',
            validation: v => /serment/i.test(v),
            correction: 'Formule obligatoire : "La personne est informée qu\'elle n\'est pas tenue de prêter serment" ou similaire' },
          { id: 'aud_declarations', label: 'Déclarations de l\'intéressé',
            required: true, type: 'textarea', hint: 'Retranscription fidèle ou mention "Garde le silence"',
            validation: v => v.length >= 10,
            correction: 'Retranscrire fidèlement les déclarations ou noter "L\'intéressé garde le silence conformément à son droit"' },
          { id: 'aud_cloture',     label: 'Clôture : heure de fin + signatures',
            required: true, type: 'text', hint: 'Terminé à HHhMM — Lu, approuvé, signé',
            validation: v => /\d{1,2}h/.test(v),
            correction: 'Indiquer heure de fin, mention "lu, approuvé" et signatures de l\'OPJ, de l\'interpellé (ou mention refus) et de l\'avocat' }
        ]
      },
      {
        id: 'mentions',
        label: 'Vérif. légale',
        icon: '⚖️',
        aide: 'Points de contrôle spécifiques à l\'audition GAV.',
        mentions_checklist: [
          { id: 'amn_1',  text: 'Rappel des droits en début d\'audition' },
          { id: 'amn_2',  text: 'ABSENCE de serment mentionnée explicitement' },
          { id: 'amn_3',  text: 'Présence avocat notée (ou refus signé)' },
          { id: 'amn_4',  text: 'Heure de début et de fin de l\'audition' },
          { id: 'amn_5',  text: 'Déclarations retranscrites fidèlement (Q/R)' },
          { id: 'amn_6',  text: 'Silence de l\'interpellé mentionné si applicable' },
          { id: 'amn_7',  text: 'Signature interpellé ou refus motivé + 2 témoins' },
          { id: 'amn_8',  text: 'Signature OPJ + identité complète' }
        ]
      },
      {
        id: 'correction', label: 'Correction', icon: '✅', aide: '', champs: []
      }
    ]
  }
];

/* ── État du module PV ── */
const PV_STATE = {
  modele:       null,   // modèle actif
  phaseIdx:     0,      // index de la phase active
  answers:      {},     // { champId: valeur }
  checklist:    {},     // { mentionId: boolean }
  validated:    false
};

/* ── Ouvrir le module PV ── */
window.openPVModule = function (modeleId) {
  const modele = PV_MODELES.find(m => m.id === modeleId);
  if (!modele) return;
  PV_STATE.modele   = modele;
  PV_STATE.phaseIdx = 0;
  PV_STATE.answers  = {};
  PV_STATE.checklist = {};
  PV_STATE.validated = false;

  // Créer l'overlay s'il n'existe pas
  let ov = document.getElementById('pv-module-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'pv-module-ov';
    ov.className = 'pv-modal-ov';
    ov.innerHTML = '<div class="pv-sheet" id="pv-sheet-inner"></div>';
    ov.addEventListener('click', e => { if (e.target === ov) window.closePVModule(); });
    document.body.appendChild(ov);
  }
  ov.classList.add('show');
  document.body.style.overflow = 'hidden';
  _pvRender();
};

window.closePVModule = function () {
  const ov = document.getElementById('pv-module-ov');
  if (ov) ov.classList.remove('show');
  document.body.style.overflow = '';
};

/* ── Rendu du module PV ── */
function _pvRender() {
  const sheet = document.getElementById('pv-sheet-inner');
  if (!sheet || !PV_STATE.modele) return;
  const m     = PV_STATE.modele;
  const phase = m.phases[PV_STATE.phaseIdx];

  // Header
  const phaseTabs = m.phases.map((p, i) => {
    const isDone    = i < PV_STATE.phaseIdx;
    const isActive  = i === PV_STATE.phaseIdx;
    return `<div class="pv-phase-tab ${isActive ? 'active' : isDone ? 'done' : ''}"
              onclick="window._pvGoPhase(${i})">${isDone ? '✓' : p.icon} ${p.label}</div>`;
  }).join('');

  let body = `
    <div class="pv-header">
      <div class="pv-header-top">
        <span style="font-size:22px">${m.icon}</span>
        <div>
          <span class="pv-type-badge" style="background:${m.typeBadgeBg};color:${m.typeBadgeColor}">${m.type}</span>
          <div class="pv-title">${m.titre}</div>
        </div>
        <button onclick="window.closePVModule()" style="margin-left:auto;background:var(--bg-3);border:none;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;color:var(--t2)">✕</button>
      </div>
      <div class="pv-phase-tabs">${phaseTabs}</div>
    </div>
    <div class="pv-body">`;

  // Phase : correction → résultats
  if (phase.id === 'correction') {
    body += _pvRenderCorrection();
  }
  // Phase : mentions checklist
  else if (phase.mentions_checklist) {
    body += _pvRenderMentions(phase);
  }
  // Phase : champs de saisie
  else {
    // Scénario (affiché sur phase 0 seulement)
    if (PV_STATE.phaseIdx === 0) {
      body += `<div class="pv-aide-card">📋 <strong>Scénario :</strong> ${m.scenario}</div>`;
      body += `<div class="pv-aide-card" style="background:rgba(0,201,122,.06);border-color:rgba(0,201,122,.2)">${m.aide_global}</div>`;
    }
    if (phase.aide) {
      body += `<div class="pv-aide-card">${phase.aide}</div>`;
    }
    // Pièges
    if (PV_STATE.phaseIdx === 0 && m.pieges?.length) {
      body += m.pieges.map(p => `
        <div class="pv-piege-card">
          <div class="pv-piege-lbl">⚠️ Piège d'examen</div>
          <div class="pv-piege-txt">${p}</div>
        </div>`).join('');
    }
    // Champs
    body += `<div class="pv-section-lbl">${phase.icon} ${phase.label}</div>`;
    phase.champs.forEach(champ => {
      const val = PV_STATE.answers[champ.id] || '';
      const typeAttr = champ.type === 'textarea' ? 'textarea' : 'input';
      body += `
        <div class="pv-field-group" id="fg-${champ.id}">
          <div class="pv-label">
            ${champ.label}
            ${champ.required ? '<span class="req">*</span>' : ''}
            <span class="hint">${champ.hint || ''}</span>
          </div>
          ${typeAttr === 'textarea'
            ? `<textarea class="pv-textarea" id="pv-${champ.id}" placeholder="${champ.hint || ''}" oninput="window._pvSave('${champ.id}',this.value)">${val}</textarea>`
            : `<input class="pv-input" id="pv-${champ.id}" type="text" placeholder="${champ.hint || ''}" value="${val.replace(/"/g,'&quot;')}" oninput="window._pvSave('${champ.id}',this.value)">`
          }
        </div>`;
    });
  }

  body += `</div>`;

  // Bouton navigation en bas
  const isLastContentPhase = PV_STATE.phaseIdx === m.phases.length - 2; // avant correction
  const isCorrectionPhase  = phase.id === 'correction';
  const isMentionPhase     = !!phase.mentions_checklist;
  body += `<div class="pv-validate-bar">`;
  if (isCorrectionPhase) {
    body += `<button class="btn btn-p btn-full" onclick="window.closePVModule();if(typeof addXP==='function')addXP(50);if(typeof showToast==='function')showToast('🏅 PV validé ! +50 XP','ok')">✅ Terminer (+50 XP)</button>`;
  } else {
    body += `<button class="btn btn-p btn-full" onclick="window._pvNextPhase()">${isMentionPhase ? '📊 Voir ma correction →' : 'Phase suivante →'}</button>`;
  }
  body += `</div>`;

  sheet.innerHTML = body;
}

window._pvSave = function (id, val) {
  PV_STATE.answers[id] = val;
};

window._pvGoPhase = function (idx) {
  // N'autoriser que les phases déjà atteintes
  if (idx <= PV_STATE.phaseIdx) {
    PV_STATE.phaseIdx = idx;
    _pvRender();
  }
};

window._pvNextPhase = function () {
  const m = PV_STATE.modele;
  if (!m) return;
  if (PV_STATE.phaseIdx < m.phases.length - 1) {
    PV_STATE.phaseIdx++;
    _pvRender();
    // Scroll haut
    const sheet = document.getElementById('pv-module-ov');
    if (sheet) sheet.scrollTop = 0;
  }
};

function _pvRenderMentions(phase) {
  const checks = phase.mentions_checklist;
  return `
    <div class="pv-aide-card">${phase.aide || 'Cochez toutes les mentions que vous avez incluses dans votre PV.'}</div>
    <div class="pv-mention-grid">
      ${checks.map(m => {
        const checked = !!PV_STATE.checklist[m.id];
        return `
          <div class="pv-mention-chip ${checked ? 'checked' : ''}" onclick="window._pvToggleMention('${m.id}',this)">
            <span>${checked ? '✅' : '○'}</span>
            <span style="font-size:10px;line-height:1.3">${m.text}</span>
          </div>`;
      }).join('')}
    </div>`;
}

window._pvToggleMention = function (id, el) {
  PV_STATE.checklist[id] = !PV_STATE.checklist[id];
  el.classList.toggle('checked', PV_STATE.checklist[id]);
  el.innerHTML = `<span>${PV_STATE.checklist[id] ? '✅' : '○'}</span><span style="font-size:10px;line-height:1.3">${el.querySelector('span:last-child').textContent}</span>`;
};

function _pvRenderCorrection() {
  const m = PV_STATE.modele;
  let totalChamps = 0, correctChamps = 0;
  const results = [];

  // Évaluer les champs de chaque phase
  m.phases.forEach(phase => {
    if (!phase.champs?.length) return;
    phase.champs.forEach(champ => {
      if (!champ.validation) return;
      totalChamps++;
      const val  = PV_STATE.answers[champ.id] || '';
      const isOk = champ.validation(val);
      if (isOk) correctChamps++;
      results.push({ label: champ.label, ok: isOk, val, correction: champ.correction });
    });
  });

  // Évaluer les checklists
  m.phases.forEach(phase => {
    if (!phase.mentions_checklist) return;
    phase.mentions_checklist.forEach(mn => {
      totalChamps++;
      const isOk = !!PV_STATE.checklist[mn.id];
      if (isOk) correctChamps++;
      results.push({ label: mn.text, ok: isOk, val: '', correction: 'Mention obligatoire — à inclure dans tout PV' });
    });
  });

  const pct   = totalChamps > 0 ? Math.round(correctChamps / totalChamps * 100) : 0;
  const color = pct >= 80 ? 'var(--ok)' : pct >= 60 ? 'var(--warn)' : 'var(--err)';
  const msg   = pct >= 90 ? '🏆 Excellent ! PV validé' : pct >= 70 ? '👍 Bien — quelques oublis' : '💪 À retravailler';

  // Donner les XP
  const xp = Math.round(pct / 100 * 50);
  if (typeof addXP === 'function' && !PV_STATE.validated) {
    PV_STATE.validated = true;
    addXP(xp);
  }

  const errors = results.filter(r => !r.ok);
  const ok     = results.filter(r =>  r.ok);

  return `
    <div class="pv-score-card">
      <div class="pv-score-total" style="color:${color}">${pct}%</div>
      <div class="pv-score-lbl">${correctChamps}/${totalChamps} mentions correctes · +${xp} XP</div>
      <div style="height:6px;background:var(--bg-3);border-radius:100px;overflow:hidden">
        <div style="height:100%;width:${pct}%;border-radius:100px;background:${color};transition:width .6s ease"></div>
      </div>
    </div>
    <div style="text-align:center;font-size:15px;font-weight:700;color:${color};margin-bottom:16px">${msg}</div>

    ${errors.length ? `
      <div class="pv-section-lbl">❌ Points à corriger (${errors.length})</div>
      ${errors.map(r => `
        <div class="pv-corr-item">
          <div class="pv-corr-status pv-corr-ko">
            <span>✗</span>
            <span style="font-size:12px;font-weight:700">${r.label}</span>
          </div>
          <div class="pv-corr-answer">→ ${r.correction}</div>
        </div>`).join('')}` : ''}

    ${ok.length ? `
      <div class="pv-section-lbl">✅ Mentions correctes (${ok.length})</div>
      ${ok.map(r => `
        <div class="pv-corr-item" style="border-color:rgba(0,201,122,.2)">
          <div class="pv-corr-status pv-corr-ok">
            <span>✓</span>
            <span style="font-size:12px;font-weight:700">${r.label}</span>
          </div>
        </div>`).join('')}` : ''}`;
}

/* ── Point d'entrée dans la nav (onglet Révision) ── */
window.openPVSelector = function () {
  let ov = document.getElementById('pv-selector-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'pv-selector-ov';
    ov.style.cssText = [
      'position:fixed','inset:0','z-index:350',
      'background:rgba(0,0,0,.75)','backdrop-filter:blur(12px)',
      'display:flex','align-items:center','justify-content:center',
      'padding:20px'
    ].join(';');
    ov.innerHTML = `
      <div style="width:100%;max-width:380px;background:var(--bg-1);border-radius:24px;padding:22px;border:1px solid var(--brd-l)">
        <div style="font-family:'Syne',sans-serif;font-size:19px;font-weight:900;color:var(--t1);margin-bottom:6px">📝 Module PV Interactif</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:18px">Rédige un PV guidé et reçois une correction automatique sur les mentions obligatoires.</div>
        ${PV_MODELES.map(m => `
          <div class="pv-launch-card" onclick="document.getElementById('pv-selector-ov').remove();window.openPVModule('${m.id}')">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:24px">${m.icon}</span>
              <div>
                <div class="pv-launch-title">${m.titre}</div>
                <div class="pv-launch-sub">${m.scenario.substring(0, 60)}…</div>
              </div>
            </div>
          </div>`).join('')}
        <button class="btn btn-ghost btn-full mt8" onclick="document.getElementById('pv-selector-ov').remove()" style="margin-top:8px">Fermer</button>
      </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   9. INJECTIONS HTML dans les pages existantes
      — Bouton PV dans l'onglet Révision (après le sélecteur d'onglets)
      — Graphique 7j sur le profil est déjà géré par renderProfil() patch
   ───────────────────────────────────────────────────────────────────────── */
function _injectPVButton() {
  // Chercher le conteneur de l'onglet révision
  const revMenu = document.getElementById('rev-menu');
  if (!revMenu || document.getElementById('pv-inject-btn')) return;

  const div = document.createElement('div');
  div.id = 'pv-inject-btn';
  div.className = 'pv-launch-card';
  div.style.marginBottom = '12px';
  div.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <span style="font-size:28px">📝</span>
      <div style="flex:1">
        <div class="pv-launch-title">Module PV Interactif</div>
        <div class="pv-launch-sub">Rédige un PV guidé · Correction auto sur 15 mentions</div>
      </div>
      <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--ok);font-weight:700;background:var(--ok-bg);padding:3px 8px;border-radius:6px">NOUVEAU</span>
    </div>`;
  div.onclick = () => window.openPVSelector();

  // Insérer avant le premier enfant du menu révision
  revMenu.insertBefore(div, revMenu.firstChild);
}

/* ─────────────────────────────────────────────────────────────────────────
   10. NOTIFICATIONS PUSH PWA
    ───────────────────────────────────────────────────────────────────────── */
window.requestPushNotifications = async function () {
  if (!('Notification' in window)) {
    if (typeof showToast === 'function') showToast('Notifications non supportées', 'err');
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    if (typeof showToast === 'function') showToast('🔔 Notifications activées !', 'ok');
    // Notification de test
    setTimeout(() => {
      new Notification('OPJ Elite — Rappel quotidien', {
        body: '📚 Ta session du jour t\'attend. Maintiens ton streak !',
        icon: '/icon-192.png'
      });
    }, 2000);
    if (window.S) { window.S.notifEnabled = true; if (typeof save === 'function') save(); }
  } else {
    if (typeof showToast === 'function') showToast('Notifications refusées', 'err');
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   11. PATCH navigateTo — injections après navigation
   ───────────────────────────────────────────────────────────────────────── */
const __navigateTo = window.navigateTo;
window.navigateTo = function (page) {
  if (__navigateTo) __navigateTo(page);
  setTimeout(() => {
    if (page === 'revision') _injectPVButton();
    if (page === 'profil')   renderActivity7Days();
  }, 80);
};

/* ─────────────────────────────────────────────────────────────────────────
   12. BACKUP FSRS complet (évite l'écrasement par app.js)
       Exposer avant que app.js ne puisse écraser window.FSRS
   ───────────────────────────────────────────────────────────────────────── */
// On sauvegarde le FSRS complet (depuis fsrs.js, qui est chargé en premier)
// Ce backup est utilisé si window.FSRS perd sa méthode getDue
if (window.FSRS && window.FSRS.getDue) {
  window._FSRS_FULL = { ...window.FSRS };
}

/* ─────────────────────────────────────────────────────────────────────────
   13. BOOT DE CE PATCH
   ───────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Ré-appliquer loadState sécurisé si app.js a déjà été chargé
  // (la redéfinition de window.loadState ci-dessus ne s'applique que
  //  aux prochains appels — le boot initial a déjà tourné)
  // On vérifie et corrige le state si nécessaire
  if (window.S && !window.S.qcm) {
    if (typeof defaultState === 'function') {
      window.S = { ...defaultState(), ...window.S };
    }
  }
  // Injection du bouton PV si on est sur révision
  if (window.S?.page === 'revision') _injectPVButton();
  // Vérifier FSRS.getDue
  if (window.FSRS && !window.FSRS.getDue && window._FSRS_FULL) {
    window.FSRS = window._FSRS_FULL;
  }
}, { once: true });

// Exposer openPVModule globalement pour les boutons HTML inline
window.PV_MODELES = PV_MODELES;

})(); // fin IIFE patch
