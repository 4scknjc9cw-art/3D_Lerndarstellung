// Erklärfeld: Formeln mit eingesetzten Zahlen, ein Text mit Live-Werten und — nach jeder
// Änderung — der Satz, WARUM sich das Bild so ändert. Was sich gerade geändert hat, leuchtet
// kurz orange auf, damit man den Zusammenhang Regler → Formel → Bild sieht.
// Der Inhalt ist austauschbar: jeder Tour-Schritt bringt seinen eigenen mit. Darunter
// erscheint nach einem Klick ins Bild die Erklärung zum angeklickten Punkt.

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
  private warum = document.createElement('p');
  private auswahlKasten = document.createElement('div');
  private auswahlInhalt = document.createElement('div');
  /** Die Teile des aktuellen Schritts bis hierher; der letzte ist der aktive. */
  private inhalte: Inhalt[] = [];
  private leuchtend: string | null = null;
  private leuchtTimer = 0;
  private parameterNamen: Set<string>;

  constructor(
    private experiment: Experiment,
    private parameter: Parameter,
    private auswahl: Auswahl,
  ) {
    this.element.className = 'erklaerung';
    this.warum.className = 'warum';
    this.auswahlKasten.className = 'auswahl';
    const kopf = Object.assign(document.createElement('div'), { className: 'auswahl-kopf' });
    const titel = Object.assign(document.createElement('span'), { textContent: 'Angeklickter Punkt' });
    const zu = Object.assign(document.createElement('button'), { textContent: '×', title: 'Entfernen' });
    zu.addEventListener('click', () => auswahl.setze(null));
    kopf.append(titel, zu);
    this.auswahlKasten.append(kopf, this.auswahlInhalt);
    // Ergebnis des Klicks oben, damit man es sieht, ohne zu scrollen.
    this.element.append(this.auswahlKasten, this.haupt, this.warum);
    this.parameterNamen = new Set(experiment.parameter.map((p) => p.schluessel));

    parameter.beobachte((_, geaendert) => {
      if (geaendert) {
        this.leuchtend = geaendert;
        this.warum.textContent = parameter.def(geaendert).warum;
        this.warum.classList.add('sichtbar');
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
    this.auswahlKasten.hidden = !punkt;
    if (punkt) {
      const a = this.experiment.auswahl(werte, punkt);
      zeichneInhalt(this.auswahlInhalt, a, { ...groessen, ...a.groessen }, leuchtet);
    }
  }
}
