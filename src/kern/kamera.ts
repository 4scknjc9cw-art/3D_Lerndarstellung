// Flüssige Kamerafahrten zwischen Ansichten.
// Gefahren wird auf einer Kugel um den Blickpunkt (Abstand und Winkel werden überblendet,
// nicht die Position geradlinig) — so schwenkt die Kamera um das Experiment herum, statt
// mitten hindurch zu fahren.

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Ansicht } from './tour';

const DAUER_MS = 1600;

/** Langsam anfahren, langsam abbremsen. */
function sanft(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class Kamerafahrt {
  private von?: { ziel: THREE.Vector3; kugel: THREE.Spherical };
  private nach?: { ziel: THREE.Vector3; kugel: THREE.Spherical };
  private start = 0;

  constructor(
    private kamera: THREE.PerspectiveCamera,
    private steuerung: OrbitControls,
  ) {
    // Greift man selbst zur Maus, hat das Vorrang vor der Fahrt.
    steuerung.addEventListener('start', () => (this.nach = undefined));
  }

  fahre(ansicht: Ansicht, sofort = false): void {
    const ziel = new THREE.Vector3(...ansicht.ziel);
    const kugel = new THREE.Spherical().setFromVector3(
      new THREE.Vector3(...ansicht.position).sub(ziel),
    );
    if (sofort) {
      this.setze(ziel, kugel);
      this.nach = undefined;
      return;
    }
    const jetzigesZiel = this.steuerung.target.clone();
    this.von = {
      ziel: jetzigesZiel,
      kugel: new THREE.Spherical().setFromVector3(this.kamera.position.clone().sub(jetzigesZiel)),
    };
    // Kürzester Weg um die Hochachse, sonst dreht die Kamera manchmal fast einmal ganz herum.
    let dTheta = kugel.theta - this.von.kugel.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    kugel.theta = this.von.kugel.theta + dTheta;
    this.nach = { ziel, kugel };
    this.start = performance.now();
  }

  /** Laufende Fahrt sofort beenden und am Ziel stehen (für Bildschirmfotos). */
  sofortAmZiel(): void {
    if (!this.nach) return;
    this.setze(this.nach.ziel, this.nach.kugel);
    this.nach = undefined;
  }

  /** In jedem Bild aufrufen. */
  aktualisiere(): void {
    if (!this.nach || !this.von) return;
    const t = Math.min(1, (performance.now() - this.start) / DAUER_MS);
    const s = sanft(t);
    const ziel = this.von.ziel.clone().lerp(this.nach.ziel, s);
    const kugel = new THREE.Spherical(
      THREE.MathUtils.lerp(this.von.kugel.radius, this.nach.kugel.radius, s),
      THREE.MathUtils.lerp(this.von.kugel.phi, this.nach.kugel.phi, s),
      THREE.MathUtils.lerp(this.von.kugel.theta, this.nach.kugel.theta, s),
    );
    this.setze(ziel, kugel);
    if (t >= 1) this.nach = undefined;
  }

  private setze(ziel: THREE.Vector3, kugel: THREE.Spherical): void {
    this.steuerung.target.copy(ziel);
    this.kamera.position.copy(ziel).add(new THREE.Vector3().setFromSpherical(kugel));
    this.steuerung.update();
  }
}
