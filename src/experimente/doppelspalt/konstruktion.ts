// Das Gangunterschied-Dreieck aus dem Schulbuch, exakt konstruiert (ohne Grafik, testbar).
//
// Vom Zielpunkt P aus wird die Länge des KÜRZEREN Wegs auf dem längeren abgetragen (Punkt Q).
// Was vom längeren Weg übrig bleibt (Strecke vom fernen Spalt bis Q), ist genau Δs.
// Die Linie vom nahen Spalt zu Q ist dabei fast senkrecht zum Weg — das ist das „Lot" aus dem
// Schulbuch. Für weit entfernte Punkte wird das Dreieck rechtwinklig, und es gilt Δs = d·sin θ.
// Bewusst exakt statt mit Lot: dann stimmt Δs auch nahe am Spalt, wo die Wege nicht parallel sind.

import { type Aufbau, spaltMitte } from './physik';

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
