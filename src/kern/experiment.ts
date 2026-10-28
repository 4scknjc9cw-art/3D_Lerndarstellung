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
  /**
   * Nur markieren und die Wege zeigen — ohne Dreieck, Zahlen und Erklärkasten. Für Tour-Teile,
   * die vor der Erklärung des Gangunterschieds liegen (Formeln erst nach der Herleitung).
   */
  einfach?: boolean;
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
  /**
   * Blick senkrecht von oben, passend zum aktuellen Aufbau. Mit Punkt so gerahmt, dass das
   * ganze Dreieck von der Blende bis zum Punkt zu sehen ist (Kurt, 27.10.2026).
   */
  draufsicht(werte: Werte, punkt?: Punkt | null): Ansicht;
  /**
   * Punkt auf dem Schirm an einem hellen oder dunklen Streifen. schritt 0 = der nächstgelegene
   * (zum Einrasten nach einem Klick), ±1 = zum nächsten Streifen in ±z-Richtung (Maximum →
   * Minimum → Maximum …). Ohne Punkt beginnt es in der Mitte. null = hier gibt es keine Streifen.
   */
  streifen(werte: Werte, punkt: Punkt | null, schritt: -1 | 0 | 1): Punkt | null;
  /** Erklärung zu einem angeklickten Punkt. */
  auswahl(werte: Werte, punkt: Punkt): AuswahlInhalt;
  /** Eine Tour je Phase (Welle, Quanten, Elektronen), in Lernreihenfolge. */
  touren: Tour[];
}
