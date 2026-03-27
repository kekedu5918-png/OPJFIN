/* ═══════════════════════════════════════════════════════
   OPJ ELITE — Service Worker v53
   Chemins corrigés pour correspondre à la structure réelle :
   /css/  /js/  /js/data/  /js/core/  /icons/
   ═══════════════════════════════════════════════════════ */

const CACHE = 'opj-v53';

const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',

  /* CSS */
  '/css/tokens.css',
  '/css/components.css',
  '/css/pages.css',

  /* JS — core (chargés en premier) */
  '/js/core/fsrs.js',
  '/js/core/audio.js',

  /* JS — app principal */
  '/js/app.js',
  '/js/app_patch.js',

  /* JS — données */
  '/js/data/questions.js',
  '/js/data/flashcards.js',
  '/js/data/chapters.js',
  '/js/data/procedures.js',
  '/js/data/annales.js',
  '/js/data/printsheets.js',

  /* JS — stubs (même vides, doivent être déclarés) */
  '/js/core/supabase.js',
  '/js/ui/navigation.js',
  '/js/ui/home.js',
  '/js/ui/lessons.js',
  '/js/ui/revision.js',
  '/js/ui/exam.js',
  '/js/ui/profile.js',
  '/js/ui/gamification.js',

  /* Icons PWA */
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/* ── Install : mise en cache des assets statiques ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      /* addAll échoue si un fichier est absent.
         On utilise une boucle avec gestion d'erreur individuelle
         pour ne pas bloquer l'install si un asset est manquant. */
      return Promise.allSettled(
        STATIC.map(url => c.add(url).catch(() => {
          console.warn('[SW] Cache miss (non bloquant):', url);
        }))
      );
    })
  );
  self.skipWaiting();
});

/* ── Activate : purge des anciens caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Suppression ancien cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch : cache-first pour les assets, network-first pour Supabase ── */
self.addEventListener('fetch', e => {
  const url = e.request.url;

  /* Ne jamais intercepter les requêtes Supabase ou externes */
  if (url.includes('supabase.co') ||
      url.includes('googleapis.com') ||
      url.includes('gstatic.com') ||
      url.startsWith('chrome-extension') ||
      e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        /* Mettre en cache la réponse pour les prochaines fois */
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        /* Offline fallback : retourner index.html pour les navigations */
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

/* ── Push notifications ── */
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'OPJ Elite', {
      body: data.body || '📚 Ta session quotidienne t\'attend. Maintiens ton streak !',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data?.url || '/')
  );
});
