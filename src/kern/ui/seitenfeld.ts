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
  /** Darf man gerade selbst einen Punkt wählen (Klick auf den Schirm, ▲▼)? */
  punktWaehlbar(): boolean;
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

  const erklaerung = new Erklaerfeld(experiment, parameter, auswahl, (r) => springe(r));
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
  inhalt.append(kopf, ansichtLeiste, erklaerung.element, reglerTitel, regler.element, erklaerung.warum);

  // Der Regler bleibt beim Ziehen unter der Maus (Kurt): ändert sich darüber Text (Zahlen,
  // Zeilenumbrüche, Kasten zum Punkt), wird das Seitenfeld um genau so viel nachgescrollt.
  let anker: { regler: HTMLElement; oben: number } | null = null;
  regler.element.addEventListener('pointerdown', (e) => {
    const zeile = (e.target as HTMLElement).closest<HTMLElement>('.regler');
    anker = zeile ? { regler: zeile, oben: zeile.getBoundingClientRect().top } : null;
  });
  window.addEventListener('pointerup', () => (anker = null));
  parameter.beobachte(() => {
    if (!anker) return;
    inhalt.scrollTop += anker.regler.getBoundingClientRect().top - anker.oben;
  });
  feld.append(modusLeiste, inhalt, navigation);

  let modus: Modus = 'tour';
  let waehlbar = false;
  /** Die 3D-Ansicht, zu der „3D-Ansicht" zurückkehrt. */
  let ansicht3d: Ansicht = experiment.ansicht;

  function setzeDraufsicht(an: boolean, sofort = false): void {
    knopf3d.classList.toggle('aktiv', !an);
    knopfOben.classList.toggle('aktiv', an);
    // Mit festem Punkt rahmt die Draufsicht das ganze Dreieck von der Blende bis zum Punkt ein.
    // Ist der Punkt wählbar, könnte er aus dem Rahmen springen — dann das ganze Feld zeigen.
    const punkt = waehlbar ? null : auswahl.aktuell;
    fahrt.fahre(an ? experiment.draufsicht(parameter.alle, punkt) : ansicht3d, sofort);
  }

  function setzeWaehlbar(an: boolean): void {
    waehlbar = an;
    erklaerung.setzeWaehlbar(an);
  }

  /** Punkt zum nächsten Streifen schieben; ohne Punkt beginnt er in der Mitte. */
  function springe(richtung: -1 | 1): void {
    if (!waehlbar) return;
    const jetzt = auswahl.aktuell;
    const neu = experiment.streifen(parameter.alle, jetzt, jetzt ? richtung : 0);
    if (neu) auswahl.setze(neu);
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
    erklaerung.setzeWarum(false);
    reglerTitel.hidden = !regler.zeigeNur(schritt.freieRegler ?? []);
    szene.zeige(teil.sichtbar ?? null);
    szene.zeigeHilfen(teil.hilfen ?? []);
    setzeWaehlbar(!!teil.punktWaehlen);
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
      erklaerung.setzeWarum(true);
      reglerTitel.hidden = !regler.zeigeNur(null);
      szene.zeige(null);
      szene.zeigeHilfen([]);
      auswahl.setze(null);
      setzeWaehlbar(true);
      ansicht3d = experiment.ansicht;
      ansichtLeiste.hidden = false;
      setzeDraufsicht(false);
    }
  }

  window.addEventListener('keydown', (e) => {
    // Pfeiltasten auf einem Regler bewegen den Regler, nicht die Tour. (Mit der Maus gezogene
    // Regler geben den Fokus beim Loslassen ab, siehe regler.ts.)
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    // ↑ ↓ schieben den Punkt von Streifen zu Streifen, ← → blättern in der Tour.
    if (waehlbar && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      springe(e.key === 'ArrowUp' ? -1 : 1);
    }
    if (modus !== 'tour') return;
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
    punktWaehlbar: () => waehlbar,
  };
}
