import { describe, expect, it } from 'vitest';
import type { ParameterDef } from './experiment';
import { alsTex, alsText, setzeEin } from './format';
import { Parameter } from './parameter';

const MM = { zeichen: 'mm', faktor: 1e-3, stellen: 2 };
const def: ParameterDef = {
  schluessel: 'd',
  name: 'Spaltabstand d',
  symbol: 'd',
  einheit: MM,
  min: 0.06e-3,
  max: 0.3e-3,
  schritt: 0.01e-3,
  start: 0.1e-3,
  warum: '',
};

describe('Parameterspeicher', () => {
  it('meldet jede Änderung mit dem geänderten Namen', () => {
    const p = new Parameter([def]);
    const meldungen: (string | null)[] = [];
    p.beobachte((_, geaendert) => meldungen.push(geaendert));
    p.setze('d', 0.2e-3);
    expect(meldungen).toEqual([null, 'd']);
    expect(p.alle.d).toBeCloseTo(0.2e-3, 12);
  });

  it('begrenzt auf den erlaubten Bereich', () => {
    const p = new Parameter([def]);
    p.setze('d', 5);
    expect(p.alle.d).toBe(def.max);
  });

  it('unbekannter Parameter ist ein Fehler', () => {
    expect(() => new Parameter([def]).setze('x', 1)).toThrow();
  });
});

describe('Format', () => {
  it('deutsche Kommas, Einheit dahinter', () => {
    expect(alsText({ wert: 0.1e-3, einheit: MM })).toBe('0,10 mm');
    expect(alsTex({ wert: 0.1e-3, einheit: MM })).toBe('0{,}10\\,\\mathrm{mm}');
  });

  it('unbekannter Platzhalter ist ein Fehler', () => {
    expect(() => setzeEin('[[gibtsnicht]]', {}, alsText)).toThrow();
  });
});
