const CACHE = 'opj-v51';
const STATIC = [
  '/', '/index.html', '/manifest.json',
  '/css/tokens.css', '/css/components.css', '/css/pages.css',
  '/js/data/questions.js', '/js/data/flashcards.js',
  '/js/data/procedures.js', '/js/data/chapters.js',
  '/js/data/annales.js', '/js/data/printsheets.js',
  '/js/core/state.js', '/js/core/fsrs.js',
  '/js/core/audio.js', '/js/core/supabase.js',
  '/js/ui/navigation.js', '/js/ui/home.js',
  '/js/ui/lessons.js', '/js/ui/revision.js',
  '/js/ui/exam.js', '/js/ui/profile.js',
  '/js/ui/gamification.js', '/js/app.js'
];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(STATIC))
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  )
));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
