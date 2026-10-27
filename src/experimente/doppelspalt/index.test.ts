// Prüft den Doppelspalt als Experiment: Zahlen im Erklärtext und das Bild über ALLE
// Reglerbereiche — nicht nur beim Standardwert.
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { alsTex, alsText, setzeEin } from '../../kern/format';
import { darstellungsAufbau } from './darstellung';
import { aufbauAus } from './aufbau';
import { doppelspalt } from './index';
import { standardAufbau } from './physik';
import { MAX_QUELLEN } from './wellenfeld';

const start = Object.fromEntries(doppelspalt.parameter.map((p) => [p.schluessel, p.start]));

/** Alle Kombinationen aus Minimum und Maximum jedes Reglers (2⁴ = 16 Ecken). */
function ecken(): Record<string, number>[] {
  let liste: Record<string, number>[] = [{}];
  for (const p of doppelspalt.parameter) {
    liste = liste.flatMap((w) => [
      { ...w, [p.schluessel]: p.min },
      { ...w, [p.schluessel]: p.max },
    ]);
  }
  return liste;
}

describe('Doppelspalt-Experiment', () => {
  it('Startwerte = Standardaufbau aus Schritt 1', () => {
    expect(aufbauAus(start)).toEqual(standardAufbau);
  });

  it('Zahlen im Text: Δx = 5,0 mm und θ₁ = 0,29° beim Standard', () => {
    const g = doppelspalt.groessen(start);
    expect(alsText(g.deltaX)).toBe('5,0 mm');
    // sin θ₁ = 500 nm / 0,1 mm = 0,005 → θ₁ = 0,2865°
    expect(alsText(g.theta1)).toBe('0,29 °');
  });

  it('Δx bei d = 0,2 mm, λ = 650 nm, L = 1,5 m ist 4,9 mm (λL/d)', () => {
    const g = doppelspalt.groessen({ ...start, d: 0.2e-3, lambda: 650e-9, L: 1.5 });
    expect(g.deltaX.wert).toBeCloseTo((650e-9 * 1.5) / 0.2e-3, 12);
    expect(alsText(g.deltaX)).toBe('4,9 mm');
  });

  it('jede Formel und der Text lassen sich setzen (alle Platzhalter bekannt, TeX gültig)', () => {
    const g = doppelspalt.groessen(start);
    for (const f of doppelspalt.erklaerung.formeln) {
      expect(() => katex.renderToString(setzeEin(f, g, alsTex), { throwOnError: true })).not.toThrow();
    }
    expect(() => setzeEin(doppelspalt.erklaerung.text, g, alsText)).not.toThrow();
  });

  describe.each(ecken())('Bild an der Reglerecke %o', (werte) => {
    const bild = darstellungsAufbau(aufbauAus(werte));
    it('Spalte laufen nicht ineinander (Mittelsteg ≥ eine Spaltbreite)', () => {
      expect(bild.spaltabstand - bild.spaltbreite).toBeGreaterThanOrEqual(bild.spaltbreite);
    });
    it('Huygens-Quellen dicht genug (≤ λ/4) und passen in den Shader', () => {
      expect(bild.spaltbreite / bild.quellenJeSpalt).toBeLessThanOrEqual(bild.wellenlaenge / 4);
      expect(2 * bild.quellenJeSpalt).toBeLessThanOrEqual(MAX_QUELLEN);
    });
    it('Spalte passen auf die Blende', () => {
      expect(bild.spaltabstand / 2 + bild.spaltbreite).toBeLessThan(8);
    });
  });
});
