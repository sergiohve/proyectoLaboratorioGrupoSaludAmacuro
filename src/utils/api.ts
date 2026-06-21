const REMOTE = 'https://backinvent.onrender.com';
const LOCAL  = 'http://localhost:4000';

// Electron serves frontend from localhost:4000 — detect by port, not hostname.
// Dev server runs on :3000, production web has no port → both use remote.
export const API_BASE: string =
  typeof window !== 'undefined' && window.location.port === '4000'
    ? LOCAL
    : REMOTE;
