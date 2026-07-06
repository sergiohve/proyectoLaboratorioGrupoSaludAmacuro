'use strict';
// Set electron flag in localStorage before ANY page JS runs.
// localStorage is shared between preload and the page (same origin, different JS context).
// Sidebar.tsx reads this flag synchronously to know it's running in Electron.
try {
  localStorage.setItem('__electron_app__', '1');
} catch (e) {}
