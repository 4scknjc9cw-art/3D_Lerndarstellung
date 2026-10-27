// Prüft die Huygens-Rechnung (physik.ts) gegen die Lehrbuchformeln.
// Die Rechnung baut NICHT auf diesen Formeln auf — stimmen beide überein, stimmt die Physik.
import { describe, expect, it } from 'vitest';
import {
  type Aufbau,
  gangunterschied,
  intensitaetLehrbuch,
  maximumWinkel,
  minimumWinkel,
  schirmIntensitaet,
  standardAufbau,
  streifenabstand,
  winkel,
} from './physik';

const A = standardAufbau;

/** Sucht das lokale Maximum von f im Fenster yStart ± fenster. */
function maximumNaheVon(f: (y: number) => number, yStart: number, fenster: number): number {
  const schritte = 2000;
  let bestesY = yStart;
  let bestesI = -Infinity;
  for (let i = 0; i <= schritte; i++) {
    const y = yStart - fenster + (2 * fenster * i) / schritte;
    const wert = f(y);
    if (wert > bestesI) {
      bestesI = wert;
      bestesY = y;
    }
  }
  return bestesY;
}

/** Lokales Maximum der gerechneten (Huygens-)Helligkeit nahe yStart. */
function maximumNahe(aufbau: Aufbau, yStart: number): number {
  return maximumNaheVon((y) => schirmIntensitaet(aufbau, y), yStart, streifenabstand(aufbau) / 2);
}

const yAusWinkel = (theta: number) => A.schirmabstand * Math.tan(theta);

describe('Doppelspalt-Physik', () => {
  it('Streifenabstand Δx = λL/d ergibt 5 mm bei den Standardwerten', () => {
    expect(streifenabstand(A)).toBeCloseTo(5e-3, 10);
  });

  it('Muster ist spiegelsymmetrisch', () => {
    for (const y of [1e-3, 3.7e-3, 12e-3]) {
      expect(schirmIntensitaet(A, y)).toBeCloseTo(schirmIntensitaet(A, -y), 9);
    }
  });

  it('Minima liegen bei d·sin θ = (m+½)·λ — dort ist es (fast) völlig dunkel', () => {
    for (const m of [0, 1, 2, 3]) {
      expect(schirmIntensitaet(A, yAusWinkel(minimumWinkel(A, m)))).toBeLessThan(1e-4);
    }
  });

  // d·sin θ = m·λ gilt nur für schmale Spalte: die Einzelspalt-Hülle zieht die Maxima nach
  // innen. Bei b = d/5 liegt das 3. Maximum echt ~5 % weiter innen (docs/schritt1-messung.md).
  // Darum zwei Prüfungen: schmale Spalte gegen die Schulformel, breite gegen die volle Formel.
  it('schmale Spalte: Maxima bei d·sin θ = m·λ (Abweichung < 1 % des Streifenabstands)', () => {
    const schmal = { ...A, spaltbreite: A.spaltabstand / 20 };
    for (const m of [1, 2, 3]) {
      const erwartet = yAusWinkel(maximumWinkel(schmal, m));
      const gerechnet = maximumNahe(schmal, erwartet);
      expect(Math.abs(gerechnet - erwartet) / streifenabstand(schmal)).toBeLessThan(0.01);
    }
  });

  it('breite Spalte: Maxima wie in cos²·sinc² (Abweichung < 0,1 %) und nach innen gerückt', () => {
    for (const m of [1, 2, 3]) {
      const schulformel = yAusWinkel(maximumWinkel(A, m));
      const gerechnet = maximumNahe(A, schulformel);
      const lehrbuch = maximumNaheVon(
        (y) => intensitaetLehrbuch(A, winkel(A, y)),
        schulformel,
        streifenabstand(A) / 2,
      );
      expect(Math.abs(gerechnet - lehrbuch) / streifenabstand(A)).toBeLessThan(0.001);
      expect(gerechnet).toBeLessThan(schulformel);
    }
  });

  it('Gangunterschied am Maximum m ist m·λ', () => {
    for (const m of [0, 1, 2, 3]) {
      const ds = gangunterschied(A, yAusWinkel(maximumWinkel(A, m)));
      expect(ds / A.wellenlaenge).toBeCloseTo(m, 3);
    }
  });

  it('ganzes Profil stimmt mit cos²·sinc² überein (max. Abweichung < 0,01)', () => {
    let maxAbweichung = 0;
    for (let y = -30e-3; y <= 30e-3; y += 0.05e-3) {
      const d = Math.abs(schirmIntensitaet(A, y) - intensitaetLehrbuch(A, winkel(A, y)));
      maxAbweichung = Math.max(maxAbweichung, d);
    }
    expect(maxAbweichung).toBeLessThan(0.01);
  });

  it('fehlende Ordnung: bei d = 5b verschwindet das 5. Maximum (Einzelspalt-Minimum)', () => {
    expect(A.spaltabstand / A.spaltbreite).toBeCloseTo(5, 10);
    expect(schirmIntensitaet(A, yAusWinkel(maximumWinkel(A, 5)))).toBeLessThan(1e-3);
    expect(schirmIntensitaet(A, yAusWinkel(maximumWinkel(A, 1)))).toBeGreaterThan(0.8);
  });

  it('rotes Licht gibt breitere Streifen als blaues', () => {
    const rot = streifenabstand({ ...A, wellenlaenge: 650e-9 });
    const blau = streifenabstand({ ...A, wellenlaenge: 450e-9 });
    expect(rot).toBeGreaterThan(blau);
  });
});
