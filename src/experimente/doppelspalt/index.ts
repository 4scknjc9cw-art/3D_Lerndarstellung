// Der Doppelspalt als Experiment im Sinne der Schablone (kern/experiment.ts).

import type { Einheit, Experiment } from '../../kern/experiment';
import { aufbauAus } from './aufbau';
import { auswahlInhalt } from './auswahl';
import { darstellungsAufbau } from './darstellung';
import { maximumWinkel, standardAufbau, streifenabstand } from './physik';
import { DoppelspaltSzene } from './szene';
import { tourElektronen } from './tour-elektronen';
import { tourQuanten } from './tour-quanten';
import { tourWelle } from './tour-welle';

const NM: Einheit = { zeichen: 'nm', faktor: 1e-9, stellen: 0 };
const MM2: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 2 };
const MM3: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 3 };
const MM1: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 1 };
const M2: Einheit = { zeichen: 'm', faktor: 1, stellen: 2 };
const ZAHL: Einheit = { zeichen: '', faktor: 1, stellen: 0 };
const GRAD1: Einheit = { zeichen: '°', faktor: Math.PI / 180, stellen: 1 };
const GRAD: Einheit = { zeichen: '°', faktor: Math.PI / 180, stellen: 2 };

export const doppelspalt: Experiment = {
  titel: 'Doppelspalt',
  // Bereiche so gewählt, dass der Steg zwischen den Spalten nie schmaler als ein Spalt wird
  // (d − b ≥ b bei d ≥ 0,06 mm, b ≤ 0,03 mm), sonst liefen die Spalte ineinander. Geprüft an
  // allen Reglerecken in index.test.ts — b ≤ 0,04 mm war zuerst hier und fiel dort durch.
  parameter: [
    {
      schluessel: 'lambda',
      name: 'Wellenlänge λ',
      symbol: '\\lambda',
      einheit: NM,
      min: 380e-9,
      max: 750e-9,
      schritt: 5e-9,
      start: standardAufbau.wellenlaenge,
      warum:
        'Längere Wellenlänge → der Gangunterschied erreicht erst unter größerem Winkel eine ' +
        'ganze Wellenlänge → die Streifen rücken auseinander. Darum gibt rotes Licht breitere ' +
        'Streifen als blaues.',
    },
    {
      schluessel: 'd',
      name: 'Spaltabstand d',
      symbol: 'd',
      einheit: MM2,
      min: 0.06e-3,
      max: 0.3e-3,
      schritt: 0.01e-3,
      start: standardAufbau.spaltabstand,
      warum:
        'Größerer Spaltabstand → die beiden Wege werden schon bei kleinem Winkel ' +
        'unterschiedlich lang → eine ganze Wellenlänge Gangunterschied ist schneller erreicht → ' +
        'die Streifen rücken zusammen.',
    },
    {
      schluessel: 'b',
      name: 'Spaltbreite b',
      symbol: 'b',
      einheit: MM3,
      min: 0.005e-3,
      max: 0.03e-3,
      schritt: 0.001e-3,
      start: standardAufbau.spaltbreite,
      warum:
        // „fast nicht": die Hülle zieht die Maxima messbar nach innen (docs/schritt1-messung.md).
        'Die Spaltbreite ändert den Abstand der Streifen fast nicht, wohl aber die Hülle: breitere ' +
        'Spalte → das Licht jedes einzelnen Spalts wird weniger aufgefächert → die Helligkeit ' +
        'fällt nach außen schneller ab, und einzelne Streifen können ganz verschwinden.',
    },
    {
      schluessel: 'L',
      name: 'Schirmabstand L',
      symbol: 'L',
      einheit: M2,
      min: 0.5,
      max: 1.5,
      schritt: 0.01,
      start: standardAufbau.schirmabstand,
      warum:
        'Größerer Schirmabstand → die Winkel bleiben gleich, aber die Strahlen laufen länger ' +
        'auseinander → die Streifen auf dem Schirm liegen weiter auseinander.',
    },
  ],

  erzeugeSzene() {
    const szene = new DoppelspaltSzene();
    return {
      gruppe: szene.gruppe,
      setze: (werte) => szene.setze(aufbauAus(werte)),
      animiere: (t) => szene.animiere(t),
      teile: [...szene.teile.keys()],
      zeige: (teile) => szene.zeige(teile),
      trefferpunkt: (strahl) => szene.trefferpunkt(strahl),
      zeigeAuswahl: (punkt) => szene.zeigeAuswahl(punkt),
    };
  },

  ansicht: { position: [-7, 13, 18], ziel: [3.5, 0, 0] },

  draufsicht(werte) {
    // Von oben: Bildschirm-rechts = Ausbreitung (+x), Bildschirm-oben = −z. Höhe so, dass die
    // ganze Breite (16) bei 45° Blickwinkel hineinpasst. Winziger z-Versatz, weil ein Blick
    // exakt senkrecht nach unten für die Kamerasteuerung keine eindeutige Richtung hat.
    const L = darstellungsAufbau(aufbauAus(werte)).schirmabstand;
    const mitte = (L - 6.5) / 2;
    return { position: [mitte, 22, 0.01], ziel: [mitte, 0, 0] };
  },

  auswahl: auswahlInhalt,
  touren: [tourWelle, tourQuanten, tourElektronen],

  groessen(werte) {
    const aufbau = aufbauAus(werte);
    return {
      lambda: { wert: werte.lambda, einheit: NM },
      d: { wert: werte.d, einheit: MM2 },
      b: { wert: werte.b, einheit: MM3 },
      L: { wert: werte.L, einheit: M2 },
      deltaX: { wert: streifenabstand(aufbau), einheit: MM1 },
      theta1: { wert: maximumWinkel(aufbau, 1), einheit: GRAD },
      // Wie viele Wellenlängen breit ein Spalt in echt ist, und bis zu welchem Winkel das
      // Licht hinter einem Spalt auffächert (erstes Einzelspalt-Minimum: sin θ = λ/b).
      bDurchLambda: { wert: werte.b / werte.lambda, einheit: ZAHL },
      thetaHuelle: { wert: Math.asin(Math.min(1, werte.lambda / werte.b)), einheit: GRAD1 },
    };
  },

  erklaerung: {
    formeln: [
      '\\sin\\theta_1 = \\frac{\\lambda}{d} = \\frac{[[lambda]]}{[[d]]} \\;\\Rightarrow\\; \\theta_1 = [[theta1]]',
      '\\Delta x \\approx \\frac{\\lambda \\cdot L}{d} = \\frac{[[lambda]] \\cdot [[L]]}{[[d]]} = [[deltaX]]',
    ],
    text:
      'Die hellen Streifen auf dem Schirm liegen [[deltaX]] auseinander. Der erste helle ' +
      'Streifen neben der Mitte erscheint unter dem Winkel [[theta1]] — dort ist der ' +
      'Gangunterschied genau eine Wellenlänge.',
  },
};
