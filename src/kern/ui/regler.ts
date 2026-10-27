// Ein Schieberegler je Parameter. Angezeigt wird in der Einheit des Parameters (nm, mm),
// gespeichert wird immer in SI-Einheiten (m). In der Tour sind nur die Regler sichtbar, die
// im jeweiligen Schritt den Unterschied machen.

import type { ParameterDef } from '../experiment';
import { alsText } from '../format';
import type { Parameter } from '../parameter';

export class ReglerListe {
  readonly element = document.createElement('div');
  private zeilen = new Map<string, HTMLElement>();

  constructor(parameter: Parameter, defs: ParameterDef[]) {
    this.element.className = 'regler-liste';
    for (const def of defs) {
      const f = def.einheit.faktor;
      const zeile = document.createElement('label');
      zeile.className = 'regler';
      const kopf = document.createElement('div');
      kopf.className = 'regler-kopf';
      const name = document.createElement('span');
      name.textContent = def.name;
      const wert = document.createElement('span');
      wert.className = 'regler-wert';
      kopf.append(name, wert);

      const schieber = document.createElement('input');
      schieber.type = 'range';
      schieber.min = String(def.min / f);
      schieber.max = String(def.max / f);
      schieber.step = String(def.schritt / f);
      schieber.addEventListener('input', () => {
        parameter.setze(def.schluessel, Number(schieber.value) * f);
      });

      zeile.append(kopf, schieber);
      this.element.appendChild(zeile);
      this.zeilen.set(def.schluessel, zeile);

      parameter.beobachte((werte) => {
        const v = werte[def.schluessel];
        wert.textContent = alsText({ wert: v, einheit: def.einheit });
        // Nur setzen, wenn nötig — sonst springt der Schieber beim Ziehen durch Rundung.
        if (Math.abs(Number(schieber.value) * f - v) > def.schritt / 2) {
          schieber.value = String(v / f);
        }
      });
    }
  }

  /** null = alle zeigen. Gibt zurück, ob überhaupt ein Regler sichtbar ist. */
  zeigeNur(namen: string[] | null): boolean {
    let irgendeiner = false;
    for (const [name, zeile] of this.zeilen) {
      const sichtbar = namen === null || namen.includes(name);
      zeile.hidden = !sichtbar;
      irgendeiner ||= sichtbar;
    }
    return irgendeiner;
  }
}
