// Erklärfeld: Formeln mit eingesetzten Zahlen, ein Satz mit Live-Werten und — nach jeder
// Änderung — der Satz, WARUM sich das Bild so ändert. Was sich gerade geändert hat, leuchtet
// kurz orange auf, damit man den Zusammenhang Regler → Formel → Bild sieht.

import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { Experiment } from '../experiment';
import { alsTex, alsText, setzeEin } from '../format';
import type { Parameter } from '../parameter';

const AKZENT = '#ff8c2e'; // = --akzent in index.html
const LEUCHTDAUER_MS = 900;

export function erklaerfeld(experiment: Experiment, parameter: Parameter): HTMLElement {
  const feld = document.createElement('div');
  feld.className = 'erklaerung';
  const formeln = experiment.erklaerung.formeln.map(() => {
    const el = document.createElement('div');
    el.className = 'formel';
    return el;
  });
  const text = document.createElement('p');
  const warum = document.createElement('p');
  warum.className = 'warum';
  feld.append(...formeln, text, warum);

  const parameterNamen = new Set(experiment.parameter.map((p) => p.schluessel));
  let leuchtend: string | null = null;
  let leuchtTimer = 0;

  const zeichne = () => {
    const werte = parameter.alle;
    const groessen = experiment.groessen(werte);
    // Leuchten: der geänderte Parameter und alle berechneten Größen (die hängen von ihm ab).
    const leuchtet = (name: string) =>
      leuchtend !== null && (name === leuchtend || !parameterNamen.has(name));
    experiment.erklaerung.formeln.forEach((vorlage, i) => {
      const tex = setzeEin(vorlage, groessen, (g, name) =>
        leuchtet(name) ? `\\textcolor{${AKZENT}}{${alsTex(g)}}` : alsTex(g),
      );
      katex.render(tex, formeln[i], { throwOnError: true, displayMode: true });
    });
    text.textContent = setzeEin(experiment.erklaerung.text, groessen, (g) => alsText(g));
  };

  parameter.beobachte((_, geaendert) => {
    if (geaendert) {
      leuchtend = geaendert;
      warum.textContent = parameter.def(geaendert).warum;
      warum.classList.add('sichtbar');
      window.clearTimeout(leuchtTimer);
      leuchtTimer = window.setTimeout(() => {
        leuchtend = null;
        zeichne();
      }, LEUCHTDAUER_MS);
    }
    zeichne();
  });
  return feld;
}
