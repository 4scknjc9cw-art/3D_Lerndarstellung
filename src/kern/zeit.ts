// Simulationszeit, getrennt von der Uhrzeit: Pause und Zeitlupe verlangsamen nur die
// Animation. Ergebnisse wie das Schirmbild hängen nie von dieser Zeit ab.

export type Tempo = 'normal' | 'zeitlupe' | 'pause';

const FAKTOR: Record<Tempo, number> = { normal: 1, zeitlupe: 0.15, pause: 0 };

export class Zeit {
  tempo: Tempo = 'normal';
  /** Sekunden Simulationszeit seit dem Start. */
  sekunden = 0;
  private beiAenderung: ((tempo: Tempo) => void)[] = [];

  weiter(echteSekunden: number): void {
    // Nach einem Tab-Wechsel kommt ein riesiger Zeitsprung an — kappen, sonst springt die Welle.
    this.sekunden += Math.min(echteSekunden, 0.1) * FAKTOR[this.tempo];
  }

  setze(tempo: Tempo): void {
    this.tempo = tempo;
    for (const f of this.beiAenderung) f(tempo);
  }

  beobachte(f: (tempo: Tempo) => void): void {
    this.beiAenderung.push(f);
  }
}
