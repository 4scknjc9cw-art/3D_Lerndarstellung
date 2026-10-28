import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { alsTex, alsText, setzeEin } from '../../kern/format';
import { aufbauAus } from './aufbau';
import { auswahlInhalt } from './auswahl';
import { darstellungsAufbau, SCHIRM_HALB } from './darstellung';
import { doppelspalt } from './index';
import { echteGroessen, konstruiere, naechsterStreifen } from './konstruktion';
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

describe('Punkt von Streifen zu Streifen (Kurt: nicht frei beweglich)', () => {
  const qBei = (z: number) => gangunterschied(bild, z) / bild.wellenlaenge;

  it('springt hell → dunkel → hell, in halben Wellenlängen, nach beiden Seiten', () => {
    let z = naechsterStreifen(bild, 0.3, 0, SCHIRM_HALB); // rastet in der Mitte ein
    expect(qBei(z)).toBeCloseTo(0, 6);
    const folge: number[] = [];
    for (let i = 0; i < 4; i++) {
      z = naechsterStreifen(bild, z, 1, SCHIRM_HALB);
      folge.push(qBei(z));
    }
    folge.forEach((q, i) => expect(q).toBeCloseTo((i + 1) / 2, 6));
    for (let i = 0; i < 6; i++) z = naechsterStreifen(bild, z, -1, SCHIRM_HALB);
    expect(qBei(z)).toBeCloseTo(-1, 6); // über die Mitte hinweg auf die andere Seite
  });

  it('Klick zwischen zwei Streifen rastet am nächsten ein', () => {
    expect(qBei(naechsterStreifen(bild, schirmStelle(1.2), 0, SCHIRM_HALB))).toBeCloseTo(1, 6);
    expect(qBei(naechsterStreifen(bild, schirmStelle(1.3), 0, SCHIRM_HALB))).toBeCloseTo(1.5, 6);
  });

  it('am Rand des Schirms bleibt der Punkt stehen', () => {
    let z = 0;
    for (let i = 0; i < 100; i++) z = naechsterStreifen(bild, z, 1, SCHIRM_HALB);
    expect(z).toBeLessThanOrEqual(SCHIRM_HALB);
    expect(naechsterStreifen(bild, z, 1, SCHIRM_HALB)).toBe(z);
  });

  it('über das Experiment: Einzelspalt hat keine Streifen, sonst landet P auf dem Schirm', () => {
    expect(doppelspalt.streifen({ ...start, spalte: 1 }, null, 0)).toBeNull();
    const p = doppelspalt.streifen(start, null, 1);
    expect(p).toMatchObject({ aufSchirm: true });
    expect(auswahlInhalt(start, p!).text).toContain('0. Ordnung');
  });
});

describe('Echte Zahlen am Dreieck', () => {
  it('erster heller Streifen: Δs = 500 nm, x = 5,00 mm, und s₂ − s₁ = Δs', () => {
    const g = echteGroessen(standardAufbau, 1);
    expect(g.ds).toBeCloseTo(500e-9, 15);
    expect(g.x * 1e3).toBeCloseTo(5.0, 2);
    // Die echten Weglängen (≈ 1 m) unterscheiden sich wirklich um Δs (auf 0,1 % genau).
    expect((g.wegFern - g.wegNah) / g.ds).toBeCloseTo(1, 3);
    expect(g.wegNah).toBeGreaterThan(standardAufbau.schirmabstand);
  });
});

describe('Kasten „Punkt P"', () => {
  it('Formeln lassen sich setzen (TeX gültig, alle Platzhalter bekannt)', () => {
    const p = doppelspalt.streifen(start, null, 0)!;
    const a = auswahlInhalt(start, { ...p, z: schirmStelle(1) });
    const g = { ...doppelspalt.groessen(start), ...a.groessen };
    for (const f of a.formeln) {
      expect(() => katex.renderToString(setzeEin(f, g, alsTex), { throwOnError: true })).not.toThrow();
    }
    expect(() => setzeEin(a.text, g, alsText)).not.toThrow();
  });
});
