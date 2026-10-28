// Übersetzt den echten Aufbau in den Darstellungsmaßstab (Einheiten der 3D-Szene).
//
// Warum zwei Maßstäbe: Echtes Licht hat λ = 500 nm bei d = 0,1 mm und L = 1 m. Maßstabsgetreu
// wäre die Welle unsichtbar klein, und die Grafikkarte (32-Bit-Zahlen) könnte k·r ≈ 10⁷ gar
// nicht rechnen. Im Bild ist darum λ stark vergrößert (Verhältnis d/λ = 8 statt 200).
// Was erhalten bleibt — und worauf es beim Verstehen ankommt:
//   - d/b bleibt gleich (fehlende Ordnungen erscheinen an der richtigen Stelle)
//   - größeres λ → größere Bild-Welle, größeres d → engere Streifen, größeres L → Schirm weiter weg
// Was NICHT erhalten bleibt: die Winkel sind im Bild viel größer als in echt.
// Zahlen und Text kommen deshalb immer aus dem echten Aufbau, nie aus diesem.

import type { Aufbau } from './physik';

/** Bezugswerte: so groß erscheint der Standardaufbau in der Szene. */
const BEZUG = {
  wellenlaengeEcht: 500e-9,
  wellenlaengeBild: 0.35,
  spaltabstandEcht: 0.1e-3,
  spaltabstandBild: 2.8,
  schirmabstandBild: 12, // je Meter echtem L
};

export const SCHIRM_MIN = 6;
/** Halbe Breite von Schirm und Wellenfeld quer zur Achse (z von −8 bis +8). */
export const SCHIRM_HALB = 8;
export const SCHIRM_MAX = 18;

export function darstellungsAufbau(echt: Aufbau): Aufbau {
  const laengenFaktor = BEZUG.spaltabstandBild / BEZUG.spaltabstandEcht;
  const wellenlaenge = (echt.wellenlaenge * BEZUG.wellenlaengeBild) / BEZUG.wellenlaengeEcht;
  // d und b mit demselben Faktor, damit d/b und damit die fehlenden Ordnungen stimmen.
  const spaltbreite = echt.spaltbreite * laengenFaktor;
  return {
    wellenlaenge,
    spaltabstand: echt.spaltabstand * laengenFaktor,
    spaltbreite,
    schirmabstand: Math.min(
      SCHIRM_MAX,
      Math.max(SCHIRM_MIN, BEZUG.schirmabstandBild * echt.schirmabstand),
    ),
    // Im Bild sieht man das Feld unter ALLEN Winkeln, darum müssen die Huygens-Quellen dicht
    // liegen (≤ λ/4), sonst entstehen falsche Nebenstrahlen. Mehr als nötig kostet nur
    // Grafikleistung. (Im echten Aufbau genügen 16, siehe physik.ts.)
    quellenJeSpalt: Math.min(32, Math.max(8, Math.ceil((4 * spaltbreite) / wellenlaenge))),
    spalte: echt.spalte,
  };
}
