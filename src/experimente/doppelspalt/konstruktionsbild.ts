// Zeichnet das Gangunterschied-Dreieck (konstruktion.ts) in die Szene: beide Wege, die
// abgetragene Länge des kurzen Wegs, Δs in Orange, Winkel θ und Beschriftungen.
// Gezeichnet wird im Bildmaßstab; die Zahlen im Erklärfeld kommen aus dem echten Aufbau.

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { type Konstruktion, type Punkt2 } from './konstruktion';

// Knapp über den höchsten Wellenbergen (uHoehe = 0,22), damit die Linien nie eintauchen.
const HOEHE = 0.4;
const AKZENT = 0xff8c2e; // = --akzent in index.html
const WEG = 0xe8e6e3;

function linie(farbe: number, breite: number, gestrichelt = false): Line2 {
  const material = new LineMaterial({
    color: farbe,
    linewidth: breite, // in Szenen-Einheiten (worldUnits), dann braucht es keine Pixelangabe
    worldUnits: true,
    dashed: gestrichelt,
    dashSize: 0.18,
    gapSize: 0.12,
    // Das Dreieck liegt genau in der Spaltebene — ohne das verdeckt es die Blendenwand.
    depthTest: false,
  });
  const l = new Line2(new LineGeometry(), material);
  l.renderOrder = 10;
  return l;
}

function beschriftung(text: string, klasse = ''): CSS2DObject {
  const el = document.createElement('div');
  el.className = `beschriftung ${klasse}`;
  el.textContent = text;
  return new CSS2DObject(el);
}

export class KonstruktionsBild {
  readonly gruppe = new THREE.Group();
  private wegNah = linie(WEG, 0.05);
  private wegFern = linie(WEG, 0.05);
  private abgetragen = linie(0x9a958d, 0.04, true);
  private deltaS = linie(AKZENT, 0.11);
  private achse = linie(0x6d6a65, 0.03, true);
  private bogen = linie(AKZENT, 0.04);
  private marke = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 20, 12),
    new THREE.MeshBasicMaterial({ color: AKZENT, depthTest: false }),
  );
  private etiketten = {
    ds: beschriftung('Δs', 'akzent'),
    theta: beschriftung('θ', 'akzent'),
    d: beschriftung('d'),
    p: beschriftung('P'),
  };

  constructor() {
    this.gruppe.add(
      this.wegNah,
      this.wegFern,
      this.abgetragen,
      this.deltaS,
      this.achse,
      this.bogen,
      this.marke,
      ...Object.values(this.etiketten),
    );
    this.marke.renderOrder = 11;
    this.zeige(false);
  }

  zeige(an: boolean): void {
    this.gruppe.visible = an;
    // CSS-Beschriftungen folgen der Sichtbarkeit der Gruppe nicht von selbst.
    for (const e of Object.values(this.etiketten)) e.visible = an;
  }

  zeichne(k: Konstruktion): void {
    const v = (p: Punkt2) => [p.x, HOEHE, p.y];
    const setze = (l: Line2, punkte: Punkt2[]) => {
      l.geometry.dispose();
      l.geometry = new LineGeometry().setPositions(punkte.flatMap(v));
      l.computeLineDistances();
    };
    setze(this.wegNah, [k.nah, k.ziel]);
    setze(this.wegFern, [k.fern, k.ziel]);
    setze(this.abgetragen, [k.nah, k.q]);
    setze(this.deltaS, [k.fern, k.q]);

    // Symmetrieachse und Winkelbogen θ an der Blendenmitte.
    const r = Math.min(1.6, Math.hypot(k.ziel.x, k.ziel.y) * 0.4);
    setze(this.achse, [{ x: 0, y: 0 }, { x: Math.max(3, r * 2), y: 0 }]);
    const bogen: Punkt2[] = [];
    for (let i = 0; i <= 24; i++) {
      const w = (k.winkel * i) / 24;
      bogen.push({ x: r * Math.cos(w), y: r * Math.sin(w) });
    }
    setze(this.bogen, bogen);
    // Bei θ ≈ 0 gibt es keinen Bogen zu beschriften.
    this.etiketten.theta.element.hidden = Math.abs(k.winkel) < 0.02;

    this.marke.position.set(...(v(k.ziel) as [number, number, number]));
    const mitteDs = { x: (k.fern.x + k.q.x) / 2 - 0.35, y: (k.fern.y + k.q.y) / 2 };
    this.etiketten.ds.position.set(...(v(mitteDs) as [number, number, number]));
    const wMitte = k.winkel / 2;
    this.etiketten.theta.position.set(
      (r + 0.35) * Math.cos(wMitte),
      HOEHE,
      (r + 0.35) * Math.sin(wMitte),
    );
    this.etiketten.d.position.set(-0.45, HOEHE, 0);
    this.etiketten.p.position.set(k.ziel.x + 0.3, HOEHE, k.ziel.y - 0.3);
  }
}
