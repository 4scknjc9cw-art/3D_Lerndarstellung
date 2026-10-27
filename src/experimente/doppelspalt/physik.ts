// Physik des Doppelspalts — reine Rechenfunktionen ohne Grafik, damit sie testbar sind.
//
// Koordinaten (alles in Metern, echte Werte — nie im Darstellungsmaßstab rechnen):
//   x = Abstand hinter der Blende (Blende bei x = 0, Schirm bei x = L)
//   y = quer zur Ausbreitung (Mitte zwischen den Spalten bei y = 0)
//
// Modell: Huygens-Prinzip. Jeder Spalt wird in mehrere Punktquellen zerlegt, jede sendet eine
// Kreiswelle (mit Neigungsfaktor cos θ, Rayleigh-Sommerfeld), das Feld ist die Summe. Dadurch entsteht die Einzelspalt-Hülle von selbst —
// gegen die Lehrbuchformel wird das nur geprüft (physik.test.ts), nicht aus ihr gebaut.

export interface Aufbau {
  wellenlaenge: number; // λ
  spaltabstand: number; // d, Mitte zu Mitte
  spaltbreite: number; // b
  schirmabstand: number; // L
  quellenJeSpalt: number; // Huygens-Punktquellen pro Spalt
}

/** Schulbuch-Standardwerte: grünes Licht, typische Laborblende. */
export const standardAufbau: Aufbau = {
  wellenlaenge: 500e-9,
  spaltabstand: 0.1e-3,
  spaltbreite: 0.02e-3,
  schirmabstand: 1,
  // Quellabstand b/16 ist hier größer als λ. Das erzeugt Geister-Nebenstrahlen erst bei
  // sin θ = 16λ/b ≥ 0,15 — weit außerhalb des Schirmbereichs (Winkel ≤ 0,03). Das Bild
  // (darstellung.ts) braucht dichtere Quellen, weil man dort alle Winkel sieht.
  quellenJeSpalt: 16,
};

/** Komplexe Zahl als Zeiger: Länge = Amplitude, Winkel = Phase der Welle. */
export interface Zeiger {
  re: number;
  im: number;
}

export type Spalt = 'oben' | 'unten';

export function spaltMitte(aufbau: Aufbau, spalt: Spalt): number {
  return spalt === 'oben' ? aufbau.spaltabstand / 2 : -aufbau.spaltabstand / 2;
}

/** y-Lagen der Punktquellen eines Spalts, gleichmäßig über die Spaltbreite verteilt. */
export function punktquellen(aufbau: Aufbau, spalt: Spalt): number[] {
  const n = aufbau.quellenJeSpalt;
  const mitte = spaltMitte(aufbau, spalt);
  // Mitte jedes Teilstücks statt Ränder: so bleibt die Quelle symmetrisch zur Spaltmitte.
  return Array.from({ length: n }, (_, i) => mitte + aufbau.spaltbreite * ((i + 0.5) / n - 0.5));
}

/**
 * Welle, die von EINEM Spalt am Punkt (x, y) ankommt.
 * Getrennt von der Summe, weil Phase 2 (Welcher-Weg-Detektor) genau hier ansetzt:
 * mit Detektor werden die Intensitäten der Spalte addiert statt ihre Wellen.
 */
export function feldVonSpalt(aufbau: Aufbau, spalt: Spalt, x: number, y: number): Zeiger {
  const k = (2 * Math.PI) / aufbau.wellenlaenge;
  const quellen = punktquellen(aufbau, spalt);
  let re = 0;
  let im = 0;
  for (const yq of quellen) {
    const r = Math.hypot(x, y - yq);
    // 1/√r: Kreiswelle in der Ebene verteilt ihre Energie auf einen Umfang ∝ r.
    // x/r = cos θ (Neigungsfaktor): eine Elementarwelle strahlt nach vorn am stärksten und
    // gar nicht entlang der Wand. Ohne ihn liefen die Wellen direkt hinter der Blende
    // seitlich weg, als kämen sie durch die Wand (Kurt, 27.10.2026).
    const amplitude = x / r / Math.sqrt(r) / quellen.length;
    re += amplitude * Math.cos(k * r);
    im += amplitude * Math.sin(k * r);
  }
  return { re, im };
}

/** Gesamtwelle beider Spalte am Punkt (x, y): Wellen addieren — das ist Interferenz. */
export function feld(aufbau: Aufbau, x: number, y: number): Zeiger {
  const a = feldVonSpalt(aufbau, 'oben', x, y);
  const b = feldVonSpalt(aufbau, 'unten', x, y);
  return { re: a.re + b.re, im: a.im + b.im };
}

/**
 * Momentane Auslenkung der Welle zur Zeit t (für die Animation: Berg/Tal).
 * Nur die Phase ωt läuft mit, darum reicht hier eine Phase statt echter Zeit.
 */
export function auslenkung(zeiger: Zeiger, phase: number): number {
  return zeiger.re * Math.cos(phase) + zeiger.im * Math.sin(phase);
}

/** Zeitlich gemittelte Helligkeit = Betragsquadrat des Zeigers. */
export function intensitaet(zeiger: Zeiger): number {
  return zeiger.re * zeiger.re + zeiger.im * zeiger.im;
}

/** Helligkeit am Schirm an Stelle y, bezogen auf die Mitte (Mitte = 1). */
export function schirmIntensitaet(aufbau: Aufbau, y: number): number {
  const L = aufbau.schirmabstand;
  return intensitaet(feld(aufbau, L, y)) / intensitaet(feld(aufbau, L, 0));
}

// --- Lehrbuchformeln (zum Anzeigen im Text und zum Prüfen der Rechnung oben) ---

/** Winkel zum Schirmpunkt y, von der Mitte zwischen den Spalten aus gesehen. */
export function winkel(aufbau: Aufbau, y: number): number {
  return Math.atan2(y, aufbau.schirmabstand);
}

/** Gangunterschied Δs der beiden Wege (Spaltmitte → Schirmpunkt), exakt gerechnet. */
export function gangunterschied(aufbau: Aufbau, y: number): number {
  const L = aufbau.schirmabstand;
  const unten = Math.hypot(L, y - spaltMitte(aufbau, 'unten'));
  const oben = Math.hypot(L, y - spaltMitte(aufbau, 'oben'));
  return unten - oben;
}

/** Winkel des Maximums m-ter Ordnung aus d · sin θ = m · λ (NaN, wenn es keins gibt). */
export function maximumWinkel(aufbau: Aufbau, m: number): number {
  return Math.asin((m * aufbau.wellenlaenge) / aufbau.spaltabstand);
}

/** Winkel des Minimums aus d · sin θ = (m + ½) · λ. */
export function minimumWinkel(aufbau: Aufbau, m: number): number {
  return Math.asin(((m + 0.5) * aufbau.wellenlaenge) / aufbau.spaltabstand);
}

/** Streifenabstand in der Kleinwinkelnäherung: Δx ≈ λ · L / d. */
export function streifenabstand(aufbau: Aufbau): number {
  return (aufbau.wellenlaenge * aufbau.schirmabstand) / aufbau.spaltabstand;
}

/** Fraunhofer-Formel: cos²-Streifen mal Einzelspalt-Hülle sinc². */
export function intensitaetLehrbuch(aufbau: Aufbau, theta: number): number {
  const s = Math.sin(theta);
  const streifen = Math.cos((Math.PI * aufbau.spaltabstand * s) / aufbau.wellenlaenge);
  const u = (Math.PI * aufbau.spaltbreite * s) / aufbau.wellenlaenge;
  const huelle = u === 0 ? 1 : Math.sin(u) / u;
  return streifen * streifen * huelle * huelle;
}
