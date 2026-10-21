/**
 * SERVICE WORKER - IDAF PLATAFORMA Y CAMPO (PWA OFFLINE COMPLETA)
 * Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF)
 * Garantiza funcionamiento 100% offline de la calculadora y de la app de campo
 * en zonas forestales, montes y dehesas sin cobertura móvil.
 */

const CACHE_NAME = 'idaf-full-offline-v2.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './field.html',
  './login.html',
  './manifest.json',
  './css/styles.css',
  './css/field.css',
  './js/config.js',
  './js/core/auth.js',
  './js/core/calculations.js',
  './js/core/models.js',
  './js/parsers/fileParser.js',
  './js/parsers/kmlParser.js',
  './js/ui/app.js',
  './js/ui/charts.js',
  './js/ui/mapManager.js',
  './js/ui/report.js',
  './js/field/fieldApp.js',
  './js/field/fieldStorage.js',
  './js/field/fieldExporter.js',
  './data/species_database.json',
  './data/regulations_database.json',
  './data/templates/plantilla_inventario_rodales.csv',
  './data/templates/ejemplo_delimitacion_finca.kml',
  './assets/logo_idaf_horizontal.png',
  './assets/logo_idaf_isotipo.png',
  './assets/logo_idaf_vertical.png'
];

// Instalación: Precargar recursos esenciales de toda la plataforma
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[IDAF ServiceWorker] Precaching completo para plataforma y campo offline');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de versiones obsoletas de caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[IDAF ServiceWorker] Eliminando caché obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch: Cache-First con fallback a red
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cachear respuestas externas válidas (ej. Leaflet, Chart.js, SheetJS, Google Fonts, FontAwesome)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'error') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallbacks inteligentes sin conexión
        if (event.request.mode === 'navigate') {
          const url = new URL(event.request.url);
          if (url.pathname.endsWith('field.html')) {
            return caches.match('./field.html');
          }
          return caches.match('./index.html');
        }
      });
    })
  );
});
