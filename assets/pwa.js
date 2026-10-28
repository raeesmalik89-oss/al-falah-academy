/* Registers the service worker so the site is installable and works offline.
 * Safe to include on every page; registration only runs where supported. */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (err) {
        console.warn('SW registration failed:', err);
      });
    });
  }
})();
