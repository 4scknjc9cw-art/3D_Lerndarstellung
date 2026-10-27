// Der angeklickte Punkt — wie der Parameterspeicher eine einzige Stelle, an der Szene und
// Erklärfeld als Beobachter hängen.

import type { Punkt } from './experiment';

export class Auswahl {
  private punkt: Punkt | null = null;
  private beobachter: ((punkt: Punkt | null) => void)[] = [];

  get aktuell(): Punkt | null {
    return this.punkt;
  }

  setze(punkt: Punkt | null): void {
    this.punkt = punkt;
    for (const f of this.beobachter) f(punkt);
  }

  beobachte(f: (punkt: Punkt | null) => void): void {
    this.beobachter.push(f);
    f(this.punkt);
  }
}
