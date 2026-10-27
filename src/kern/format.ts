// Werte für Text und Formeln aufbereiten und in Vorlagen einsetzen.
// Platzhalter sind [[name]] statt {name}, weil geschweifte Klammern in TeX-Formeln schon
// eine Bedeutung haben.

import type { Groesse } from './experiment';

function zahl(g: Groesse): string {
  return (g.wert / g.einheit.faktor).toFixed(g.einheit.stellen);
}

/** "0,10 mm"; reine Zahlen (leeres Zeichen) ohne Leerzeichen dahinter. */
export function alsText(g: Groesse): string {
  const z = zahl(g).replace('.', ',');
  return g.einheit.zeichen ? `${z} ${g.einheit.zeichen}` : z;
}

/** "0{,}10\,\mathrm{mm}" — {,} verhindert, dass TeX nach dem Komma eine Lücke setzt. */
export function alsTex(g: Groesse): string {
  const { zeichen, tex } = g.einheit;
  let einheit = '';
  if (tex !== undefined) einheit = tex;
  else if (zeichen === '°') einheit = '^\\circ';
  else if (zeichen) einheit = `\\,\\mathrm{${zeichen}}`;
  return `${zahl(g).replace('.', '{,}')}${einheit}`;
}

const PLATZHALTER = /\[\[(\w+)\]\]/g;

export function setzeEin(
  vorlage: string,
  groessen: Record<string, Groesse>,
  format: (g: Groesse, name: string) => string,
): string {
  return vorlage.replace(PLATZHALTER, (_, name: string) => {
    const g = groessen[name];
    // Laut scheitern: ein Tippfehler im Platzhalter soll auffallen, nicht leer bleiben.
    if (!g) throw new Error(`Unbekannter Platzhalter [[${name}]]`);
    return format(g, name);
  });
}
