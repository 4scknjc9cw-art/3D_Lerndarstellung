// Beschriftungen im Bild und dünne Hinweisstriche von der Beschriftung zu dem, was sie meint.
// Kurt (27.10.2026): Beschriftungen groß genug zum Lesen; steht eine deshalb etwas abseits,
// zeigt ein Strich, wozu sie gehört.

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export type Ort = [number, number, number];

/** Echtes HTML über dem Bild — darum gestochen scharf. klasse z. B. 'akzent' für Orange. */
export function beschriftung(klasse = ''): CSS2DObject {
  const el = document.createElement('div');
  el.className = `beschriftung ${klasse}`;
  return new CSS2DObject(el);
}

/** Eine Gruppe von Hinweisstrichen, jeder von einer Beschriftung zu ihrem Ziel. */
export class Hinweisstriche {
  readonly linien = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    // Ohne Tiefenprüfung: die Striche liegen über dem Wellenfeld wie die Beschriftungen.
    new THREE.LineBasicMaterial({ color: 0xc9c4bc, depthTest: false, transparent: true, opacity: 0.85 }),
  );

  constructor() {
    this.linien.renderOrder = 12;
  }

  /** Jedes Paar: [Ort der Beschriftung, Ort, auf den sie zeigt]. */
  setze(paare: [Ort, Ort][]): void {
    this.linien.geometry.dispose();
    this.linien.geometry = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute(paare.flat(2), 3),
    );
  }
}
