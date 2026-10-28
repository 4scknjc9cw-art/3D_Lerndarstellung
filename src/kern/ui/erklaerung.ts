// Erklärfeld: Formeln mit eingesetzten Zahlen, ein Text mit Live-Werten und — nach jeder
// Änderung — der Satz, WARUM sich das Bild so ändert. Was sich gerade geändert hat, leuchtet
// kurz orange auf, damit man den Zusammenhang Regler → Formel → Bild sieht.
// Der Inhalt ist austauschbar: jeder Tour-Schritt bringt seinen eigenen mit. Darüber steht
// die Erklärung zum gewählten Punkt P, wo es einen gibt.

import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { Auswahl } from '../auswahl';
import type { Experiment, Groesse } from '../experiment';
import { alsTex, alsText, setzeEin } from '../format';
import type { Parameter } from '../parameter';

const AKZENT = '#ff8c2e'; // = --akzent in index.html
const LEUCHTDAUER_MS = 900;

export interface Inhalt {
  formeln?: string[];
  text: string;
}

/** Text und Formeln mit eingesetzten Werten in einen Behälter zeichnen. */
function zeichneInhalt(
  behaelter: HTMLElement,
  inhalt: Inhalt,
  groessen: Record<string, Groesse>,
  leuchtet: (name: string) => boolean,
): void {
  // Leerzeile im Text = neuer Absatz. textContent statt innerHTML: Text ist nie HTML.
  const absaetze = setzeEin(inhalt.text, groessen, (g) => alsText(g)).split(/\n\s*\n/);
  const elemente: HTMLElement[] = absaetze.map((a) =>
    Object.assign(document.createElement('p'), { textContent: a.trim() }),
  );
  for (const vorlage of inhalt.formeln ?? []) {
    const tex = setzeEin(vorlage, groessen, (g, name) =>
      leuchtet(name) ? `\\textcolor{${AKZENT}}{${alsTex(g)}}` : alsTex(g),
    );
    const el = Object.assign(document.createElement('div'), { className: 'formel' });
    katex.render(tex, el, { throwOnError: true, displayMode: true });
    elemente.push(el);
  }
  behaelter.replaceChildren(...elemente);
}

export class Erklaerfeld {
  readonly element = document.createElement('div');
  private haupt = document.createElement('div');
  /**
   * Der „warum"-Satz nach einer Regleränderung. Eigenes Element, damit das Seitenfeld ihn UNTER
   * die Regler setzen kann — darüber würde er beim Ziehen den Regler nach unten schieben.
   */
  readonly warum = document.createElement('p');
  private mitWarum = true;
  private auswahlKasten = document.createElement('div');
  private auswahlInhalt = document.createElement('div');
  private springLeiste = document.createElement('div');
  private entfernen = document.createElement('button');
  /** Die Teile des aktuellen Schritts bis hierher; der letzte ist der aktive. */
  private inhalte: Inhalt[] = [];
  private leuchtend: string | null = null;
  private leuchtTimer = 0;
  private parameterNamen: Set<string>;

  constructor(
    private experiment: Experiment,
    private parameter: Parameter,
    private auswahl: Auswahl,
    /** Punkt zum nächsten Streifen schieben: −1 = nach oben (−z in der Draufsicht), +1 = nach unten. */
    springe: (richtung: -1 | 1) => void,
  ) {
    this.element.className = 'erklaerung';
    this.warum.className = 'warum';
    this.auswahlKasten.className = 'auswahl';
    const kopf = Object.assign(document.createElement('div'), { className: 'auswahl-kopf' });
    const titel = Object.assign(document.createElement('span'), { textContent: 'Punkt P' });
    Object.assign(this.entfernen, { textContent: '×', title: 'Entfernen' });
    this.entfernen.addEventListener('click', () => auswahl.setze(null));
    kopf.append(titel, this.entfernen);

    // Springen statt frei schieben (Kurt): von Streifen zu Streifen, hell → dunkel → hell …
    this.springLeiste.className = 'spring-leiste';
    const hoch = Object.assign(document.createElement('button'), { textContent: '▲ Streifen darüber' });
    const runter = Object.assign(document.createElement('button'), { textContent: '▼ Streifen darunter' });
    hoch.addEventListener('click', () => springe(-1));
    runter.addEventListener('click', () => springe(1));
    const tipp = Object.assign(document.createElement('span'), {
      className: 'tipp',
      textContent: 'oder Pfeiltasten ↑ ↓',
    });
    this.springLeiste.append(hoch, runter, tipp);
    this.auswahlKasten.append(kopf, this.springLeiste, this.auswahlInhalt);
    // Erst der Tour-Text, dann der Kasten zum Punkt: sonst liest man Δs und Formeln, bevor der
    // Text sie erklärt hat. Der aktive Teil wird ohnehin nach oben gescrollt.
    this.element.append(this.haupt, this.auswahlKasten);
    this.parameterNamen = new Set(experiment.parameter.map((p) => p.schluessel));
    this.setzeWaehlbar(false);

    parameter.beobachte((_, geaendert) => {
      if (geaendert) {
        this.leuchtend = geaendert;
        this.warum.textContent = parameter.def(geaendert).warum;
        this.warum.classList.toggle('sichtbar', this.mitWarum);
        window.clearTimeout(this.leuchtTimer);
        this.leuchtTimer = window.setTimeout(() => {
          this.leuchtend = null;
          this.zeichne();
        }, LEUCHTDAUER_MS);
      }
      this.zeichne();
    });
    auswahl.beobachte(() => this.zeichne());
  }

  /**
   * In der Tour sagt der Text des Teils schon, was der Regler bewirkt — dort wäre der
   * „warum"-Satz doppelt (Kurt: Extrafeld weglassen, wenn nicht nötig). Im freien Modus fehlt
   * so ein Text, da bleibt er.
   */
  setzeWarum(an: boolean): void {
    this.mitWarum = an;
    if (!an) this.warum.classList.remove('sichtbar');
  }

  /** Darf man den Punkt selbst verschieben? Dann gibt es ▲▼ und ×, sonst ist er fest. */
  setzeWaehlbar(an: boolean): void {
    this.springLeiste.hidden = !an;
    this.entfernen.hidden = !an;
  }

  /**
   * Neuer Inhalt (z. B. neuer Tour-Teil): frühere Teile desselben Schritts bleiben abgeblendet
   * darüber stehen, damit der Zusammenhang nicht verloren geht. Der alte „warum"-Satz gehört
   * nicht mehr dazu.
   */
  setzeInhalt(...inhalte: Inhalt[]): void {
    this.inhalte = inhalte;
    this.leuchtend = null;
    this.warum.classList.remove('sichtbar');
    this.zeichne();
  }

  private zeichne(): void {
    const werte = this.parameter.alle;
    const groessen = this.experiment.groessen(werte);
    // Leuchten: der geänderte Parameter und alle berechneten Größen (die hängen von ihm ab).
    const leuchtet = (name: string) =>
      this.leuchtend !== null && (name === this.leuchtend || !this.parameterNamen.has(name));
    this.haupt.replaceChildren(
      ...this.inhalte.map((inhalt, i) => {
        const aktiv = i === this.inhalte.length - 1;
        const teil = Object.assign(document.createElement('div'), {
          className: aktiv ? 'teil aktiv' : 'teil frueher',
        });
        zeichneInhalt(teil, inhalt, groessen, aktiv ? leuchtet : () => false);
        return teil;
      }),
    );

    const punkt = this.auswahl.aktuell;
    // Ein „einfacher" Punkt wird nur markiert — seine Erklärung (Δs, Formeln) käme zu früh.
    this.auswahlKasten.hidden = !punkt || !!punkt.einfach;
    if (punkt && !punkt.einfach) {
      const a = this.experiment.auswahl(werte, punkt);
      zeichneInhalt(this.auswahlInhalt, a, { ...groessen, ...a.groessen }, leuchtet);
    }
  }
}
