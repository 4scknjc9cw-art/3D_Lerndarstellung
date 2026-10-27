// Tour Phase 1: Licht als Welle.
// Regel für jeden Schritt (Kurt, 27.10.2026): nicht nur sagen, WAS man sieht, sondern WARUM,
// und dem Weg des Lichts folgen — jeder Schritt baut auf dem vorigen auf.
// Stand: Schritte 1–3 der geplanten neun (docs/PLAN.md, „Tour Phase 1"); der Rest folgt in
// Schritt 6.

import type { Tour } from '../../kern/tour';

export const tourWelle: Tour = {
  titel: 'Licht als Welle',
  schritte: [
    {
      titel: 'Eine Lichtwelle trifft auf die Blende',
      kamera: { position: [-9, 7, 9], ziel: [-1.5, 0, 0] },
      sichtbar: ['laser', 'einfall', 'blende'],
      text:
        'Der Laser sendet Licht mit genau einer Wellenlänge: λ = [[lambda]]. Licht ist eine ' +
        'elektromagnetische Welle. Die Höhe im Bild zeigt, wie stark das elektrische Feld an ' +
        'jeder Stelle gerade ist: hell und hoch ist ein Wellenberg, dunkel und tief ein ' +
        'Wellental. Von einem Berg zum nächsten ist es genau eine Wellenlänge.\n\n' +
        'Die Berge liegen auf geraden Linien quer zur Laufrichtung. Das heißt: Entlang einer ' +
        'solchen Linie schwingt das Licht überall im Gleichtakt. So eine Welle heißt ebene ' +
        'Welle. Dieser Gleichtakt ist der Schlüssel zu allem, was gleich passiert.\n\n' +
        'Die Blende ist schwarz und schluckt das Licht. Nur durch zwei schmale Spalte im ' +
        'Abstand d = [[d]] kommt es hindurch. Was dahinter passiert, zeigt der nächste Schritt.',
    },
    {
      titel: 'Hinter den Spalten fächert das Licht auf',
      kamera: { position: [-3, 6, 8], ziel: [3, 0, 0] },
      freieRegler: ['d'],
      text:
        'Würde Licht einfach geradeaus fliegen, gäbe es hinter jedem Spalt nur einen schmalen ' +
        'Lichtstreifen. Stattdessen breitet es sich hinter jedem Spalt kreisförmig aus.\n\n' +
        'Warum? Nach dem Huygens-Prinzip wird jeder Punkt, den eine Welle erreicht, selbst zum ' +
        'Ausgangspunkt einer neuen kleinen Kreiswelle (Elementarwelle). Vor der Blende ' +
        'überlagern sich unzählig viele davon wieder zur geraden Welle. Im schmalen Spalt ' +
        'bleiben aber nur wenige übrig, und von dort läuft eine Kreiswelle nach vorn in alle ' +
        'Richtungen. Dieses Auffächern heißt Beugung.\n\n' +
        'Dieselbe gerade Wellenfront erreicht beide Spalte im selben Moment. Darum starten ' +
        'beide Kreiswellen im Gleichtakt. Hinter der Blende laufen sie ineinander: Wo Berg auf ' +
        'Berg trifft, entstehen die hellen Bahnen, die zum Schirm laufen. Dazwischen trifft ' +
        'Berg auf Tal, die Wellen löschen sich aus, dort ist es ruhig und grau. Diese Bahnen ' +
        'erzeugen die hellen Streifen auf dem Schirm.\n\n' +
        'Im Bild ist das Auffächern stark übertrieben: In echt ist jeder Spalt etwa ' +
        '[[bDurchLambda]] Wellenlängen breit. Darum fächert das Licht dort nur bis etwa ' +
        '[[thetaHuelle]] zur Seite auf.\n\n' +
        'Zieh am Spaltabstand d: Die Kreiswellen starten weiter auseinander, die hellen Bahnen ' +
        'liegen dichter, und die Streifen auf dem Schirm rücken zusammen.',
    },
    {
      titel: 'Warum hell und dunkel: der Gangunterschied',
      kamera: { position: [-5, 12, 13], ziel: [5, 0, 0] },
      draufsicht: true,
      text:
        'Schalte oben auf „Draufsicht" und klicke mit der linken Maustaste auf eine Stelle ' +
        'am Schirm oder im Wellenfeld. Eingezeichnet werden die beiden Wege, die das Licht ' +
        'von den zwei Spalten bis zu diesem Punkt zurücklegt.\n\n' +
        'Die beiden Wege sind fast nie gleich lang. Den Unterschied nennt man Gangunterschied ' +
        'Δs. Um ihn zu sehen, trägt man vom Zielpunkt aus die Länge des kürzeren Wegs auf dem ' +
        'längeren ab (grau gestrichelt). Was vom längeren Weg übrig bleibt, ist Δs (orange).\n\n' +
        'Ist Δs eine ganze Zahl von Wellenlängen (0, 1 λ, 2 λ …), kommen beide Wellen im ' +
        'Gleichtakt an: Berg trifft auf Berg → hell. Ist Δs eine halbe Zahl (0,5 λ, 1,5 λ …), ' +
        'trifft Berg auf Tal → dunkel.\n\n' +
        'Das kleine Dreieck an den Spalten hat als lange Seite den Spaltabstand d und als ' +
        'kurze Seite Δs. Für einen weit entfernten Schirm gilt darum Δs = d · sin θ. Probier ' +
        'es aus: Klick auf die hellen und dunklen Streifen und vergleiche Δs.',
      formeln: ['\\Delta s = d \\cdot \\sin\\theta'],
    },
  ],
};
