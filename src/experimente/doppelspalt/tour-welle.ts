// Tour Phase 1: Licht als Welle.
//
// Regeln für die Texte (Kurt, 27.10.2026):
//   - nicht nur sagen, WAS man sieht, sondern WARUM, und dem Weg des Lichts folgen;
//   - Formeln erst, wenn das Bild sie vorher hergeleitet hat;
//   - braucht ein Teil der Erklärung eine andere Ansicht, fährt die Kamera dorthin (Teile);
//   - Leser: Oberstufe (13. Klasse) mit Wellen-Grundwissen, aber ohne Vorwissen zum Versuch.
//     Jeder Begriff wird beim ersten Auftreten erklärt, jeder Schritt baut auf dem vorigen auf;
//   - knapp formulieren, wenige Zahlen und Formeln im Text (Kurt) — die Zahlen stehen im Bild;
//   - wenig freies Herumprobieren: Punkte sind vorgewählt, nur in einem Teil darf man P
//     selbst von Streifen zu Streifen schieben.
//
// Szene (Bildmaßstab): Laser bei x ≈ −6, Blende bei x = 0, oberer Spalt bei z = +d/2,
// Schirm bei x = L (12 beim Standard), Breite z = −8 … +8, y = oben.

import type { Punkt } from '../../kern/experiment';
import type { Tour } from '../../kern/tour';
import { aufbauAus } from './aufbau';
import { darstellungsAufbau } from './darstellung';
import { konstruiere } from './konstruktion';
import { standardAufbau } from './physik';

const standard = {
  lambda: standardAufbau.wellenlaenge,
  d: standardAufbau.spaltabstand,
  b: standardAufbau.spaltbreite,
  L: standardAufbau.schirmabstand,
  spalte: 2,
};

/**
 * Stelle quer zur Achse, an der der Gangunterschied genau q Wellenlängen beträgt — aus der
 * Physik berechnet statt von Hand eingetragen, damit der Punkt wirklich auf dem hellen bzw.
 * dunklen Streifen liegt, auch wenn sich der Bildmaßstab einmal ändert.
 */
function stelle(
  q: number,
  x: number | 'schirm',
  werte: Partial<typeof standard> = {},
  einfach = false,
): Punkt {
  const bild = darstellungsAufbau(aufbauAus({ ...standard, ...werte }));
  const xx = x === 'schirm' ? bild.schirmabstand : x;
  let lo = 0;
  let hi = 8;
  for (let i = 0; i < 60; i++) {
    const z = (lo + hi) / 2;
    if (konstruiere(bild, { x: xx, y: z }).gangunterschied / bild.wellenlaenge < q) lo = z;
    else hi = z;
  }
  // x = 99 heißt „auf dem Schirm" — der Punkt bleibt dort, auch wenn L sich ändert.
  return { x: x === 'schirm' ? 99 : xx, z: (lo + hi) / 2, aufSchirm: x === 'schirm', einfach };
}

/** Kamera schräg von vorn-oben auf einen Punkt im Wellenfeld. */
function nahAn(p: Punkt): { position: [number, number, number]; ziel: [number, number, number] } {
  return { position: [p.x - 2.2, 2.4, p.z + 3.4], ziel: [p.x, 0, p.z] };
}

const UEBERBLICK = { position: [-5, 12, 13], ziel: [5, 0, 0] } as const;
const AUF_SCHIRM = { position: [1, 6, 0.5], ziel: [12, 1.2, 0] } as const;

// In Schritt 4 nur markiert (ohne Dreieck und Zahlen) — Δs wird erst in Schritt 5 erklärt.
const hell4 = stelle(1, 5, {}, true);
const dunkel4 = stelle(0.5, 5, {}, true);
const ersterHell = stelle(1, 'schirm');
const ersterDunkel = stelle(1.5, 'schirm');
const zweiterHell = stelle(2, 'schirm');
const SCHRITT9 = { d: 0.09e-3, b: 0.03e-3 };
const fehlender = stelle(3, 'schirm', SCHRITT9);

const kopie = (a: { position: readonly number[]; ziel: readonly number[] }) => ({
  position: [...a.position] as [number, number, number],
  ziel: [...a.ziel] as [number, number, number],
});

export const tourWelle: Tour = {
  titel: 'Licht als Welle',
  schritte: [
    {
      titel: 'Licht ist eine Welle',
      teile: [
        {
          // Exakt von der Seite auf die 3D-Welle (Kurt): fast ohne Perspektive (Öffnungswinkel
          // 1,5°, weit weg), damit alle Wellenreihen übereinanderliegen und eine Kurve ergeben.
          // Ganz leicht von oben (0,6°) — exakt waagerecht wäre die Fläche unsichtbar dünn.
          // Die weiße Linie (Hilfe „profil") sorgt dafür, dass man die Welle sicher als Linie sieht.
          kamera: { position: [-3, 1.28, 120], ziel: [-3, 0.02, 0], sichtfeld: 1.5 },
          sichtbar: ['laser', 'einfall'],
          hilfen: ['profil', 'lambdaMass'],
          tempo: 'zeitlupe',
          text:
            'Ein Laser sendet Licht mit genau einer Wellenlänge. Licht ist eine Welle: An jeder ' +
            'Stelle schwingt ein elektrisches Feld hin und her.\n\n' +
            'Hier siehst du die Welle genau von der Seite. Die weiße Linie zeigt das Feld in ' +
            'diesem Moment: oben ein Wellenberg, unten ein Wellental. Von Berg zu Berg ist es ' +
            'eine Wellenlänge λ (orange Klammer). In Zeitlupe laufen die Berge nach rechts.\n\n' +
            'Echtes Licht ist winzig — im Bild ist es stark vergrößert.',
        },
        {
          kamera: { position: [-7, 3.4, 6.2], ziel: [-2.6, 0, 0] },
          sichtbar: ['laser', 'einfall'],
          hilfen: ['profil', 'lambdaMass'],
          tempo: 'zeitlupe',
          text:
            'Der Lichtstrahl ist breit, nicht nur eine Linie. Darum zeigt das Bild die Welle auf ' +
            'einer ganzen Fläche: hoch und hell ist ein Berg, tief und dunkel ein Tal.',
        },
        {
          kamera: { position: [-2.6, 9, 0.01], ziel: [-2.6, 0, 0] },
          sichtbar: ['laser', 'einfall'],
          hilfen: ['lambdaMass'],
          text:
            'Von oben: Die Berge liegen auf geraden Linien quer zur Laufrichtung. Entlang so einer ' +
            'Linie schwingt alles im Gleichtakt. Das nennt man eine ebene Welle.\n\n' +
            'Dieser Gleichtakt ist der Schlüssel zu allem, was jetzt kommt.',
        },
        {
          kamera: { position: [-6.5, 4.5, 6.5], ziel: [-0.8, 0.4, 0] },
          sichtbar: ['laser', 'einfall', 'blende'],
          hilfen: ['spaltMasse'],
          text:
            'Jetzt steht eine Blende im Weg. Sie schluckt das Licht — nur durch zwei sehr ' +
            'schmale Spalte kommt es hindurch. Die Spalte sind dünner als ein Haar.',
        },
      ],
    },
    {
      titel: 'Ein Spalt: das Licht fächert auf',
      startwerte: { spalte: 1 },
      freieRegler: ['b'],
      teile: [
        {
          kamera: { position: [-1.4, 3.2, 5.4], ziel: [1.6, 0, 1.4] },
          text:
            'Zuerst ist nur ein Spalt offen. Flöge Licht wie kleine Kügelchen geradeaus, käme ' +
            'dahinter nur ein schmaler Strahl heraus. Stattdessen breitet sich die Welle in ' +
            'Halbkreisen nach allen Seiten aus.',
        },
        {
          kamera: 'draufsicht',
          text:
            'Warum? Huygens-Prinzip: Jeder Punkt, den eine Welle erreicht, sendet selbst eine ' +
            'kleine Kreiswelle aus. Viele nebeneinander ergeben zusammen wieder eine gerade ' +
            'Front.\n\n' +
            'Im schmalen Spalt bleiben nur wenige übrig — heraus kommt eine Kreiswelle. Dieses ' +
            'Auffächern heißt Beugung.',
        },
        {
          kamera: { position: [2, 7, 9], ziel: [9, 0.8, 0] },
          hilfen: ['schirmMass'],
          text:
            'Ein Schirm fängt das Licht auf. Weil es auffächert, entsteht dort ein breiter ' +
            'heller Fleck.\n\n' +
            'Zieh an der Spaltbreite b: Je schmaler der Spalt, desto stärker fächert das Licht ' +
            'auf und desto breiter wird der Fleck. In echt fächert es nur um etwa ' +
            '[[thetaHuelle]] auf — im Bild ist das stark übertrieben.',
        },
      ],
    },
    {
      titel: 'Zwei Spalte: zwei Kreiswellen im Gleichtakt',
      freieRegler: ['d'],
      teile: [
        {
          kamera: { position: [-2.4, 4.3, 5.8], ziel: [0.8, 0.2, 0] },
          hilfen: ['spaltMasse'],
          text:
            'Jetzt sind beide Spalte offen. Hinter jedem entsteht eine Kreiswelle.\n\n' +
            'Wichtig: Dieselbe gerade Wellenfront erreicht beide Spalte gleichzeitig. Darum ' +
            'starten beide Kreiswellen im Gleichtakt — Berg mit Berg.',
        },
        {
          kamera: kopie(UEBERBLICK),
          text:
            'Hinter der Blende laufen die beiden Kreiswellen ineinander. Es entstehen Bahnen, in ' +
            'denen es stark wogt, und ruhige graue Bahnen dazwischen. Auf dem Schirm wird daraus ' +
            'ein Muster aus hellen und dunklen Streifen.\n\n' +
            'Warum genau dort? Das zeigen die nächsten beiden Schritte.',
        },
        {
          kamera: kopie(UEBERBLICK),
          text:
            'Zieh am Spaltabstand d: Liegen die Spalte weiter auseinander, rücken die Streifen ' +
            'zusammen. Warum, wird in Schritt 7 klar.',
        },
      ],
    },
    {
      titel: 'Überlagerung: Berg auf Berg, Berg auf Tal',
      teile: [
        {
          kamera: nahAn(hell4),
          auswahl: hell4,
          tempo: 'zeitlupe',
          text:
            'Treffen zwei Wellen aufeinander, addieren sich ihre Auslenkungen. Schau auf den ' +
            'orangen Punkt; die weißen Linien sind die Wege von den beiden Spalten.\n\n' +
            'Hier kommt von beiden Spalten gleichzeitig ein Berg an. Berg plus Berg gibt einen ' +
            'doppelt so hohen Berg — der Punkt schwingt stark. Das heißt konstruktive ' +
            'Interferenz: hell.',
        },
        {
          kamera: nahAn(dunkel4),
          auswahl: dunkel4,
          tempo: 'zeitlupe',
          text:
            'Ein Stück daneben kommt vom einen Spalt ein Berg, vom anderen ein Tal. Sie heben ' +
            'sich auf — der Punkt bleibt fast in Ruhe. Das heißt destruktive Interferenz: ' +
            'dunkel.\n\n' +
            'Aber warum trifft gerade hier Berg auf Tal? Das zeigt der nächste Schritt.',
        },
      ],
    },
    {
      titel: 'Warum hell und dunkel: der Gangunterschied',
      teile: [
        {
          kamera: 'draufsicht',
          umschalter: true,
          auswahl: ersterHell,
          text:
            'Beide Wellen starten im Gleichtakt. Ob sie sich verstärken oder auslöschen, hängt ' +
            'also nur davon ab, wie weit jede bis zum Punkt laufen muss.\n\n' +
            'Von oben siehst du die Wege s₁ und s₂ zu einem Punkt P auf dem Schirm. Trägt man ' +
            's₁ auf s₂ ab (gestrichelt), bleibt der Unterschied übrig: der Gangunterschied Δs ' +
            '(orange).\n\n' +
            'Hier ist Δs genau eine Wellenlänge. Die eine Welle ist eine ganze Schwingung ' +
            'später dran — und damit wieder im Gleichtakt: Berg auf Berg → hell.',
        },
        {
          kamera: 'draufsicht',
          umschalter: true,
          auswahl: ersterDunkel,
          text:
            'Einen Streifen weiter ist P dunkel: Δs ist 1,5 Wellenlängen. Eine halbe Schwingung ' +
            'verschoben heißt Berg auf Tal → Auslöschung.\n\n' +
            'Die Regel: Δs ganzzahlig (0, 1, 2 … λ) → hell. Δs halbzahlig (0,5; 1,5 … λ) → ' +
            'dunkel.',
        },
        {
          // Lupe an die Spalte, aber weit genug, dass Blende, Δs und beide Winkel θ zu sehen sind.
          kamera: { position: [0.7, 6.2, 0.01], ziel: [0.7, 0, 0] },
          umschalter: true,
          auswahl: ersterHell,
          text:
            'Lupe auf die Spalte: d, Δs und die gestrichelte Linie bilden ein kleines Dreieck. ' +
            'Weil der Schirm weit weg ist, laufen die Wege fast parallel — das Dreieck ist ' +
            'rechtwinklig.\n\n' +
            'Sein Winkel ist derselbe Winkel θ, unter dem P von der Blendenmitte aus liegt ' +
            '(beide Schenkel sind jeweils um 90° gedreht). Darum gilt sin θ = Δs / d, also:',
          formeln: ['\\Delta s = d \\cdot \\sin\\theta'],
        },
        {
          kamera: 'draufsicht',
          umschalter: true,
          auswahl: ersterHell,
          punktWaehlen: true,
          text:
            'Jetzt du: Schieb P mit ▲ ▼ (oder den Pfeiltasten ↑ ↓) von Streifen zu Streifen, ' +
            'oder klick auf den Schirm. Mit jedem Schritt wächst Δs um eine halbe Wellenlänge: ' +
            'hell, dunkel, hell …',
        },
      ],
    },
    {
      titel: 'Das Muster auf dem Schirm',
      teile: [
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Die hellen Streifen werden von der Mitte aus gezählt: m = 0, 1, 2, 3 … Beim ' +
            'Streifen m ist der Gangunterschied genau m Wellenlängen: Δs = m · λ.',
        },
        {
          kamera: 'draufsicht',
          hilfen: ['ordnungen'],
          auswahl: zweiterHell,
          text:
            'Beispiel m = 2: Der Weg vom ferneren Spalt ist genau zwei Wellenlängen länger. Zwei ' +
            'ganze Schwingungen später — wieder im Gleichtakt → hell.',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Nach außen werden die Streifen dunkler. Das liegt am Einzelspalt aus Schritt 2: ' +
            'Jeder Spalt schickt zur Seite weniger Licht. Die Streifen sitzen unter diesem ' +
            'breiten Fleck, der Hülle.',
        },
      ],
    },
    {
      titel: 'Die Formel',
      // Schmaler Spalt: dann liegen die Streifen genau dort, wo die Formel sagt (bei breiten
      // Spalten rücken sie durch die Hülle messbar nach innen — docs/schritt1-messung.md).
      startwerte: { b: 0.005e-3 },
      freieRegler: ['lambda', 'd', 'L'],
      teile: [
        {
          kamera: 'draufsicht',
          umschalter: true,
          text:
            'Jetzt passt alles zusammen: Hell ist es bei Δs = m · λ (Schritt 6), und ' +
            'Δs = d · sin θ (Schritt 5). Gleichgesetzt:',
          formeln: ['d \\cdot \\sin\\theta_m = m \\cdot \\lambda'],
        },
        {
          kamera: 'draufsicht',
          umschalter: true,
          auswahl: ersterHell,
          hilfen: ['ordnungen'],
          text:
            'Wo liegt der Streifen auf dem Schirm? Im großen Dreieck aus L (bis zum Schirm) und ' +
            'x (Abstand von der Mitte) gilt tan θ = x / L. Weil die Winkel winzig sind, ist ' +
            'sin θ ≈ tan θ. Damit folgt der Abstand zweier Streifen:',
          formeln: [
            '\\Delta x \\approx \\frac{\\lambda \\cdot L}{d} = \\frac{[[lambda]] \\cdot [[L]]}{[[d]]} = [[deltaX]]',
          ],
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          umschalter: true,
          text:
            'Probier die Regler: Größere Wellenlänge oder größerer Schirmabstand → Streifen ' +
            'weiter auseinander. Größerer Spaltabstand → enger. Genau das sagt die Formel.\n\n' +
            '(Der Spalt ist hier extra schmal, dann stimmt die Formel genau.)',
          formeln: [
            '\\Delta x \\approx \\frac{\\lambda \\cdot L}{d} = \\frac{[[lambda]] \\cdot [[L]]}{[[d]]} = [[deltaX]]',
          ],
        },
      ],
    },
    {
      titel: 'Farbe: rotes und blaues Licht',
      freieRegler: ['lambda'],
      teile: [
        {
          kamera: kopie(UEBERBLICK),
          werte: { lambda: 650e-9 },
          hilfen: ['ordnungen'],
          text:
            'Rotes Licht hat eine längere Wellenlänge. Eine ganze Wellenlänge Gangunterschied ' +
            'wird erst unter größerem Winkel erreicht — die Streifen liegen weiter auseinander.',
        },
        {
          kamera: kopie(UEBERBLICK),
          werte: { lambda: 450e-9 },
          hilfen: ['ordnungen'],
          text: 'Blaues Licht hat eine kürzere Wellenlänge — die Streifen rücken zusammen.',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Weißes Licht enthält alle Farben, jede macht ihr eigenes Muster. Nur in der Mitte ' +
            'liegen alle übereinander, dort bleibt es weiß; daneben entstehen farbige Säume.\n\n' +
            'Zieh an der Wellenlänge und vergleiche.',
        },
      ],
    },
    {
      titel: 'Spaltbreite: die Hülle und fehlende Streifen',
      startwerte: SCHRITT9,
      freieRegler: ['b'],
      teile: [
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Die Spaltbreite b bestimmt, wie stark jeder Spalt auffächert. Die Streifen sitzen ' +
            'unter dieser Hülle: Wo sie dunkel wird, verschwinden die Streifen.',
        },
        {
          // Zum fehlenden Streifen hin gedreht, sonst liegt er unter dem Seitenfeld.
          kamera: { position: [1, 6, fehlender.z * 0.6], ziel: [12, 1.2, fehlender.z * 0.6] },
          hilfen: ['ordnungen'],
          auswahl: fehlender,
          text:
            'Hier ist der Spaltabstand genau dreimal so groß wie die Spaltbreite. Dann fällt der ' +
            'Streifen m = 3 genau auf eine Stelle, an der sich das Licht schon innerhalb jedes ' +
            'Spalts auslöscht. Obwohl Δs = 3 λ ist, bleibt es dunkel — der Streifen fehlt.',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Zieh an b: Schmalere Spalte → breitere Hülle → mehr Streifen sichtbar. Wo die ' +
            'Streifen liegen, bestimmt aber d, nicht b.',
        },
        {
          kamera: kopie(UEBERBLICK),
          text:
            'Damit ist das Wellenbild komplett: Beugung, Überlagerung, Gangunterschied, Formel, ' +
            'Farbe und Hülle.\n\n' +
            'Aber was passiert, wenn das Licht so schwach ist, dass nur noch einzelne ' +
            'Lichtteilchen (Photonen) durch die Spalte gehen? Das ist die nächste Phase.',
        },
      ],
    },
  ],
};

