// Tour Phase 1: Licht als Welle.
// PLATZHALTER (Schritt 4): zwei Probe-Schritte, die nur beweisen, dass die Tour-Maschine
// trägt — Kamerafahrt, Ein-/Ausblenden, freier Regler, Startwerte. Die neun echten Schritte
// samt Texten kommen in Schritt 6 (siehe docs/PLAN.md, „Tour Phase 1").

import type { Tour } from '../../kern/tour';

export const tourWelle: Tour = {
  titel: 'Licht als Welle',
  schritte: [
    {
      titel: 'Die Welle trifft auf die Blende',
      kamera: { position: [-9, 7, 9], ziel: [-1.5, 0, 0] },
      sichtbar: ['laser', 'einfall', 'blende'],
      text:
        'Probe-Schritt: Der Laser sendet eine Lichtwelle mit der Wellenlänge [[lambda]]. ' +
        'Die hellen Kämme sind Wellenberge, die dunklen Täler. Sie laufen auf eine Blende mit ' +
        'zwei schmalen Spalten zu.\n\n' +
        'Weiter mit → oder dem Knopf unten.',
    },
    {
      titel: 'Spaltabstand ausprobieren',
      kamera: { position: [-3, 6, 8], ziel: [3, 0, 0] },
      freieRegler: ['d'],
      startwerte: { d: 0.1e-3 },
      formeln: [
        '\\Delta x \\approx \\frac{\\lambda \\cdot L}{d} = \\frac{[[lambda]] \\cdot [[L]]}{[[d]]} = [[deltaX]]',
      ],
      text:
        'Probe-Schritt: Hinter den Spalten breiten sich zwei Kreiswellen aus. Zieh am ' +
        'Spaltabstand d und beobachte, wie sich die Streifen auf dem Schirm verändern.',
    },
  ],
};
