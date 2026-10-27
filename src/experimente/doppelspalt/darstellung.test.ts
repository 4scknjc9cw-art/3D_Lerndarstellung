// Das Bild ist nicht maßstabsgetreu — aber es darf nie in die falsche RICHTUNG zeigen.
import { describe, expect, it } from 'vitest';
import { darstellungsAufbau } from './darstellung';
import { wellenlaengeZuFarbe } from './farbe';
import { type Aufbau, schirmIntensitaet, standardAufbau } from './physik';

const A = standardAufbau;

/** Lage des 1. hellen Streifens neben der Mitte im Bild (erstes lokales Maximum für z > 0). */
function erstesMaximumBild(echt: Aufbau): number {
  const bild = darstellungsAufbau(echt);
  let vorher = schirmIntensitaet(bild, 0);
  let fallend = false;
  for (let z = 0.001; z < 8; z += 0.001) {
    const jetzt = schirmIntensitaet(bild, z);
    if (jetzt < vorher) fallend = true;
    else if (fallend) return z;
    vorher = jetzt;
  }
  return NaN;
}

describe('Darstellungsmaßstab', () => {
  it('d/b bleibt erhalten (fehlende Ordnungen an der richtigen Stelle)', () => {
    const bild = darstellungsAufbau(A);
    expect(bild.spaltabstand / bild.spaltbreite).toBeCloseTo(A.spaltabstand / A.spaltbreite, 10);
  });

  it('größeres d → engere Streifen auch im Bild', () => {
    expect(erstesMaximumBild({ ...A, spaltabstand: 0.12e-3, spaltbreite: 0.024e-3 })).toBeLessThan(
      erstesMaximumBild(A),
    );
  });

  it('rotes Licht → breitere Streifen auch im Bild', () => {
    expect(erstesMaximumBild({ ...A, wellenlaenge: 650e-9 })).toBeGreaterThan(
      erstesMaximumBild({ ...A, wellenlaenge: 450e-9 }),
    );
  });

  it('größeres L → breitere Streifen auch im Bild', () => {
    expect(erstesMaximumBild({ ...A, schirmabstand: 1.2 })).toBeGreaterThan(
      erstesMaximumBild({ ...A, schirmabstand: 0.8 }),
    );
  });

  it('Huygens-Quellen liegen im Bild dicht genug (Abstand ≤ λ/4)', () => {
    const bild = darstellungsAufbau(A);
    expect(bild.spaltbreite / bild.quellenJeSpalt).toBeLessThanOrEqual(bild.wellenlaenge / 4);
  });

  it('Bild-Schirm: 5. Ordnung fehlt wie in echt (d = 5b)', () => {
    const bild = darstellungsAufbau(A);
    const theta = Math.asin((5 * bild.wellenlaenge) / bild.spaltabstand);
    const z = bild.schirmabstand * Math.tan(theta);
    expect(schirmIntensitaet(bild, z)).toBeLessThan(0.02);
  });
});

describe('Lichtfarbe', () => {
  const groesster = (rgb: number[]) => rgb.indexOf(Math.max(...rgb));
  it('650 nm ist rot, 530 nm grün, 450 nm blau', () => {
    expect(groesster(wellenlaengeZuFarbe(650e-9))).toBe(0);
    expect(groesster(wellenlaengeZuFarbe(530e-9))).toBe(1);
    expect(groesster(wellenlaengeZuFarbe(450e-9))).toBe(2);
  });
});
