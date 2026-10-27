// Tour-Maschine: spielt Schritte ab, die reine Daten sind. Ohne DOM, damit sie testbar ist.
//
// Ein Schritt besteht aus Teilen (Kurt, 27.10.2026): wird innerhalb eines Schritts etwas
// erklärt, das eine andere Ansicht braucht, fährt die Kamera beim nächsten Teil dorthin.
// „Weiter" geht erst durch die Teile, dann zum nächsten Schritt.
//
// Werte: Beim Betreten eines Schritts werden ALLE Parameter auf Start + Startwerte des
// Schritts + Werte der Teile bis hierher gesetzt — so sieht ein Teil immer gleich aus, egal
// woher man kommt. Innerhalb eines Schritts bleiben selbst verstellte Regler stehen, außer
// der nächste Teil bringt eigene Werte mit.

import type { Punkt } from './experiment';
import type { Parameter, Werte } from './parameter';
import type { Tempo } from './zeit';

/** Kameraposition und Blickpunkt in Szenen-Koordinaten. */
export interface Ansicht {
  position: [number, number, number];
  ziel: [number, number, number];
}

export interface TourTeil {
  /** Text mit Platzhaltern [[name]]; Leerzeile = neuer Absatz. */
  text: string;
  formeln?: string[];
  /** Wohin die Kamera fährt. 'draufsicht' = von oben, passend zum aktuellen Aufbau. */
  kamera: Ansicht | 'draufsicht';
  /** Welche Szenenteile sichtbar sind; fehlt es, ist alles sichtbar. */
  sichtbar?: string[];
  /** Hilfen im Bild (z. B. λ-Maß, Ordnungen); fehlt es, keine. */
  hilfen?: string[];
  /** Ob der Umschalter 3D/Draufsicht erscheint. */
  umschalter?: boolean;
  /** Ein Punkt, der für die Erklärung schon angeklickt ist. */
  auswahl?: Punkt;
  /** Werte, die dieser Teil setzt (zusätzlich zu den Startwerten des Schritts). */
  werte?: Partial<Werte>;
  /** Tempo der Animation in diesem Teil; fehlt es, läuft sie normal. */
  tempo?: Tempo;
}

export interface TourSchritt {
  titel: string;
  /** Diese Regler darf man im ganzen Schritt selbst verstellen. */
  freieRegler?: string[];
  startwerte?: Partial<Werte>;
  teile: TourTeil[];
}

export interface Tour {
  titel: string;
  schritte: TourSchritt[];
}

export interface Stelle {
  schritt: number;
  teil: number;
}

export class TourSpieler {
  private stelle: Stelle = { schritt: 0, teil: 0 };
  private betreten = -1; // zuletzt betretener Schritt
  private beobachter: ((schritt: TourSchritt, stelle: Stelle) => void)[] = [];

  constructor(
    readonly tour: Tour,
    private parameter: Parameter,
    private startwerte: Werte,
  ) {
    // Laut scheitern: ein Tippfehler in einem Schritt fällt beim Laden auf, nicht beim Klicken.
    for (const s of tour.schritte) {
      if (s.teile.length === 0) throw new Error(`Schritt „${s.titel}" hat keine Teile`);
      const namen = [
        ...(s.freieRegler ?? []),
        ...Object.keys(s.startwerte ?? {}),
        ...s.teile.flatMap((t) => Object.keys(t.werte ?? {})),
      ];
      for (const name of namen) parameter.def(name);
    }
  }

  get aktuell(): Stelle {
    return { ...this.stelle };
  }

  get anzahl(): number {
    return this.tour.schritte.length;
  }

  gehe(schritt: number, teil = 0): void {
    const s = Math.max(0, Math.min(this.anzahl - 1, schritt));
    const daten = this.tour.schritte[s];
    const t = Math.max(0, Math.min(daten.teile.length - 1, teil));
    this.stelle = { schritt: s, teil: t };

    if (s !== this.betreten || daten.teile[t].werte) {
      const werte: Record<string, number | undefined> = { ...this.startwerte, ...daten.startwerte };
      for (const vorher of daten.teile.slice(0, t + 1)) Object.assign(werte, vorher.werte);
      for (const [name, wert] of Object.entries(werte)) {
        if (wert !== undefined) this.parameter.setze(name, wert);
      }
      this.betreten = s;
    }
    for (const f of this.beobachter) f(daten, this.aktuell);
  }

  weiter(): void {
    const { schritt, teil } = this.stelle;
    if (teil < this.tour.schritte[schritt].teile.length - 1) this.gehe(schritt, teil + 1);
    else if (schritt < this.anzahl - 1) this.gehe(schritt + 1, 0);
  }

  zurueck(): void {
    const { schritt, teil } = this.stelle;
    if (teil > 0) this.gehe(schritt, teil - 1);
    else if (schritt > 0) this.gehe(schritt - 1, this.tour.schritte[schritt - 1].teile.length - 1);
  }

  get amAnfang(): boolean {
    return this.stelle.schritt === 0 && this.stelle.teil === 0;
  }

  get amEnde(): boolean {
    const { schritt, teil } = this.stelle;
    return schritt === this.anzahl - 1 && teil === this.tour.schritte[schritt].teile.length - 1;
  }

  beobachte(f: (schritt: TourSchritt, stelle: Stelle) => void): void {
    this.beobachter.push(f);
  }
}
