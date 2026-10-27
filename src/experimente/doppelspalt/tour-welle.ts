// Tour Phase 1: Licht als Welle.
//
// Regeln für die Texte (Kurt, 27.10.2026):
//   - nicht nur sagen, WAS man sieht, sondern WARUM, und dem Weg des Lichts folgen;
//   - Formeln erst, wenn das Bild sie vorher hergeleitet hat;
//   - braucht ein Teil der Erklärung eine andere Ansicht, fährt die Kamera dorthin (Teile).
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
function stelle(q: number, x: number | 'schirm', werte: Partial<typeof standard> = {}): Punkt {
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
  return { x: x === 'schirm' ? 99 : xx, z: (lo + hi) / 2, aufSchirm: x === 'schirm' };
}

/** Kamera schräg von vorn-oben auf einen Punkt im Wellenfeld. */
function nahAn(p: Punkt): { position: [number, number, number]; ziel: [number, number, number] } {
  return { position: [p.x - 2.2, 2.4, p.z + 3.4], ziel: [p.x, 0, p.z] };
}

const UEBERBLICK = { position: [-5, 12, 13], ziel: [5, 0, 0] } as const;
const AUF_SCHIRM = { position: [1, 6, 0.5], ziel: [12, 1.2, 0] } as const;

const hell4 = stelle(1, 5);
const dunkel4 = stelle(0.5, 5);
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
      titel: 'Eine Lichtwelle',
      teile: [
        {
          kamera: { position: [-3.1, 1.25, 5.4], ziel: [-3.1, 0.1, 2.4] },
          sichtbar: ['laser', 'einfall'],
          hilfen: ['lambdaMass'],
          tempo: 'zeitlupe',
          text:
            'Der Laser sendet Licht mit genau einer Wellenlänge: λ = [[lambda]]. Licht ist eine ' +
            'elektromagnetische Welle. Die Höhe im Bild zeigt, wie stark das elektrische Feld an ' +
            'jeder Stelle gerade ist: oben und hell ist ein Wellenberg, unten und dunkel ein ' +
            'Wellental.\n\n' +
            'Die orange Klammer misst den Abstand von einem Berg zum nächsten: genau eine ' +
            'Wellenlänge λ. In Zeitlupe siehst du, wie die Berge nach vorn laufen — die Klammer ' +
            'läuft mit.',
        },
        {
          kamera: { position: [-2.6, 9, 0.01], ziel: [-2.6, 0, 0] },
          sichtbar: ['laser', 'einfall'],
          text:
            'Von oben sieht man: Die Wellenberge liegen auf geraden Linien quer zur Laufrichtung. ' +
            'Entlang einer solchen Linie schwingt das Licht überall im Gleichtakt — alle Punkte ' +
            'erreichen im selben Moment ihren Berg. So eine Welle heißt ebene Welle.\n\n' +
            'Dieser Gleichtakt ist der Schlüssel zu allem, was gleich passiert.',
        },
        {
          kamera: { position: [-8, 5, 7], ziel: [-1, 0, 0] },
          sichtbar: ['laser', 'einfall', 'blende'],
          text:
            'Jetzt trifft die Welle auf eine Blende. Die Blende ist schwarz und schluckt das ' +
            'Licht. Nur durch die schmalen Spalte kommt es hindurch.',
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
            'Zuerst ist nur ein Spalt offen. Würde Licht einfach geradeaus fliegen, gäbe es ' +
            'dahinter nur einen schmalen Lichtstreifen, so breit wie der Spalt. Stattdessen ' +
            'breitet es sich hinter dem Spalt kreisförmig aus.',
        },
        {
          kamera: 'draufsicht',
          text:
            'Warum? Nach dem Huygens-Prinzip wird jeder Punkt, den eine Welle erreicht, selbst ' +
            'zum Ausgangspunkt einer kleinen Kreiswelle (Elementarwelle). Vor der Blende liegen ' +
            'unzählig viele nebeneinander und ergeben zusammen wieder die gerade Welle.\n\n' +
            'Im schmalen Spalt bleiben nur wenige übrig — von dort läuft eine Kreiswelle nach ' +
            'vorn in alle Richtungen. Dieses Auffächern heißt Beugung.',
        },
        {
          kamera: { position: [2, 7, 9], ziel: [9, 0.8, 0] },
          text:
            'Auf dem Schirm entsteht dadurch ein breiter heller Fleck statt eines scharfen ' +
            'Streifens.\n\n' +
            'Zieh an der Spaltbreite b: Je schmaler der Spalt, desto weniger Elementarwellen ' +
            'bleiben übrig und desto stärker fächert das Licht auf — der Fleck wird breiter.\n\n' +
            'In echt ist der Spalt etwa [[bDurchLambda]] Wellenlängen breit; dort fächert das ' +
            'Licht nur bis etwa [[thetaHuelle]] zur Seite auf. Im Bild ist das stark übertrieben.',
        },
      ],
    },
    {
      titel: 'Zwei Spalte: zwei Kreiswellen im Gleichtakt',
      freieRegler: ['d'],
      teile: [
        {
          kamera: { position: [-1.8, 4, 5.2], ziel: [1.8, 0, 0] },
          text:
            'Jetzt ist auch der zweite Spalt offen. Dieselbe gerade Wellenfront erreicht beide ' +
            'Spalte im selben Moment. Darum starten beide Kreiswellen im Gleichtakt: Wenn am ' +
            'einen Spalt ein Berg losläuft, läuft auch am anderen gerade ein Berg los.',
        },
        {
          kamera: kopie(UEBERBLICK),
          text:
            'Hinter der Blende laufen die beiden Kreiswellen ineinander. Es entstehen helle ' +
            'Bahnen, die fächerförmig zum Schirm laufen, und dazwischen ruhige graue Bahnen. Auf ' +
            'dem Schirm wird daraus ein Muster aus hellen und dunklen Streifen.\n\n' +
            'Warum es genau dort hell und dort dunkel ist, zeigen die nächsten beiden Schritte.',
        },
        {
          kamera: kopie(UEBERBLICK),
          text:
            'Zieh am Spaltabstand d: Die Kreiswellen starten weiter auseinander, die hellen ' +
            'Bahnen liegen dichter, und die Streifen auf dem Schirm rücken zusammen.',
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
            'Schauen wir uns einen einzelnen Punkt an (orange markiert). Hier kommen die Wellen ' +
            'beider Spalte an — die weißen Linien zeigen ihre Wege.\n\n' +
            'In Zeitlupe siehst du: Der Punkt schwingt besonders stark auf und ab. Denn hier ' +
            'kommt von beiden Spalten im selben Moment ein Berg an. Die Berge addieren sich zu ' +
            'einem fast doppelt so hohen Berg, danach die Täler zu einem fast doppelt so tiefen ' +
            'Tal. Das heißt konstruktive Interferenz: Hier ist es hell.',
        },
        {
          kamera: nahAn(dunkel4),
          auswahl: dunkel4,
          tempo: 'zeitlupe',
          text:
            'Ein Stück daneben ist es ganz anders: Hier kommt vom einen Spalt ein Berg an, ' +
            'während vom anderen gerade ein Tal ankommt. Berg und Tal heben sich auf — der Punkt ' +
            'bleibt fast in Ruhe. Das heißt destruktive Interferenz: Hier ist es dunkel.\n\n' +
            'Die ruhigen grauen Bahnen bestehen aus lauter solchen Punkten. Warum gerade dort ' +
            'Berg auf Tal trifft, zeigt der nächste Schritt.',
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
            'Von oben sieht man die beiden Wege, die das Licht von den zwei Spalten bis zu einem ' +
            'Punkt P auf dem Schirm zurücklegt. Sie sind fast nie gleich lang. Den Unterschied ' +
            'nennt man Gangunterschied Δs.\n\n' +
            'Um ihn zu sehen, trägt man von P aus die Länge des kürzeren Wegs auf dem längeren ab ' +
            '(grau gestrichelt). Was vom längeren Weg übrig bleibt, ist Δs (orange).\n\n' +
            'P ist hier der erste helle Streifen neben der Mitte: Δs ist genau eine Wellenlänge. ' +
            'Die eine Welle kommt also eine ganze Schwingung später an — und damit wieder im ' +
            'Gleichtakt: Berg trifft auf Berg → hell.',
        },
        {
          kamera: 'draufsicht',
          umschalter: true,
          auswahl: ersterDunkel,
          text:
            'Jetzt liegt P auf dem dunklen Streifen gleich daneben: Δs ist 1,5 Wellenlängen. Die ' +
            'eine Welle ist eine halbe Schwingung verschoben: Berg trifft auf Tal → dunkel.\n\n' +
            'Die Regel: Ist Δs eine ganze Zahl von Wellenlängen (0, 1 λ, 2 λ …), ist es hell. Ist ' +
            'Δs eine halbe Zahl (0,5 λ, 1,5 λ …), ist es dunkel.',
        },
        {
          kamera: { position: [0.5, 6.5, 0.01], ziel: [0.5, 0, 0] },
          umschalter: true,
          auswahl: ersterHell,
          text:
            'Ganz nah an den Spalten: Das kleine Dreieck hat als lange Seite den Spaltabstand d ' +
            'und als kurze Seite Δs. Der Winkel darin ist derselbe Winkel θ, unter dem P von der ' +
            'Blende aus gesehen wird. Für einen weit entfernten Schirm gilt darum:',
          formeln: ['\\Delta s = d \\cdot \\sin\\theta'],
        },
        {
          kamera: 'draufsicht',
          umschalter: true,
          text:
            'Probier es selbst: Klick mit der linken Maustaste auf hellen und dunklen Streifen ' +
            'am Schirm oder auf Stellen im Wellenfeld und vergleiche Δs. Mit dem Mausrad kannst ' +
            'du an das Dreieck heranzoomen.',
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
            'Die hellen Streifen werden von der Mitte aus durchgezählt: Der mittlere hat die ' +
            'Ordnung m = 0 (beide Wege gleich lang), dann folgen nach beiden Seiten m = 1, 2, 3 … ' +
            'Beim Streifen m ist der Gangunterschied genau m Wellenlängen. Die dunklen Streifen ' +
            'liegen genau dazwischen.',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          auswahl: zweiterHell,
          text:
            'Beispiel m = 2: Die Welle vom ferneren Spalt kommt genau zwei Schwingungen später ' +
            'an — und trotzdem im Gleichtakt.',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Nach außen werden die Streifen dunkler. Das liegt am Einzelspalt aus Schritt 2: ' +
            'Jeder einzelne Spalt schickt schräg nach außen weniger Licht. Das Streifenmuster ' +
            'sitzt sozusagen unter dem breiten Fleck des Einzelspalts (der „Hülle").',
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
            'Jetzt lässt sich alles zusammensetzen: Hell ist es, wo Δs = m · λ. Aus dem Dreieck ' +
            'wissen wir Δs = d · sin θ. Zusammen ergibt das die Bedingung für die hellen ' +
            'Streifen:',
          formeln: [
            'd \\cdot \\sin\\theta_m = m \\cdot \\lambda',
            '\\sin\\theta_1 = \\frac{\\lambda}{d} = \\frac{[[lambda]]}{[[d]]} \\;\\Rightarrow\\; \\theta_1 = [[theta1]]',
          ],
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          umschalter: true,
          text:
            'In echt sind die Winkel winzig (θ₁ = [[theta1]]). Für so kleine Winkel ist ' +
            'sin θ ≈ tan θ = x / L, wobei x der Abstand des Streifens von der Mitte auf dem ' +
            'Schirm ist. Eingesetzt: d · x / L = m · λ. Der Abstand zweier benachbarter Streifen ' +
            'ist darum:',
          formeln: [
            '\\Delta x \\approx \\frac{\\lambda \\cdot L}{d} = \\frac{[[lambda]] \\cdot [[L]]}{[[d]]} = [[deltaX]]',
          ],
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          umschalter: true,
          text:
            'Probier die Regler aus: Größere Wellenlänge oder größerer Schirmabstand → Streifen ' +
            'weiter auseinander. Größerer Spaltabstand → Streifen enger. Genau das sagt die ' +
            'Formel.\n\n' +
            'Der Spalt ist in diesem Schritt besonders schmal eingestellt (b = [[b]]), damit die ' +
            'Formel genau passt. Bei breiteren Spalten rücken die Streifen durch die Hülle ' +
            'leicht nach innen — die Formel ist eine Näherung für schmale Spalte.',
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
          text:
            'Rotes Licht (λ = [[lambda]]) hat eine lange Wellenlänge. Der Gangunterschied ' +
            'erreicht erst unter einem größeren Winkel eine ganze Wellenlänge — die Streifen ' +
            'liegen weit auseinander: Δx = [[deltaX]].',
        },
        {
          kamera: kopie(UEBERBLICK),
          werte: { lambda: 450e-9 },
          text:
            'Blaues Licht (λ = [[lambda]]) hat eine kürzere Wellenlänge. Eine ganze Wellenlänge ' +
            'Gangunterschied ist schneller erreicht — die Streifen rücken zusammen: ' +
            'Δx = [[deltaX]].',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          text:
            'Und weißes Licht? Es enthält alle Farben gleichzeitig. Jede Farbe macht ihr eigenes ' +
            'Streifenmuster. Nur in der Mitte (m = 0) liegen alle übereinander, dort bleibt es ' +
            'weiß. Daneben entstehen farbige Säume: innen blau, außen rot.\n\n' +
            'Zieh an der Wellenlänge und beobachte Farbe und Streifenabstand.',
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
            'Die Spaltbreite b bestimmt, wie stark jeder einzelne Spalt das Licht auffächert ' +
            '(Schritt 2). Das Streifenmuster sitzt unter dieser Einzelspalt-Hülle: Wo die Hülle ' +
            'hell ist, sind die Streifen hell, wo sie dunkel wird, verschwinden sie.',
        },
        {
          // Zum fehlenden Streifen hin gedreht, sonst liegt er unter dem Seitenfeld.
          kamera: { position: [1, 6, fehlender.z * 0.6], ziel: [12, 1.2, fehlender.z * 0.6] },
          hilfen: ['ordnungen'],
          auswahl: fehlender,
          text:
            'Hier ist der Spaltabstand genau dreimal so groß wie die Spaltbreite (d = [[d]], ' +
            'b = [[b]]). Dann fällt der Streifen m = 3 genau auf eine Stelle, an der sich schon ' +
            'das Licht innerhalb jedes einzelnen Spalts auslöscht (Einzelspalt-Minimum). Obwohl ' +
            'Δs = 3 λ ist, bleibt es dort dunkel — der Streifen fehlt.',
        },
        {
          kamera: kopie(AUF_SCHIRM),
          hilfen: ['ordnungen'],
          text:
            'Zieh an der Spaltbreite b: Schmalere Spalte fächern stärker auf, die Hülle wird ' +
            'breiter, und mehr Streifen werden sichtbar. Breitere Spalte machen die Hülle ' +
            'schmaler. Wo die Streifen liegen, ändert sich dabei kaum — das bestimmt der ' +
            'Spaltabstand d, nicht b.',
        },
        {
          kamera: kopie(UEBERBLICK),
          text:
            'Damit ist das Wellenbild vollständig: Beugung an jedem Spalt, Überlagerung der ' +
            'beiden Kreiswellen, Gangunterschied, Formel, Farbe und Hülle.\n\n' +
            'Aber Licht hat noch eine zweite Seite. Was passiert, wenn man es so schwach macht, ' +
            'dass nur noch einzelne Lichtteilchen (Photonen) durch die Spalte gehen? Das ist das ' +
            'Thema der nächsten Phase.',
        },
      ],
    },
  ],
};
