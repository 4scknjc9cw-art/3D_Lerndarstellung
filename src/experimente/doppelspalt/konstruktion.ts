// Das Gangunterschied-Dreieck aus dem Schulbuch, exakt konstruiert (ohne Grafik, testbar).
//
// Vom Zielpunkt P aus wird die Länge des KÜRZEREN Wegs auf dem längeren abgetragen (Punkt Q).
// Was vom längeren Weg übrig bleibt (Strecke vom fernen Spalt bis Q), ist genau Δs.
// Die Linie vom nahen Spalt zu Q ist dabei fast senkrecht zum Weg — das ist das „Lot" aus dem
// Schulbuch. Für weit entfernte Punkte wird das Dreieck rechtwinklig, und es gilt Δs = d·sin θ.
// Bewusst exakt statt mit Lot: dann stimmt Δs auch nahe am Spalt, wo die Wege nicht parallel sind.

import { type Aufbau, gangunterschied, spaltMitte } from './physik';

export interface Punkt2 {
  x: number;
  y: number;
}

export interface Konstruktion {
  nah: Punkt2; // Mitte des Spalts mit dem kürzeren Weg
  fern: Punkt2; // Mitte des anderen Spalts
  ziel: Punkt2; // P
  q: Punkt2; // auf dem langen Weg, |Q P| = |nah P|
  gangunterschied: number; // |fern Q| = |fern P| − |nah P|  (≥ 0)
  winkel: number; // θ: Richtung von der Blendenmitte zu P gegen die Achse (Vorzeichen = Seite)
}

/**
 * Echte Größen zu einem Punkt mit Gangunterschied q (in Wellenlängen) — die Brücke vom Bild
 * zum echten Aufbau (siehe auswahl.ts): Δs = q·λ, d·sin θ = Δs, x = L·tan θ, und daraus die
 * beiden echten Weglängen von den Spaltmitten bis zum Schirmpunkt.
 */
export function echteGroessen(echt: Aufbau, q: number) {
  const ds = Math.abs(q) * echt.wellenlaenge;
  const theta = Math.asin(Math.min(1, ds / echt.spaltabstand));
  const x = echt.schirmabstand * Math.tan(theta);
  const halbD = echt.spaltabstand / 2;
  return {
    ds,
    theta,
    x,
    wegNah: Math.hypot(echt.schirmabstand, x - halbD),
    wegFern: Math.hypot(echt.schirmabstand, x + halbD),
  };
}

/**
 * Stelle z auf dem Bild-Schirm mit vorzeichenbehaftetem Gangunterschied q·λ (Bisektion; Δs
 * wächst mit z). null, wenn sie neben dem Schirm läge.
 */
export function schirmStelle(bild: Aufbau, q: number, halbeBreite: number): number | null {
  const ziel = q * bild.wellenlaenge;
  if (Math.abs(ziel) > gangunterschied(bild, halbeBreite)) return null;
  let lo = -halbeBreite;
  let hi = halbeBreite;
  for (let i = 0; i < 60; i++) {
    const mitte = (lo + hi) / 2;
    if (gangunterschied(bild, mitte) < ziel) lo = mitte;
    else hi = mitte;
  }
  return (lo + hi) / 2;
}

/**
 * Nächster Streifen auf dem Bild-Schirm. Streifen = halbe Vielfache von λ im Gangunterschied:
 * ganze → hell, halbe → dunkel. schritt 0 rastet am nächstgelegenen ein, ±1 geht einen
 * Streifen weiter in ±z. Am Rand des Schirms bleibt die Stelle stehen.
 */
export function naechsterStreifen(
  bild: Aufbau,
  z: number,
  schritt: -1 | 0 | 1,
  halbeBreite: number,
): number {
  const halbe = (2 * gangunterschied(bild, z)) / bild.wellenlaenge; // in halben λ
  // Kleiner Spielraum, damit ein Punkt genau auf einem Streifen nicht an Rundung hängen bleibt.
  const n =
    schritt === 0
      ? Math.round(halbe)
      : schritt > 0
        ? Math.floor(halbe + 1e-6) + 1
        : Math.ceil(halbe - 1e-6) - 1;
  return schirmStelle(bild, n / 2, halbeBreite) ?? z;
}

export function konstruiere(aufbau: Aufbau, ziel: Punkt2): Konstruktion {
  const oben = { x: 0, y: spaltMitte(aufbau, 'oben') };
  const unten = { x: 0, y: spaltMitte(aufbau, 'unten') };
  const abstand = (a: Punkt2, b: Punkt2) => Math.hypot(a.x - b.x, a.y - b.y);
  // Liegt P oberhalb der Achse, ist der obere Spalt näher (und umgekehrt).
  const [nah, fern] = ziel.y >= 0 ? [oben, unten] : [unten, oben];
  const kurz = abstand(nah, ziel);
  const lang = abstand(fern, ziel);
  const anteil = kurz / lang; // Q liegt von P aus bei „kurz" auf dem Weg zu „fern"
  const q = { x: ziel.x + (fern.x - ziel.x) * anteil, y: ziel.y + (fern.y - ziel.y) * anteil };
  return {
    nah,
    fern,
    ziel,
    q,
    gangunterschied: lang - kurz,
    winkel: Math.atan2(ziel.y, ziel.x),
  };
}
