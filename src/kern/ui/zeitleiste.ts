// Knöpfe für Pause / Zeitlupe / Normal. Leertaste schaltet Pause um.

import type { Tempo, Zeit } from '../zeit';

const KNOEPFE: [Tempo, string][] = [
  ['pause', '⏸ Pause'],
  ['zeitlupe', '🐢 Zeitlupe'],
  ['normal', '▶ Normal'],
];

export function zeitleiste(zeit: Zeit): HTMLElement {
  const leiste = document.createElement('div');
  leiste.className = 'zeitleiste';
  const knoepfe = new Map<Tempo, HTMLButtonElement>();
  for (const [tempo, text] of KNOEPFE) {
    const knopf = document.createElement('button');
    knopf.textContent = text;
    knopf.addEventListener('click', () => zeit.setze(tempo));
    knoepfe.set(tempo, knopf);
    leiste.appendChild(knopf);
  }
  const markiere = (aktiv: Tempo) => {
    for (const [tempo, knopf] of knoepfe) knopf.classList.toggle('aktiv', tempo === aktiv);
  };
  zeit.beobachte(markiere);
  markiere(zeit.tempo);

  let vorPause: Tempo = 'normal';
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    if (zeit.tempo === 'pause') zeit.setze(vorPause);
    else {
      vorPause = zeit.tempo;
      zeit.setze('pause');
    }
  });
  return leiste;
}
