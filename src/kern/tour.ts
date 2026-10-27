// Tour-Maschine: spielt Schritte ab, die reine Daten sind. Ohne DOM, damit sie testbar ist.
// Jeder Schritt setzt beim Betreten ALLE Parameter auf Start + seine eigenen Startwerte —
// so sieht ein Schritt immer gleich aus, egal ob man vor- oder zurückspringt.

import type { Parameter, Werte } from './parameter';

/** Kameraposition und Blickpunkt in Szenen-Koordinaten. */
export interface Ansicht {
  position: [number, number, number];
  ziel: [number, number, number];
}

export interface TourSchritt {
  titel: string;
  kamera: Ansicht;
  /** Formeln (TeX) und Text, beide mit Platzhaltern [[name]]. */
  formeln?: string[];
  text: string;
  /** Diese Regler darf man in diesem Schritt selbst verstellen. */
  freieRegler?: string[];
  startwerte?: Partial<Werte>;
  /** Welche Szenenteile sichtbar sind; fehlt es, ist alles sichtbar. */
  sichtbar?: string[];
  /** Ob in diesem Schritt der Umschalter zur Draufsicht erscheint (Schritt 5). */
  draufsicht?: boolean;
}

export interface Tour {
  titel: string;
  schritte: TourSchritt[];
}

export class TourSpieler {
  private index = 0;
  private beobachter: ((schritt: TourSchritt, index: number) => void)[] = [];

  constructor(
    readonly tour: Tour,
    private parameter: Parameter,
    private startwerte: Werte,
  ) {
    // Laut scheitern: ein Tippfehler in einem Schritt fällt beim Laden auf, nicht beim Klicken.
    for (const s of tour.schritte) {
      for (const name of [...(s.freieRegler ?? []), ...Object.keys(s.startwerte ?? {})]) {
        parameter.def(name);
      }
    }
  }

  get aktuell(): number {
    return this.index;
  }

  get anzahl(): number {
    return this.tour.schritte.length;
  }

  gehe(index: number): void {
    this.index = Math.max(0, Math.min(this.anzahl - 1, index));
    const schritt = this.tour.schritte[this.index];
    const werte = { ...this.startwerte, ...schritt.startwerte };
    for (const [name, wert] of Object.entries(werte)) {
      if (wert !== undefined) this.parameter.setze(name, wert);
    }
    for (const f of this.beobachter) f(schritt, this.index);
  }

  weiter(): void {
    if (this.index < this.anzahl - 1) this.gehe(this.index + 1);
  }

  zurueck(): void {
    if (this.index > 0) this.gehe(this.index - 1);
  }

  beobachte(f: (schritt: TourSchritt, index: number) => void): void {
    this.beobachter.push(f);
  }
}
