// src/constants/theme.ts
//
// Read from the live bulldogging.pro stylesheet rather than from the spine
// document. Where the two disagree the shipped site wins: a user opening
// the app straight off the website should not feel a colour change.

export const colors = {
  background: '#0e1319',
  surface: '#161d26',
  card: '#1c2531',
  border: '#2e3b4a',
  text: '#d3dbe6',
  muted: '#93a1b3',
  accent: '#d9a441',
  accentAlt: '#6f9fd8',
  cream: '#eef2f7',
  success: '#4ba36b',
  warning: '#d99a2b',
  danger: '#c8503f',
} as const;

export const app = {
  name: "Bulldogging",
  short: "Bulldogging",
  domain: "bulldogging.pro",
  eventType: "steerwrestling",
  eventLabel: "Steer wrestling",
  tagline: "Nobody bulldogs alone.",
  associations: ["PRCA","NIRA","NHSRA"] as readonly string[],
} as const;

// Spacing follows the house rule from the BarrelConnect cursor rules:
// screens px-5 py-6 gap-y-6, cards p-4 rounded-2xl gap-y-2.
export const spacing = { screenX: 20, screenY: 24, gap: 24, cardPad: 16 } as const;
export const radius = { card: 16, pill: 999, control: 12 } as const;
