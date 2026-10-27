// Ein Schieberegler je Parameter. Angezeigt wird in der Einheit des Parameters (nm, mm),
// gespeichert wird immer in SI-Einheiten (m).

import type { ParameterDef } from '../experiment';
import { alsText } from '../format';
import type { Parameter } from '../parameter';

export function reglerListe(parameter: Parameter, defs: ParameterDef[]): HTMLElement {
  const liste = document.createElement('div');
  liste.className = 'regler-liste';

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
    liste.appendChild(zeile);

    parameter.beobachte((werte) => {
      const v = werte[def.schluessel];
      wert.textContent = alsText({ wert: v, einheit: def.einheit });
      // Nur setzen, wenn nötig — sonst springt der Schieber beim Ziehen durch Rundung.
      if (Math.abs(Number(schieber.value) * f - v) > def.schritt / 2) schieber.value = String(v / f);
    });
  }
  return liste;
}
