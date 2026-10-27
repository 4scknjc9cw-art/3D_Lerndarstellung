// Erklärfeld: Formeln mit eingesetzten Zahlen, ein Text mit Live-Werten und — nach jeder
// Änderung — der Satz, WARUM sich das Bild so ändert. Was sich gerade geändert hat, leuchtet
// kurz orange auf, damit man den Zusammenhang Regler → Formel → Bild sieht.
// Der Inhalt ist austauschbar: jeder Tour-Schritt bringt seinen eigenen mit.

import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { Experiment } from '../experiment';
import { alsTex, alsText, setzeEin } from '../format';
import type { Parameter } from '../parameter';

const AKZENT = '#ff8c2e'; // = --akzent in index.html
const LEUCHTDAUER_MS = 900;

export interface Inhalt {
  formeln?: string[];
  text: string;
}

export class Erklaerfeld {
  readonly element = document.createElement('div');
  private formelBereich = document.createElement('div');
  private text = document.createElement('div');
  private warum = document.createElement('p');
  private inhalt: Inhalt = { text: '' };
  private leuchtend: string | null = null;
  private leuchtTimer = 0;
  private parameterNamen: Set<string>;

  constructor(
    private experiment: Experiment,
    private parameter: Parameter,
  ) {
    this.element.className = 'erklaerung';
    this.warum.className = 'warum';
    this.text.className = 'text';
    this.element.append(this.text, this.formelBereich, this.warum);
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
  }

  /** Neuer Inhalt (z. B. neuer Tour-Schritt): der alte „warum"-Satz gehört nicht mehr dazu. */
  setzeInhalt(inhalt: Inhalt): void {
    this.inhalt = inhalt;
    this.leuchtend = null;
    this.warum.classList.remove('sichtbar');
    this.formelBereich.replaceChildren(
      ...(inhalt.formeln ?? []).map(() => Object.assign(document.createElement('div'), { className: 'formel' })),
    );
    this.zeichne();
  }

  private zeichne(): void {
    const groessen = this.experiment.groessen(this.parameter.alle);
    // Leuchten: der geänderte Parameter und alle berechneten Größen (die hängen von ihm ab).
    const leuchtet = (name: string) =>
      this.leuchtend !== null && (name === this.leuchtend || !this.parameterNamen.has(name));
    (this.inhalt.formeln ?? []).forEach((vorlage, i) => {
      const tex = setzeEin(vorlage, groessen, (g, name) =>
        leuchtet(name) ? `\\textcolor{${AKZENT}}{${alsTex(g)}}` : alsTex(g),
      );
      katex.render(tex, this.formelBereich.children[i] as HTMLElement, {
        throwOnError: true,
        displayMode: true,
      });
    });
    // Leerzeile im Text = neuer Absatz. textContent statt innerHTML: Text ist nie HTML.
    const absaetze = setzeEin(this.inhalt.text, groessen, (g) => alsText(g)).split(/\n\s*\n/);
    this.text.replaceChildren(
      ...absaetze.map((a) => Object.assign(document.createElement('p'), { textContent: a.trim() })),
    );
  }
}
