// Flüssige Kamerafahrten zwischen Ansichten.
// Gefahren wird auf einer Kugel um den Blickpunkt (Abstand und Winkel werden überblendet,
// nicht die Position geradlinig) — so schwenkt die Kamera um das Experiment herum, statt
// mitten hindurch zu fahren.

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Ansicht } from './tour';

const DAUER_MS = 1600;
const SICHTFELD = 45; // Grad, wenn eine Ansicht nichts anderes sagt

/** Langsam anfahren, langsam abbremsen. */
function sanft(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class Kamerafahrt {
  private von?: { ziel: THREE.Vector3; kugel: THREE.Spherical; sichtfeld: number };
  private nach?: { ziel: THREE.Vector3; kugel: THREE.Spherical; sichtfeld: number };
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
    const sichtfeld = ansicht.sichtfeld ?? SICHTFELD;
    if (sofort) {
      this.setze(ziel, kugel, sichtfeld);
      this.nach = undefined;
      return;
    }
    const jetzigesZiel = this.steuerung.target.clone();
    this.von = {
      ziel: jetzigesZiel,
      kugel: new THREE.Spherical().setFromVector3(this.kamera.position.clone().sub(jetzigesZiel)),
      sichtfeld: this.kamera.fov,
    };
    // Kürzester Weg um die Hochachse, sonst dreht die Kamera manchmal fast einmal ganz herum.
    let dTheta = kugel.theta - this.von.kugel.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    kugel.theta = this.von.kugel.theta + dTheta;
    this.nach = { ziel, kugel, sichtfeld };
    this.start = performance.now();
  }

  /** Laufende Fahrt sofort beenden und am Ziel stehen (für Bildschirmfotos). */
  sofortAmZiel(): void {
    if (!this.nach) return;
    this.setze(this.nach.ziel, this.nach.kugel, this.nach.sichtfeld);
    this.nach = undefined;
  }

  /** In jedem Bild aufrufen. */
  aktualisiere(): void {
    if (!this.nach || !this.von) return;
    const t = Math.min(1, (performance.now() - this.start) / DAUER_MS);
    const s = sanft(t);
    const ziel = this.von.ziel.clone().lerp(this.nach.ziel, s);
    // Abstand und Öffnungswinkel zusammen überblenden: Was im Bild ist, bleibt etwa gleich
    // groß, während die Perspektive dazukommt oder verschwindet.
    // Überblendet wird die sichtbare Bildhöhe (Abstand · tan(Winkel/2)), nicht der Abstand.
    const sichtfeld = THREE.MathUtils.lerp(this.von.sichtfeld, this.nach.sichtfeld, s);
    const halb = (grad: number) => Math.tan(THREE.MathUtils.degToRad(grad) / 2);
    const hoehe = THREE.MathUtils.lerp(
      this.von.kugel.radius * halb(this.von.sichtfeld),
      this.nach.kugel.radius * halb(this.nach.sichtfeld),
      s,
    );
    const kugel = new THREE.Spherical(
      hoehe / halb(sichtfeld),
      THREE.MathUtils.lerp(this.von.kugel.phi, this.nach.kugel.phi, s),
      THREE.MathUtils.lerp(this.von.kugel.theta, this.nach.kugel.theta, s),
    );
    this.setze(ziel, kugel, sichtfeld);
    if (t >= 1) this.nach = undefined;
  }

  private setze(ziel: THREE.Vector3, kugel: THREE.Spherical, sichtfeld: number): void {
    if (this.kamera.fov !== sichtfeld) {
      this.kamera.fov = sichtfeld;
      this.kamera.updateProjectionMatrix();
    }
    this.steuerung.target.copy(ziel);
    this.kamera.position.copy(ziel).add(new THREE.Vector3().setFromSpherical(kugel));
    this.steuerung.update();
  }
}
