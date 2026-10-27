import { describe, expect, it } from 'vitest';
import { doppelspalt } from '../experimente/doppelspalt';
import { auswahlInhalt } from '../experimente/doppelspalt/auswahl';
import { Parameter } from './parameter';
import { type Tour, TourSpieler } from './tour';

const start = Object.fromEntries(doppelspalt.parameter.map((p) => [p.schluessel, p.start]));
const ansicht = { position: [0, 1, 1] as [number, number, number], ziel: [0, 0, 0] as [number, number, number] };

const probe: Tour = {
  titel: 'Probe',
  schritte: [
    { titel: 'A', teile: [{ kamera: ansicht, text: '' }] },
    {
      titel: 'B',
      startwerte: { d: 0.2e-3 },
      freieRegler: ['d'],
      teile: [
        { kamera: ansicht, text: '' },
        { kamera: 'draufsicht', text: '' },
        { kamera: ansicht, text: '', werte: { lambda: 650e-9 } },
      ],
    },
  ],
};

describe('Tour-Maschine', () => {
  it('Weiter läuft erst durch die Teile, dann zum nächsten Schritt; Zurück genauso', () => {
    const t = new TourSpieler(probe, new Parameter(doppelspalt.parameter), start);
    t.gehe(0);
    const stellen = [t.aktuell];
    for (let i = 0; i < 4; i++) {
      t.weiter();
      stellen.push(t.aktuell);
    }
    expect(stellen).toEqual([
      { schritt: 0, teil: 0 },
      { schritt: 1, teil: 0 },
      { schritt: 1, teil: 1 },
      { schritt: 1, teil: 2 },
      { schritt: 1, teil: 2 }, // am Ende bleibt es stehen
    ]);
    expect(t.amEnde).toBe(true);
    t.gehe(1, 0);
    t.zurueck();
    expect(t.aktuell).toEqual({ schritt: 0, teil: 0 });
    expect(t.amAnfang).toBe(true);
  });

  it('Zurück aus Schritt B landet im letzten Teil davor', () => {
    const zwei: Tour = { titel: 'X', schritte: [probe.schritte[1], probe.schritte[0]] };
    const t = new TourSpieler(zwei, new Parameter(doppelspalt.parameter), start);
    t.gehe(1, 0);
    t.zurueck();
    expect(t.aktuell).toEqual({ schritt: 0, teil: 2 });
  });

  it('Schritt setzt Startwerte; selbst Verstelltes bleibt im Schritt, außer ein Teil bringt Werte', () => {
    const p = new Parameter(doppelspalt.parameter);
    const t = new TourSpieler(probe, p, start);
    t.gehe(1, 0);
    expect(p.alle.d).toBeCloseTo(0.2e-3, 12);
    p.setze('d', 0.25e-3); // man probiert im Schritt herum …
    t.weiter();
    expect(p.alle.d).toBeCloseTo(0.25e-3, 12); // … und es bleibt stehen
    t.weiter(); // Teil mit eigenen Werten: alles wird sauber neu gesetzt
    expect(p.alle.lambda).toBeCloseTo(650e-9, 15);
    expect(p.alle.d).toBeCloseTo(0.2e-3, 12);
    t.zurueck();
    t.zurueck();
    t.zurueck(); // Schritt A: alles wieder Standard
    expect(p.alle.d).toBeCloseTo(start.d, 12);
    expect(p.alle.lambda).toBeCloseTo(start.lambda, 15);
  });

  it('Tippfehler in einem Schritt fällt beim Laden auf', () => {
    const kaputt: Tour = {
      titel: 'X',
      schritte: [{ titel: 'A', freieRegler: ['dd'], teile: [{ kamera: ansicht, text: '' }] }],
    };
    expect(() => new TourSpieler(kaputt, new Parameter(doppelspalt.parameter), start)).toThrow();
    const leer: Tour = { titel: 'X', schritte: [{ titel: 'A', teile: [] }] };
    expect(() => new TourSpieler(leer, new Parameter(doppelspalt.parameter), start)).toThrow();
  });
});

describe('Echte Tour „Licht als Welle"', () => {
  const tour = doppelspalt.touren[0];
  const teile = ['laser', 'einfall', 'blende', 'feld', 'schirm'];
  const hilfen = ['lambdaMass', 'ordnungen'];

  it('lädt ohne Fehler, alle Teile, Hilfen und Platzhalter gültig', () => {
    expect(() => new TourSpieler(tour, new Parameter(doppelspalt.parameter), start)).not.toThrow();
    const g = doppelspalt.groessen(start);
    for (const s of tour.schritte) {
      for (const t of s.teile) {
        for (const x of t.sichtbar ?? []) expect(teile).toContain(x);
        for (const x of t.hilfen ?? []) expect(hilfen).toContain(x);
        for (const vorlage of [t.text, ...(t.formeln ?? [])]) {
          for (const [, name] of vorlage.matchAll(/\[\[(\w+)\]\]/g)) expect(g).toHaveProperty(name);
        }
      }
    }
  });

  /** Werte, die in einem Teil gelten (Start + Schritt + Teile bis hierher). */
  function werteIn(schritt: number, teil: number) {
    const p = new Parameter(doppelspalt.parameter);
    new TourSpieler(tour, p, start).gehe(schritt, teil);
    return p.alle;
  }

  // Die Texte behaupten etwas über die vorgewählten Punkte — das muss physikalisch stimmen.
  it('vorgewählte Punkte: hell/dunkel/fehlend wie im Text behauptet', () => {
    const erwartet: Record<string, string> = {
      'Überlagerung: Berg auf Berg, Berg auf Tal/0': 'hell',
      'Überlagerung: Berg auf Berg, Berg auf Tal/1': 'dunkel',
      'Warum hell und dunkel: der Gangunterschied/0': 'Maximum 1. Ordnung',
      'Warum hell und dunkel: der Gangunterschied/1': 'genau 1,5 Wellenlängen',
      'Warum hell und dunkel: der Gangunterschied/2': 'Maximum 1. Ordnung',
      'Das Muster auf dem Schirm/1': 'Maximum 2. Ordnung',
      'Spaltbreite: die Hülle und fehlende Streifen/1': 'fehlt',
    };
    let geprueft = 0;
    tour.schritte.forEach((s, si) =>
      s.teile.forEach((t, ti) => {
        if (!t.auswahl) return;
        const schluessel = `${s.titel}/${ti}`;
        expect(erwartet).toHaveProperty([schluessel]);
        expect(auswahlInhalt(werteIn(si, ti), t.auswahl).text).toContain(erwartet[schluessel]);
        geprueft++;
      }),
    );
    expect(geprueft).toBe(7); // ersterHell kommt in Schritt 5 zweimal vor (Teil 0 und 2)
  });

  it('Schritt „Ein Spalt" hat nur einen offenen Spalt, danach wieder zwei', () => {
    const i = tour.schritte.findIndex((s) => s.titel.startsWith('Ein Spalt'));
    expect(werteIn(i, 0).spalte).toBe(1);
    expect(werteIn(i + 1, 0).spalte).toBe(2);
  });

  it('Schritt 9: d = 3b, damit m = 3 fehlt', () => {
    const i = tour.schritte.findIndex((s) => s.titel.startsWith('Spaltbreite'));
    const w = werteIn(i, 0);
    expect(w.d / w.b).toBeCloseTo(3, 10);
  });
});
