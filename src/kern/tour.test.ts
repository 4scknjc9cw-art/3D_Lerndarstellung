import { describe, expect, it } from 'vitest';
import { doppelspalt } from '../experimente/doppelspalt';
import { Parameter } from './parameter';
import { type Tour, TourSpieler } from './tour';

const start = Object.fromEntries(doppelspalt.parameter.map((p) => [p.schluessel, p.start]));
const ansicht = { position: [0, 1, 1] as [number, number, number], ziel: [0, 0, 0] as [number, number, number] };

const probe: Tour = {
  titel: 'Probe',
  schritte: [
    { titel: 'A', kamera: ansicht, text: '' },
    { titel: 'B', kamera: ansicht, text: '', startwerte: { d: 0.2e-3 }, freieRegler: ['d'] },
  ],
};

describe('Tour-Maschine', () => {
  it('Schritt setzt seine Startwerte, Zurück stellt den Standard wieder her', () => {
    const p = new Parameter(doppelspalt.parameter);
    const t = new TourSpieler(probe, p, start);
    t.gehe(0);
    t.weiter();
    expect(p.alle.d).toBeCloseTo(0.2e-3, 12);
    p.setze('lambda', 650e-9); // man probiert im Schritt herum …
    t.zurueck();
    // … und beim Zurückspringen sieht Schritt A wieder genauso aus wie vorher.
    expect(p.alle.d).toBeCloseTo(start.d, 12);
    expect(p.alle.lambda).toBeCloseTo(start.lambda, 15);
  });

  it('bleibt an den Enden stehen', () => {
    const t = new TourSpieler(probe, new Parameter(doppelspalt.parameter), start);
    t.gehe(0);
    t.zurueck();
    expect(t.aktuell).toBe(0);
    t.gehe(99);
    expect(t.aktuell).toBe(1);
    t.weiter();
    expect(t.aktuell).toBe(1);
  });

  it('Tippfehler in einem Schritt fällt beim Laden auf', () => {
    const kaputt: Tour = { titel: 'X', schritte: [{ titel: 'A', kamera: ansicht, text: '', freieRegler: ['dd'] }] };
    expect(() => new TourSpieler(kaputt, new Parameter(doppelspalt.parameter), start)).toThrow();
  });

  it('alle echten Tour-Schritte: Regler, Startwerte, Szenenteile und Platzhalter gültig', () => {
    const p = new Parameter(doppelspalt.parameter);
    const teile = ['laser', 'einfall', 'blende', 'feld', 'schirm'];
    for (const tour of doppelspalt.touren) {
      expect(() => new TourSpieler(tour, p, start)).not.toThrow();
      for (const s of tour.schritte) {
        for (const teil of s.sichtbar ?? []) expect(teile).toContain(teil);
        const g = doppelspalt.groessen(start);
        for (const vorlage of [s.text, ...(s.formeln ?? [])]) {
          for (const [, name] of vorlage.matchAll(/\[\[(\w+)\]\]/g)) expect(g).toHaveProperty(name);
        }
      }
    }
  });
});
