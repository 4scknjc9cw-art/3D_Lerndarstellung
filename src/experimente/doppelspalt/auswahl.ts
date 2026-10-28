// Erklärung zu einem angeklickten Punkt: Gangunterschied, hell oder dunkel, und wo der Punkt
// im ECHTEN Aufbau läge.
//
// Brücke zwischen Bild und echtem Aufbau ist der Gangunterschied in Wellenlängen (q = Δs/λ):
// er allein entscheidet, ob Berg auf Berg oder Berg auf Tal trifft. Der Punkt im Bild mit q
// entspricht in echt dem Winkel mit d·sin θ = q·λ. Auch die Einzelspalt-Hülle hängt nur von
// q und d/b ab (u = π·q·b/d), und d/b ist in beiden Maßstäben gleich — darum passt beides.

import type { AuswahlInhalt, Einheit, Punkt } from '../../kern/experiment';
import { alsText } from '../../kern/format';
import type { Werte } from '../../kern/parameter';
import { darstellungsAufbau } from './darstellung';
import { aufbauAus } from './aufbau';
import { echteGroessen, konstruiere } from './konstruktion';

const LAMBDA: Einheit = { zeichen: 'λ', faktor: 1, stellen: 2, tex: '\\,\\lambda' };
const NM: Einheit = { zeichen: 'nm', faktor: 1e-9, stellen: 0 };
const MM2: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 2 };
const GRAD: Einheit = { zeichen: '°', faktor: Math.PI / 180, stellen: 2 };

/** Toleranz in Wellenlängen, ab der ein Punkt als „hell" bzw. „dunkel" gilt. */
const TOLERANZ = 0.1;

export function auswahlInhalt(werte: Werte, punkt: Punkt): AuswahlInhalt {
  const echt = aufbauAus(werte);
  const bild = darstellungsAufbau(echt);
  const x = punkt.aufSchirm ? bild.schirmabstand : Math.min(punkt.x, bild.schirmabstand);
  const k = konstruiere(bild, { x, y: punkt.z });
  const q = k.gangunterschied / bild.wellenlaenge;

  const { ds, theta, x: abstandEcht } = echteGroessen(echt, q);
  const m = Math.round(q);
  const rest = Math.abs(q - m);
  const u = (Math.PI * q * echt.spaltbreite) / echt.spaltabstand;
  const huelle = u === 0 ? 1 : (Math.sin(u) / u) ** 2;

  // „genau" nur, wenn auch die angezeigte Zahl (2 Nachkommastellen) exakt passt — sonst stünde
  // „genau 2 Wellenlängen" neben „1,99 λ". Sonst ehrlich „fast genau".
  // Kurz gehalten (Kurt: knackig, wenige Zahlen) — die Zahlen stehen im Bild am Dreieck.
  const genau = rest < 0.005 || Math.abs(rest - 0.5) < 0.005 ? 'genau' : 'fast genau';
  let urteil: string;
  if (rest <= TOLERANZ) {
    urteil =
      m === 0
        ? `Beide Wege sind ${genau === 'genau' ? '' : 'fast '}gleich lang → Berg trifft auf Berg → hell. ` +
          'Der helle Streifen in der Mitte (0. Ordnung).'
        : `Δs ist ${genau} ${m === 1 ? 'eine Wellenlänge' : `${m} Wellenlängen`} → ganze ` +
          `Schwingungen später, wieder im Gleichtakt → hell (Maximum ${m}. Ordnung).`;
    if (huelle < 0.05) {
      urteil +=
        ' Aber hier löscht sich schon das Licht innerhalb jedes einzelnen Spalts aus ' +
        '(Einzelspalt-Minimum) — darum fehlt dieser Streifen.';
    }
  } else if (rest >= 0.5 - TOLERANZ) {
    const unten = Math.floor(q);
    urteil =
      `Δs ist ${genau} ${unten === 0 ? 'eine halbe Wellenlänge' : `${unten},5 Wellenlängen`} → ` +
      'eine halbe Schwingung verschoben → Berg trifft auf Tal → dunkel.';
  } else {
    urteil =
      'Δs liegt zwischen ganz und halb → die Wellen verstärken sich nur teilweise → mittlere ' +
      'Helligkeit.';
  }

  return {
    formeln: ['\\Delta s = [[q]] = [[ds]]'],
    text: punkt.aufSchirm
      ? `${urteil}\n\nAuf dem echten Schirm: ${alsText({ wert: abstandEcht, einheit: MM2 })} ` +
        'neben der Mitte, Winkel θ = [[thetaP]].'
      : urteil,
    groessen: {
      q: { wert: q, einheit: LAMBDA },
      ds: { wert: ds, einheit: NM },
      thetaP: { wert: theta, einheit: GRAD },
    },
  };
}
