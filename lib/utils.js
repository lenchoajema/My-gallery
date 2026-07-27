// Deterministic pseudo-random rotation so each photo always tilts the same
// way (server and client render the same value), giving a hand-placed
// scrapbook look instead of a perfect grid.
export function tiltFor(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  const degrees = (hash % 900) / 100 - 4.5; // range roughly -4.5deg .. 4.5deg
  return degrees.toFixed(2);
}

export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "graduation", label: "Graduation" },
  { value: "reunion", label: "Reunion" },
  { value: "other", label: "Other" },
];
