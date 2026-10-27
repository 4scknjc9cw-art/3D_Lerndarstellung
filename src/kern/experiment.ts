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
  tex?: string; // eigene TeX-Schreibweise, z. B. "\\,\\lambda" für „1,5 λ"
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

/** Ein angeklickter Punkt in Szenen-Koordinaten (Darstellungsmaßstab). */
export interface Punkt {
  x: number;
  z: number;
  /** Auf dem Schirm angeklickt: bleibt auf dem Schirm, auch wenn der sich verschiebt. */
  aufSchirm: boolean;
}

export interface ExperimentSzene {
  readonly gruppe: THREE.Object3D;
  setze(werte: Werte): void;
  animiere(simSekunden: number): void;
  /** Benannte Teile, die ein Tour-Schritt ein- und ausblenden darf. */
  readonly teile: readonly string[];
  /** null = alles zeigen. Unbekannte Namen sind ein Fehler. */
  zeige(teile: readonly string[] | null): void;
  /** Hilfen im Bild, die nur Tour-Teile einblenden (λ-Maß, Ordnungen …). */
  readonly hilfen: readonly string[];
  zeigeHilfen(namen: readonly string[]): void;
  /** Wo trifft ein Mausklick (als Strahl) etwas Anklickbares? */
  trefferpunkt(strahl: THREE.Ray): Punkt | null;
  /** Zeichnet die Konstruktion zum Punkt ein (null = entfernen). */
  zeigeAuswahl(punkt: Punkt | null): void;
}

/** Was das Erklärfeld zu einem angeklickten Punkt anzeigt. */
export interface AuswahlInhalt {
  formeln: string[];
  text: string;
  groessen: Record<string, Groesse>;
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
  /** Blick senkrecht von oben, passend zum aktuellen Aufbau. */
  draufsicht(werte: Werte): Ansicht;
  /** Erklärung zu einem angeklickten Punkt. */
  auswahl(werte: Werte, punkt: Punkt): AuswahlInhalt;
  /** Eine Tour je Phase (Welle, Quanten, Elektronen), in Lernreihenfolge. */
  touren: Tour[];
}
