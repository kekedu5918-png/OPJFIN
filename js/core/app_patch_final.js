/* ================================================================
   OPJ Elite — PATCH FINAL v52
   S'exécute après app.js
   Corrige: navigateTo display:flex, finishAuth bnav, boot display:flex
   ================================================================ */
(function applyFinalPatch() {
  'use strict';

  /* ── PATCH 1: navigateTo ─────────────────────────────────────── */
  // app.js définit navigateTo comme function declaration -> window.navigateTo
  // On l'écrase ici APRÈS son chargement
  var _origNav = window.navigateTo;
  window.navigateTo = function(page) {
    // Cacher toutes les pages
    document.querySelectorAll('.page').forEach(function(p) {
      p.style.display = 'none';
      p.classList.remove('active');
    });
    // Afficher la cible en FLEX
    var el = document.getElementById('p-' + page);
    if (el) {
      el.style.display = 'flex';
      el.style.flex = '1';
      el.style.flexDirection = 'column';
      el.style.overflowY = 'auto';
      el.classList.add('active');
    }
    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(function(b) {
      b.classList.toggle('active', b.id === 'nav-' + page);
    });
    // XP header
    if (window.S) {
      var hxp = document.getElementById('hdr-xp');
      if (hxp) hxp.textContent = (S.user.xp || 0) + ' XP';
    }
    // Grade pill
    if (typeof getGrade === 'function') {
      try {
        var g = getGrade();
        ['hdr-grade-pill','hdr-grade-pill-lec'].forEach(function(id) {
          var e = document.getElementById(id);
          if (e) e.textContent = g.name;
        });
      } catch(e2) {}
    }
    // Renderers
    try {
      if (page === 'home'     && typeof renderHome     === 'function') renderHome();
      if (page === 'lecons'   && typeof renderLecons   === 'function') renderLecons();
      if (page === 'profil'   && typeof renderProfil   === 'function') renderProfil();
      if (page === 'revision' && typeof renderRevision === 'function') {
        renderRevision();
        setTimeout(function() {
          if (typeof setRevTab === 'function') {
            setRevTab((window.S && window.S.rev && window.S.rev.tab) || 'qcm');
          }
        }, 30);
      }
    } catch(e3) { console.warn('[OPJ] renderer:', page, e3); }

    // Missions patch
    try {
      if (page === 'home') {
        if (typeof renderMissionsCard === 'function') renderMissionsCard();
        if (typeof renderStudyPlan   === 'function') renderStudyPlan();
      }
      if (page === 'profil') {
        if (typeof renderErrorAnalysis === 'function') renderErrorAnalysis();
      }
    } catch(e4) {}

    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  /* ── PATCH 2: finishAuth ─────────────────────────────────────── */
  // app.js finishAuth fait app.style.display='block' + appelle navigateTo local
  // On écrase finishAuth pour corriger display et montrer bnav
  var _origFinish = window.finishAuth;
  window.finishAuth = function(name) {
    // Masquer onboarding
    var onb = document.getElementById('onboarding');
    if (onb) onb.style.display = 'none';

    // App en FLEX
    var app = document.getElementById('app');
    if (app) {
      app.style.display = 'flex';
      app.style.flexDirection = 'column';
      app.style.minHeight = '100dvh';
    }

    // Montrer bnav
    var bnav = document.getElementById('bnav');
    if (bnav) bnav.style.display = 'flex';

    // Bouton logout
    var btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = window.currentUser ? 'flex' : 'none';

    // Sync status
    var syncStatus = document.getElementById('sync-status');
    if (syncStatus) syncStatus.textContent = window.currentUser ? 'Cloud ☁️' : 'Local';

    // Init
    try { if (typeof updateStreak   === 'function') updateStreak();   } catch(e) {}
    try { if (typeof THEME28        !== 'undefined') THEME28.apply(); } catch(e) {}

    // Naviguer vers home
    setTimeout(function() {
      window.navigateTo('home');

      // Toast
      setTimeout(function() {
        var n = name || (window.S && window.S.user && window.S.user.name) || 'Officier';
        if (typeof showToast === 'function') showToast('Bienvenue ' + n + ' ! 🎯', 'ok');
      }, 150);

      // Badges
      setTimeout(function() {
        try { if (typeof BADGES !== 'undefined' && BADGES.checkAll) BADGES.checkAll(); } catch(e) {}
        try { if (typeof SHIELD !== 'undefined' && SHIELD.checkOnOpen) SHIELD.checkOnOpen(); } catch(e) {}
        try { if (typeof renderMissionsCard === 'function') renderMissionsCard(); } catch(e) {}
        try { if (typeof renderStudyPlan    === 'function') renderStudyPlan();    } catch(e) {}
        try { if (typeof renderMotivBanner  === 'function') renderMotivBanner();  } catch(e) {}
        try { if (typeof renderQDJ          === 'function') renderQDJ();          } catch(e) {}
      }, 400);
    }, 60);
  };

  /* ── PATCH 3: startOfflineMode ───────────────────────────────── */
  var _origOffline = window.startOfflineMode;
  window.startOfflineMode = function() {
    if (typeof _origOffline === 'function') {
      try { _origOffline(); } catch(e) {}
    }
    var bnav = document.getElementById('bnav');
    if (bnav) bnav.style.display = 'flex';
  };

  /* ── PATCH 4: MutationObserver display:block -> flex ─────────── */
  var appEl = document.getElementById('app');
  if (appEl) {
    new MutationObserver(function() {
      if (appEl.style.display === 'block') {
        appEl.style.display = 'flex';
        appEl.style.flexDirection = 'column';
      }
      if (appEl.style.display && appEl.style.display !== 'none') {
        var bnav2 = document.getElementById('bnav');
        if (bnav2 && bnav2.style.display === 'none') bnav2.style.display = 'flex';
        setTimeout(function() {
          var anyActive = document.querySelector('.page.active');
          if (!anyActive) window.navigateTo('home');
        }, 100);
      }
    }).observe(appEl, { attributes: true, attributeFilter: ['style'] });
  }

  console.log('[OPJ Elite] Patch final v52 ✓ — navigateTo:flex, finishAuth:flex, bnav:visible');
})();
