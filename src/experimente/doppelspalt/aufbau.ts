// Parameter (Regler) → physikalischer Aufbau. Eigene Datei, damit index.ts und auswahl.ts
// beide darauf zugreifen können, ohne sich gegenseitig zu importieren.

import type { Werte } from '../../kern/parameter';
import { type Aufbau, standardAufbau } from './physik';

export function aufbauAus(werte: Werte): Aufbau {
  return {
    wellenlaenge: werte.lambda,
    spaltabstand: werte.d,
    spaltbreite: werte.b,
    schirmabstand: werte.L,
    quellenJeSpalt: standardAufbau.quellenJeSpalt,
  };
}
