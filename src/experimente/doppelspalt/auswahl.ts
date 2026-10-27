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
import { konstruiere } from './konstruktion';

const LAMBDA: Einheit = { zeichen: 'λ', faktor: 1, stellen: 2, tex: '\\,\\lambda' };
const NM: Einheit = { zeichen: 'nm', faktor: 1e-9, stellen: 0 };
const MM2: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 2 };
const GRAD: Einheit = { zeichen: '°', faktor: Math.PI / 180, stellen: 3 };

/** Toleranz in Wellenlängen, ab der ein Punkt als „hell" bzw. „dunkel" gilt. */
const TOLERANZ = 0.1;

export function auswahlInhalt(werte: Werte, punkt: Punkt): AuswahlInhalt {
  const echt = aufbauAus(werte);
  const bild = darstellungsAufbau(echt);
  const x = punkt.aufSchirm ? bild.schirmabstand : Math.min(punkt.x, bild.schirmabstand);
  const k = konstruiere(bild, { x, y: punkt.z });
  const q = k.gangunterschied / bild.wellenlaenge;

  const ds = q * echt.wellenlaenge;
  const theta = Math.asin(Math.min(1, ds / echt.spaltabstand));
  const m = Math.round(q);
  const rest = Math.abs(q - m);
  const u = (Math.PI * q * echt.spaltbreite) / echt.spaltabstand;
  const huelle = u === 0 ? 1 : (Math.sin(u) / u) ** 2;

  // „genau" nur, wenn auch die angezeigte Zahl (2 Nachkommastellen) exakt passt — sonst stünde
  // „genau 2 Wellenlängen" neben „1,99 λ". Sonst ehrlich „fast genau".
  const genau = rest < 0.005 || Math.abs(rest - 0.5) < 0.005 ? 'genau' : 'fast genau';
  let urteil: string;
  if (rest <= TOLERANZ) {
    urteil =
      m === 0
        ? `Beide Wege sind ${genau === 'genau' ? '' : 'fast '}gleich lang. Die Wellen kommen im Gleichtakt an, Berg trifft auf ` +
          'Berg → hell. Das ist der helle Streifen in der Mitte (0. Ordnung).'
        : `Δs ist ${genau} ${m === 1 ? 'eine Wellenlänge' : `${m} Wellenlängen`}. Die eine ` +
          'Welle ist also um ganze Schwingungen „verspätet" und kommt trotzdem im Gleichtakt an: ' +
          `Berg trifft auf Berg → hell (Maximum ${m}. Ordnung).`;
    if (huelle < 0.05) {
      urteil +=
        ' Aber: Genau hier löscht sich schon das Licht innerhalb jedes einzelnen Spalts aus ' +
        '(Einzelspalt-Minimum). Darum fehlt dieser helle Streifen.';
    }
  } else if (rest >= 0.5 - TOLERANZ) {
    const unten = Math.floor(q);
    urteil =
      `Δs ist ${genau} ${unten === 0 ? 'eine halbe Wellenlänge' : `${unten},5 Wellenlängen`}. Die eine ` +
      'Welle ist eine halbe Schwingung verschoben: Berg trifft auf Tal → die Wellen löschen ' +
      'sich aus → dunkel.';
  } else {
    urteil =
      'Δs liegt zwischen ganz und halb. Die Wellen verstärken sich nur teilweise → mittlere ' +
      'Helligkeit, zwischen einem hellen und einem dunklen Streifen.';
  }

  const ort = punkt.aufSchirm
    ? `Auf dem echten Schirm liegt dieser Punkt ${alsText({
        wert: echt.schirmabstand * Math.tan(theta),
        einheit: MM2,
      })} neben der Mitte.`
    : 'Klickst du auf den Schirm, siehst du auch, wie weit der Punkt dort von der Mitte entfernt ist.';

  return {
    formeln: [
      '\\Delta s = [[q]] = [[ds]]',
      '\\sin\\theta \\approx \\frac{\\Delta s}{d} = \\frac{[[ds]]}{[[d]]} \\;\\Rightarrow\\; \\theta = [[thetaP]]',
    ],
    text: `${urteil}\n\nIn echt entspricht das dem Winkel [[thetaP]]. ${ort}`,
    groessen: {
      q: { wert: q, einheit: LAMBDA },
      ds: { wert: ds, einheit: NM },
      thetaP: { wert: theta, einheit: GRAD },
    },
  };
}
