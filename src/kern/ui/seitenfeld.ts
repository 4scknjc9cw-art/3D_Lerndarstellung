// Seitenfeld: oben Umschalter Tour / Frei, darunter Erklärung und Regler, unten Vor/Zurück.
// Beide Modi teilen sich EIN Erklärfeld und EINE Reglerliste — sie zeigen nur anderes.
// Der Umschalter 3D / Draufsicht erscheint nur, wo er hilft (Kurt): in Tour-Teilen mit
// `umschalter: true` und im freien Modus.

import type { Auswahl } from '../auswahl';
import type { Experiment, ExperimentSzene } from '../experiment';
import type { Kamerafahrt } from '../kamera';
import type { Parameter } from '../parameter';
import { type Ansicht, type Stelle, type TourSchritt, TourSpieler } from '../tour';
import type { Zeit } from '../zeit';
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
  auswahl: Auswahl,
  zeit: Zeit,
): {
  element: HTMLElement;
  starte(modus: Modus, schritt?: number, teil?: number): void;
  setzeDraufsicht(an: boolean, sofort?: boolean): void;
} {
  const feld = document.createElement('aside');
  feld.className = 'seitenfeld';

  // Touren ohne Schritte (noch nicht gebaute Phasen) erscheinen gar nicht erst.
  const tour = experiment.touren.find((t) => t.schritte.length > 0);
  const startwerte = Object.fromEntries(experiment.parameter.map((p) => [p.schluessel, p.start]));
  const spieler = tour ? new TourSpieler(tour, parameter, startwerte) : undefined;
  for (const s of tour?.schritte ?? []) {
    for (const t of s.teile) {
      for (const teil of t.sichtbar ?? []) {
        if (!szene.teile.includes(teil)) throw new Error(`„${s.titel}": unbekannter Teil ${teil}`);
      }
      for (const h of t.hilfen ?? []) {
        if (!szene.hilfen.includes(h)) throw new Error(`„${s.titel}": unbekannte Hilfe ${h}`);
      }
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
  const punkte = document.createElement('div');
  punkte.className = 'teil-punkte';
  kopf.append(fortschritt, titel, punkte);

  const ansichtLeiste = document.createElement('div');
  ansichtLeiste.className = 'ansicht-leiste';
  const knopf3d = knopf('3D-Ansicht', '', () => setzeDraufsicht(false));
  const knopfOben = knopf('Draufsicht', '', () => setzeDraufsicht(true));
  ansichtLeiste.append(knopf3d, knopfOben);

  const erklaerung = new Erklaerfeld(experiment, parameter, auswahl);
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
  inhalt.append(kopf, ansichtLeiste, erklaerung.element, reglerTitel, regler.element);
  feld.append(modusLeiste, inhalt, navigation);

  let modus: Modus = 'tour';
  /** Die 3D-Ansicht, zu der „3D-Ansicht" zurückkehrt. */
  let ansicht3d: Ansicht = experiment.ansicht;

  function setzeDraufsicht(an: boolean, sofort = false): void {
    knopf3d.classList.toggle('aktiv', !an);
    knopfOben.classList.toggle('aktiv', an);
    fahrt.fahre(an ? experiment.draufsicht(parameter.alle) : ansicht3d, sofort);
  }

  const zeigeStelle = (schritt: TourSchritt, stelle: Stelle) => {
    const teil = schritt.teile[stelle.teil];
    titel.textContent = schritt.titel;
    fortschritt.textContent = `${tour!.titel} · Schritt ${stelle.schritt + 1} von ${spieler!.anzahl}`;
    punkte.replaceChildren(
      ...schritt.teile.map((_, i) =>
        Object.assign(document.createElement('span'), {
          className: i < stelle.teil ? 'erledigt' : i === stelle.teil ? 'aktiv' : '',
        }),
      ),
    );
    punkte.hidden = schritt.teile.length < 2;

    erklaerung.setzeInhalt(...schritt.teile.slice(0, stelle.teil + 1));
    reglerTitel.hidden = !regler.zeigeNur(schritt.freieRegler ?? []);
    szene.zeige(teil.sichtbar ?? null);
    szene.zeigeHilfen(teil.hilfen ?? []);
    auswahl.setze(teil.auswahl ?? null);
    zeit.setze(teil.tempo ?? 'normal');

    // 3D-Ansicht dieses Teils: seine eigene, sonst die letzte 3D-Ansicht davor im Schritt.
    const frueher3d = schritt.teile
      .slice(0, stelle.teil + 1)
      .map((t) => t.kamera)
      .filter((k): k is Ansicht => k !== 'draufsicht');
    ansicht3d = frueher3d.at(-1) ?? experiment.ansicht;
    ansichtLeiste.hidden = !teil.umschalter;
    setzeDraufsicht(teil.kamera === 'draufsicht');

    zurueck.disabled = spieler!.amAnfang;
    weiter.disabled = spieler!.amEnde;
    // Der aktive Teil steht unten — dorthin scrollen, frühere bleiben darüber lesbar.
    if (stelle.teil === 0) inhalt.scrollTop = 0;
    else {
      requestAnimationFrame(() =>
        inhalt.querySelector('.teil.aktiv')?.scrollIntoView({ block: 'start', behavior: 'smooth' }),
      );
    }
  };
  spieler?.beobachte(zeigeStelle);

  function setzeModus(neu: Modus): void {
    modus = neu === 'tour' && spieler ? 'tour' : 'frei';
    tourKnopf.classList.toggle('aktiv', modus === 'tour');
    freiKnopf.classList.toggle('aktiv', modus === 'frei');
    tourKnopf.disabled = !spieler;
    navigation.hidden = modus !== 'tour';
    if (modus === 'tour') {
      const { schritt, teil } = spieler!.aktuell;
      spieler!.gehe(schritt, teil);
    } else {
      // Im freien Modus bleiben die Werte aus der Tour stehen — man macht dort weiter.
      fortschritt.textContent = 'Frei ausprobieren';
      titel.textContent = experiment.titel;
      punkte.hidden = true;
      erklaerung.setzeInhalt(experiment.erklaerung);
      reglerTitel.hidden = !regler.zeigeNur(null);
      szene.zeige(null);
      szene.zeigeHilfen([]);
      auswahl.setze(null);
      ansicht3d = experiment.ansicht;
      ansichtLeiste.hidden = false;
      setzeDraufsicht(false);
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
    /** Startet im gewünschten Modus; schritt und teil zählen ab 0. */
    starte(start: Modus, schritt = 0, teil = 0) {
      if (start === 'tour' && spieler) spieler.gehe(schritt, teil);
      setzeModus(start);
    },
    setzeDraufsicht,
  };
}
