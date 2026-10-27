// Hilfen im Bild, die nur Tour-Teile einblenden: ein λ-Maß zwischen zwei Wellenbergen und
// die Ordnungen m an den hellen Streifen des Schirms. Gezeichnet im Bildmaßstab.

import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { type Aufbau, gangunterschied } from './physik';

const AKZENT = 0xff8c2e; // = --akzent in index.html

function beschriftung(text: string): CSS2DObject {
  const el = document.createElement('div');
  el.className = 'beschriftung akzent';
  el.textContent = text;
  return new CSS2DObject(el);
}

/**
 * Klammer über genau einer Wellenlänge der einfallenden Welle. Sie läuft mit einem Wellenberg
 * mit, damit man sieht: von Berg zu Berg ist es λ.
 */
export class LambdaMass {
  readonly gruppe = new THREE.Group();
  private linie = new Line2(
    new LineGeometry(),
    new LineMaterial({ color: AKZENT, linewidth: 0.035, worldUnits: true, depthTest: false }),
  );
  private etikett = beschriftung('λ');
  private wellenlaenge = 1;

  // Bereich, in dem der linke Berg der Klammer gehalten wird, und Lage quer zur Welle.
  static readonly START = -3.4;
  static readonly Z = 2.5;
  private static readonly HOEHE = 0.34; // knapp über den Bergen (Höhe ≈ 0,19)

  constructor() {
    this.linie.renderOrder = 10;
    this.gruppe.add(this.linie, this.etikett);
    this.zeige(false);
  }

  setzeWellenlaenge(lambda: number): void {
    this.wellenlaenge = lambda;
    const h = LambdaMass.HOEHE;
    // Waagerechter Strich mit zwei Endhaken nach unten zu den Bergspitzen.
    this.linie.geometry.dispose();
    this.linie.geometry = new LineGeometry().setPositions([
      0, h - 0.12, 0, 0, h, 0, lambda, h, 0, lambda, h - 0.12, 0,
    ]);
    this.etikett.position.set(lambda / 2, h + 0.18, 0);
  }

  /** Die einfallende Welle hat Berge bei k·x − Phase = 2πn → x = (Phase + 2πn)/k. */
  folge(phase: number): void {
    const lambda = this.wellenlaenge;
    const ersterBerg = (phase / (2 * Math.PI)) * lambda;
    const versatz = (((ersterBerg - LambdaMass.START) % lambda) + lambda) % lambda;
    this.gruppe.position.set(LambdaMass.START + versatz, 0, LambdaMass.Z);
  }

  zeige(an: boolean): void {
    this.gruppe.visible = an;
    this.etikett.visible = an;
  }
}

/** Beschriftet die hellen Streifen am Bild-Schirm mit ihrer Ordnung m. */
export class Ordnungen {
  readonly gruppe = new THREE.Group();
  private etiketten: CSS2DObject[] = [];
  private an = false;

  /** Stelle z auf dem Bild-Schirm mit Gangunterschied m·λ (Bisektion; Δs wächst mit z). */
  static stelle(bild: Aufbau, m: number, halbeBreite: number): number | null {
    const ziel = Math.abs(m) * bild.wellenlaenge;
    if (gangunterschied(bild, halbeBreite) < ziel) return null; // liegt neben dem Schirm
    let lo = 0;
    let hi = halbeBreite;
    for (let i = 0; i < 60; i++) {
      const mitte = (lo + hi) / 2;
      if (gangunterschied(bild, mitte) < ziel) lo = mitte;
      else hi = mitte;
    }
    return Math.sign(m) * ((lo + hi) / 2);
  }

  setze(bild: Aufbau, halbeBreite: number, oberkante: number): void {
    for (const e of this.etiketten) this.gruppe.remove(e);
    this.etiketten = [];
    if (bild.spalte === 1) return;
    for (let m = -12; m <= 12; m++) {
      const z = Ordnungen.stelle(bild, m, halbeBreite);
      if (z === null) continue;
      const e = beschriftung(m === 0 ? 'm = 0' : String(m));
      e.position.set(bild.schirmabstand - 0.1, oberkante + 0.25, z);
      e.visible = this.an;
      this.etiketten.push(e);
      this.gruppe.add(e);
    }
  }

  zeige(an: boolean): void {
    this.an = an;
    this.gruppe.visible = an;
    for (const e of this.etiketten) e.visible = an;
  }
}
