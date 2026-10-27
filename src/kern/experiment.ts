// Die Schablone, die jedes Experiment erfüllen muss — die zentrale Naht der App.
// Der Kern (Regler, Text, Zeit, später Tour und Kamera) kennt nur diese Schnittstelle und
// weiß nichts vom Doppelspalt. Ein neues Experiment ist ein neuer Ordner, kein Umbau.

import type * as THREE from 'three';
import type { Werte } from './parameter';
import type { Ansicht, Tour } from './tour';

/** Wie ein Wert mit Einheit angezeigt wird. */
export interface Einheit {
  zeichen: string; // z. B. "nm"
  faktor: number; // SI-Wert = Anzeigewert · faktor
  stellen: number; // Nachkommastellen in der Anzeige
}

export interface ParameterDef {
  schluessel: string; // Name im Code und in Platzhaltern: [[d]]
  name: string; // "Spaltabstand"
  symbol: string; // Formelzeichen in TeX: "d", "\\lambda"
  einheit: Einheit;
  min: number; // in SI-Einheiten, wie alle Werte im Speicher
  max: number;
  schritt: number;
  start: number;
  /** Ein Satz: was passiert, wenn man diesen Wert vergrößert, und warum. */
  warum: string;
}

/** Ein berechneter Wert zum Einsetzen in Text und Formeln. */
export interface Groesse {
  wert: number; // SI
  einheit: Einheit;
}

export interface ExperimentSzene {
  readonly gruppe: THREE.Object3D;
  setze(werte: Werte): void;
  animiere(simSekunden: number): void;
  /** Benannte Teile, die ein Tour-Schritt ein- und ausblenden darf. */
  readonly teile: readonly string[];
  /** null = alles zeigen. Unbekannte Namen sind ein Fehler. */
  zeige(teile: readonly string[] | null): void;
}

export interface Experiment {
  titel: string;
  parameter: ParameterDef[];
  erzeugeSzene(): ExperimentSzene;
  /** Alle Größen, die Text und Formeln einsetzen dürfen: Parameter und daraus berechnete. */
  groessen(werte: Werte): Record<string, Groesse>;
  /** Erklärfeld im freien Modus. */
  erklaerung: { formeln: string[]; text: string };
  /** Startansicht im freien Modus. */
  ansicht: Ansicht;
  /** Eine Tour je Phase (Welle, Quanten, Elektronen), in Lernreihenfolge. */
  touren: Tour[];
}
