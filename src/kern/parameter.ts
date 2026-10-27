// Zentraler Parameterspeicher: EINE Stelle für alle Werte. Bild, Formel und Text hängen als
// Beobachter daran — dadurch ändern sie sich garantiert im selben Moment.

import type { ParameterDef } from './experiment';

export type Werte = Readonly<Record<string, number>>;
type Beobachter = (werte: Werte, geaendert: string | null) => void;

export class Parameter {
  private werte: Record<string, number> = {};
  private defs = new Map<string, ParameterDef>();
  private beobachter: Beobachter[] = [];

  constructor(defs: ParameterDef[]) {
    for (const def of defs) {
      this.defs.set(def.schluessel, def);
      this.werte[def.schluessel] = def.start;
    }
  }

  get alle(): Werte {
    return this.werte;
  }

  def(schluessel: string): ParameterDef {
    const def = this.defs.get(schluessel);
    // Unbekannter Schlüssel ist ein Fehler, kein Achselzucken (Regel 8).
    if (!def) throw new Error(`Unbekannter Parameter: ${schluessel}`);
    return def;
  }

  setze(schluessel: string, wert: number): void {
    const def = this.def(schluessel);
    const begrenzt = Math.min(def.max, Math.max(def.min, wert));
    if (this.werte[schluessel] === begrenzt) return;
    this.werte = { ...this.werte, [schluessel]: begrenzt };
    for (const f of this.beobachter) f(this.werte, schluessel);
  }

  /** Beobachter wird sofort einmal mit dem aktuellen Stand aufgerufen. */
  beobachte(f: Beobachter): void {
    this.beobachter.push(f);
    f(this.werte, null);
  }
}
