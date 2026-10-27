import { describe, expect, it } from 'vitest';
import { aufbauAus } from './aufbau';
import { auswahlInhalt } from './auswahl';
import { darstellungsAufbau } from './darstellung';
import { doppelspalt } from './index';
import { konstruiere } from './konstruktion';
import { gangunterschied, maximumWinkel, standardAufbau } from './physik';

const start = Object.fromEntries(doppelspalt.parameter.map((p) => [p.schluessel, p.start]));
const bild = darstellungsAufbau(standardAufbau);
const abstand = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Stelle z auf dem Bild-Schirm mit Gangunterschied q·λ (Bisektion, Δs wächst mit z). */
function schirmStelle(q: number): number {
  let lo = 0;
  let hi = 8;
  for (let i = 0; i < 80; i++) {
    const mitte = (lo + hi) / 2;
    if (gangunterschied(bild, mitte) / bild.wellenlaenge < q) lo = mitte;
    else hi = mitte;
  }
  return (lo + hi) / 2;
}

describe('Gangunterschied-Dreieck', () => {
  it('Δs ist exakt der Unterschied der Weglängen, |QP| = kurzer Weg', () => {
    for (const ziel of [{ x: 3, y: 2 }, { x: 12, y: -4.5 }, { x: 0.5, y: 0.3 }]) {
      const k = konstruiere(bild, ziel);
      expect(k.gangunterschied).toBeCloseTo(abstand(k.fern, ziel) - abstand(k.nah, ziel), 12);
      expect(abstand(k.q, ziel)).toBeCloseTo(abstand(k.nah, ziel), 12);
      expect(abstand(k.fern, k.q)).toBeCloseTo(k.gangunterschied, 12);
    }
  });

  it('weit weg: Δs → d·sin θ und das Lot steht senkrecht auf dem Weg', () => {
    const theta = 0.3;
    const ziel = { x: 1e4 * Math.cos(theta), y: 1e4 * Math.sin(theta) };
    const k = konstruiere(bild, ziel);
    expect(k.gangunterschied).toBeCloseTo(bild.spaltabstand * Math.sin(theta), 3);
    // Skalarprodukt Lot · Wegrichtung ≈ 0
    const lot = { x: k.q.x - k.nah.x, y: k.q.y - k.nah.y };
    const weg = { x: ziel.x - k.fern.x, y: ziel.y - k.fern.y };
    const cos = (lot.x * weg.x + lot.y * weg.y) / (Math.hypot(lot.x, lot.y) * Math.hypot(weg.x, weg.y));
    expect(Math.abs(cos)).toBeLessThan(1e-3);
  });
});

describe('Erklärung zum angeklickten Punkt', () => {
  it('am m-ten hellen Streifen: Δs = m λ, „hell", echter Winkel = θ_m', () => {
    for (const m of [1, 2, 3]) {
      const a = auswahlInhalt(start, { x: 99, z: schirmStelle(m), aufSchirm: true });
      expect(a.groessen.q.wert).toBeCloseTo(m, 6);
      expect(a.text).toContain('hell');
      expect(a.text).toContain(`Maximum ${m}. Ordnung`);
      expect(a.groessen.thetaP.wert).toBeCloseTo(maximumWinkel(aufbauAus(start), m), 9);
    }
  });

  it('am dunklen Streifen: Δs = 1,5 λ, „dunkel"', () => {
    const a = auswahlInhalt(start, { x: 99, z: schirmStelle(1.5), aufSchirm: true });
    expect(a.groessen.q.wert).toBeCloseTo(1.5, 6);
    expect(a.text).toContain('dunkel');
    expect(a.text).toContain('genau 1,5 Wellenlängen');
  });

  // Die 5. Ordnung liegt im Bild unter ~39°, also NEBEN dem Bild-Schirm (|z| ≤ 8) — im
  // Wellenfeld kann man sie aber anklicken. Darum hier ein Feldpunkt bei x = 6.
  it('5. Ordnung bei d = 5b: eigentlich hell, aber fehlt (Einzelspalt-Minimum)', () => {
    const x = 6;
    let lo = 0;
    let hi = 8;
    for (let i = 0; i < 80; i++) {
      const z = (lo + hi) / 2;
      if (konstruiere(bild, { x, y: z }).gangunterschied / bild.wellenlaenge < 5) lo = z;
      else hi = z;
    }
    const a = auswahlInhalt(start, { x, z: lo, aufSchirm: false });
    expect(a.groessen.q.wert).toBeCloseTo(5, 6);
    expect(a.text).toContain('fehlt');
  });

  it('Mitte: gleich lange Wege, 0. Ordnung', () => {
    const a = auswahlInhalt(start, { x: 99, z: 0, aufSchirm: true });
    expect(a.text).toContain('gleich lang');
  });

  it('Punkt auf dem Schirm wandert mit, wenn L sich ändert', () => {
    const a = auswahlInhalt({ ...start, L: 1.4 }, { x: 99, z: 2, aufSchirm: true });
    const b = darstellungsAufbau(aufbauAus({ ...start, L: 1.4 }));
    expect(a.groessen.q.wert).toBeCloseTo(gangunterschied(b, 2) / b.wellenlaenge, 9);
  });
});
