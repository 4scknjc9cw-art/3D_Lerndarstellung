// Seitenfeld: oben Umschalter Tour / Frei, darunter Erklärung und Regler, unten Vor/Zurück.
// Beide Modi teilen sich EIN Erklärfeld und EINE Reglerliste — sie zeigen nur anderes.

import type { Experiment, ExperimentSzene } from '../experiment';
import type { Kamerafahrt } from '../kamera';
import type { Parameter } from '../parameter';
import { type TourSchritt, TourSpieler } from '../tour';
import { Erklaerfeld } from './erklaerung';
import { ReglerListe } from './regler';

type Modus = 'tour' | 'frei';

function knopf(text: string, klasse: string, beiKlick: () => void): HTMLButtonElement {
  const k = document.createElement('button');
  k.textContent = text;
  k.className = klasse;
  k.addEventListener('click', beiKlick);
  return k;
}

export function seitenfeld(
  experiment: Experiment,
  parameter: Parameter,
  szene: ExperimentSzene,
  fahrt: Kamerafahrt,
): { element: HTMLElement; starte(modus: Modus, schritt?: number): void } {
  const feld = document.createElement('aside');
  feld.className = 'seitenfeld';

  // Touren ohne Schritte (noch nicht gebaute Phasen) erscheinen gar nicht erst.
  const tour = experiment.touren.find((t) => t.schritte.length > 0);
  const startwerte = Object.fromEntries(experiment.parameter.map((p) => [p.schluessel, p.start]));
  const spieler = tour ? new TourSpieler(tour, parameter, startwerte) : undefined;
  for (const s of tour?.schritte ?? []) {
    for (const teil of s.sichtbar ?? []) {
      if (!szene.teile.includes(teil)) throw new Error(`Schritt „${s.titel}": unbekannter Teil ${teil}`);
    }
  }

  const modusLeiste = document.createElement('div');
  modusLeiste.className = 'modus';
  const tourKnopf = knopf('Geführte Tour', '', () => setzeModus('tour'));
  const freiKnopf = knopf('Frei ausprobieren', '', () => setzeModus('frei'));
  modusLeiste.append(tourKnopf, freiKnopf);

  const kopf = document.createElement('div');
  kopf.className = 'schritt-kopf';
  const titel = document.createElement('h1');
  const fortschritt = document.createElement('div');
  fortschritt.className = 'fortschritt';
  kopf.append(fortschritt, titel);

  const erklaerung = new Erklaerfeld(experiment, parameter);
  const reglerTitel = document.createElement('h2');
  reglerTitel.textContent = 'Ausprobieren';
  const regler = new ReglerListe(parameter, experiment.parameter);

  const navigation = document.createElement('div');
  navigation.className = 'navigation';
  const zurueck = knopf('← Zurück', 'zweitrangig', () => spieler?.zurueck());
  const weiter = knopf('Weiter →', 'hauptknopf', () => spieler?.weiter());
  navigation.append(zurueck, weiter);

  const inhalt = document.createElement('div');
  inhalt.className = 'inhalt';
  inhalt.append(kopf, erklaerung.element, reglerTitel, regler.element);
  feld.append(modusLeiste, inhalt, navigation);

  let modus: Modus = 'tour';

  const zeigeSchritt = (schritt: TourSchritt, index: number) => {
    titel.textContent = schritt.titel;
    fortschritt.textContent = `${tour!.titel} · Schritt ${index + 1} von ${spieler!.anzahl}`;
    erklaerung.setzeInhalt(schritt);
    reglerTitel.hidden = !regler.zeigeNur(schritt.freieRegler ?? []);
    szene.zeige(schritt.sichtbar ?? null);
    fahrt.fahre(schritt.kamera);
    zurueck.disabled = index === 0;
    weiter.disabled = index === spieler!.anzahl - 1;
    inhalt.scrollTop = 0;
  };
  spieler?.beobachte(zeigeSchritt);

  function setzeModus(neu: Modus): void {
    modus = neu === 'tour' && spieler ? 'tour' : 'frei';
    tourKnopf.classList.toggle('aktiv', modus === 'tour');
    freiKnopf.classList.toggle('aktiv', modus === 'frei');
    tourKnopf.disabled = !spieler;
    navigation.hidden = modus !== 'tour';
    if (modus === 'tour') {
      spieler!.gehe(spieler!.aktuell);
    } else {
      // Im freien Modus bleiben die Werte aus der Tour stehen — man macht dort weiter.
      fortschritt.textContent = 'Frei ausprobieren';
      titel.textContent = experiment.titel;
      erklaerung.setzeInhalt(experiment.erklaerung);
      reglerTitel.hidden = !regler.zeigeNur(null);
      szene.zeige(null);
      fahrt.fahre(experiment.ansicht);
    }
  }

  window.addEventListener('keydown', (e) => {
    // Pfeiltasten auf einem Regler bewegen den Regler, nicht die Tour.
    if (modus !== 'tour' || (e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') spieler?.weiter();
    if (e.key === 'ArrowLeft') spieler?.zurueck();
  });

  return {
    element: feld,
    /** Startet im gewünschten Modus; schritt zählt ab 0. */
    starte(start: Modus, schritt = 0) {
      if (start === 'tour' && spieler) spieler.gehe(schritt);
      setzeModus(start);
    },
  };
}
