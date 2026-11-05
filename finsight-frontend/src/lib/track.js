// Fire-and-forget product analytics. Never throws and never blocks the UI.
import api from '../services/api';

let session;
try {
  session = sessionStorage.getItem('fs.session') || Math.random().toString(36).slice(2, 12);
  sessionStorage.setItem('fs.session', session);
} catch { session = undefined; }

export default function track(name) {
  api.events.track(name, session).catch(() => {});
}
