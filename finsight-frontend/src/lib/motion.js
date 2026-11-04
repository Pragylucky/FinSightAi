// Non-component motion helpers (kept out of the component file for fast refresh).

export const EASE = [0.22, 1, 0.36, 1];

// Adds --mx/--my CSS vars on pointer move for the .spotlight effect.
export function trackSpotlight(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}
