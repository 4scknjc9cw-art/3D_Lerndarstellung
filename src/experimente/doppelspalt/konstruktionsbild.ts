// Zeichnet das Gangunterschied-Dreieck (konstruktion.ts) in die Szene: beide Wege, die
// abgetragene Länge des kurzen Wegs, Δs in Orange, Winkel θ und Beschriftungen.
// Gezeichnet wird im Bildmaßstab, beschriftet mit ECHTEN Werten (Kurt, 27.10.2026: Zahlen
// dazu, wie lang etwas ist und unter welchem Winkel es steht — das macht es verständlicher).

import * as THREE from 'three';
import type { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import type { Einheit } from '../../kern/experiment';
import { alsText } from '../../kern/format';
import { beschriftung, Hinweisstriche, type Ort } from './beschriftung';
import { echteGroessen, type Konstruktion, type Punkt2 } from './konstruktion';
import type { Aufbau } from './physik';

// Knapp über den höchsten Wellenbergen (uHoehe = 0,22), damit die Linien nie eintauchen.
const HOEHE = 0.4;
const AKZENT = 0xff8c2e; // = --akzent in index.html
const WEG = 0xe8e6e3;

const NM: Einheit = { zeichen: 'nm', faktor: 1e-9, stellen: 0 };
const MM2: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 2 };
// Die beiden Wege unterscheiden sich erst in der 4. Nachkommastelle (in mm) — darum 5 Stellen.
const MM5: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 5 };
const M2: Einheit = { zeichen: 'm', faktor: 1, stellen: 2 };
const GRAD: Einheit = { zeichen: '°', faktor: Math.PI / 180, stellen: 2 };

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

/** Bogen um einen Mittelpunkt von Winkel a bis b (kürzester Weg). */
function bogen(mitte: Punkt2, r: number, a: number, b: number): Punkt2[] {
  const db = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return Array.from({ length: 25 }, (_, i) => {
    const w = a + (db * i) / 24;
    return { x: mitte.x + r * Math.cos(w), y: mitte.y + r * Math.sin(w) };
  });
}

export class KonstruktionsBild {
  readonly gruppe = new THREE.Group();
  private wegNah = linie(WEG, 0.05);
  private wegFern = linie(WEG, 0.05);
  private abgetragen = linie(0x9a958d, 0.04, true);
  private deltaS = linie(AKZENT, 0.11);
  private achse = linie(0x6d6a65, 0.03, true);
  private schirmStrecke = linie(0x6d6a65, 0.03, true);
  /** Blendenmitte → P: zweiter Schenkel von θ und Hypotenuse des großen Dreiecks (L, x). */
  private mittelLinie = linie(0x9a958d, 0.025, true);
  private bogen = linie(AKZENT, 0.04);
  private bogenKlein = linie(AKZENT, 0.035);
  /** Maßklammer für d vor der Blende, von Spaltmitte zu Spaltmitte. */
  private dKlammer = linie(WEG, 0.03);
  private striche = new Hinweisstriche();
  private marke = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 20, 12),
    new THREE.MeshBasicMaterial({ color: AKZENT, depthTest: false }),
  );
  /** Alles außer den beiden Wegen und der Marke — fällt bei einem „einfachen" Punkt weg. */
  private dreieck = new THREE.Group();
  private etiketten = {
    ds: beschriftung('akzent'),
    theta: beschriftung('akzent'),
    thetaKlein: beschriftung('akzent'),
    d: beschriftung(),
    p: beschriftung(),
    sNah: beschriftung(),
    sFern: beschriftung(),
    L: beschriftung(),
    x: beschriftung(),
  };
  /** Was gerade gezeigt werden soll — die CSS-Beschriftungen brauchen das einzeln. */
  private sichtbar = new Set<CSS2DObject>();
  private an = false;

  constructor() {
    this.dreieck.add(
      this.abgetragen,
      this.deltaS,
      this.achse,
      this.schirmStrecke,
      this.mittelLinie,
      this.bogen,
      this.bogenKlein,
      this.dKlammer,
      this.striche.linien,
    );
    this.gruppe.add(this.wegNah, this.wegFern, this.marke, this.dreieck, ...Object.values(this.etiketten));
    this.marke.renderOrder = 11;
    this.zeige(false);
  }

  zeige(an: boolean): void {
    this.an = an;
    this.gruppe.visible = an;
    // CSS-Beschriftungen folgen der Sichtbarkeit der Gruppe nicht von selbst.
    for (const e of Object.values(this.etiketten)) e.visible = an && this.sichtbar.has(e);
  }

  /**
   * @param aufSchirm nur dann gibt es echte Weglängen, L und x (im Wellenfeld hat ein Bildpunkt
   *   keinen eindeutigen echten Ort, nur einen Gangunterschied)
   * @param einfach nur Wege und Marke — für Teile vor der Erklärung des Gangunterschieds
   */
  zeichne(k: Konstruktion, bild: Aufbau, echt: Aufbau, aufSchirm: boolean, einfach: boolean): void {
    const v = (p: Punkt2): [number, number, number] => [p.x, HOEHE, p.y];
    const setze = (l: Line2, punkte: Punkt2[]) => {
      l.geometry.dispose();
      l.geometry = new LineGeometry().setPositions(punkte.flatMap(v));
      l.computeLineDistances();
    };
    const e = this.etiketten;
    // Steht eine Beschriftung abseits, zeigt ein dünner Strich auf das, was sie meint.
    const striche: [Ort, Ort][] = [];
    const text = (o: CSS2DObject, t: string, p: Punkt2, ziel?: Punkt2) => {
      o.element.textContent = t;
      o.position.set(...v(p));
      this.sichtbar.add(o);
      if (ziel) striche.push([v(p), v(ziel)]);
    };
    this.sichtbar.clear();

    setze(this.wegNah, [k.nah, k.ziel]);
    setze(this.wegFern, [k.fern, k.ziel]);
    this.marke.position.set(...v(k.ziel));
    this.dreieck.visible = !einfach;
    if (einfach) {
      this.zeige(this.an);
      return;
    }

    const q = k.gangunterschied / bild.wellenlaenge;
    const g = echteGroessen(echt, q);
    const seite = k.ziel.y >= 0 ? 1 : -1; // auf welcher Seite der Achse P liegt
    const mitWinkel = Math.abs(k.winkel) >= 0.02; // bei θ ≈ 0 gibt es nichts zu beschriften
    const L = bild.schirmabstand;

    setze(this.abgetragen, [k.nah, k.q]);
    setze(this.deltaS, [k.fern, k.q]);

    // Symmetrieachse (= Strecke L, wenn P auf dem Schirm liegt) und Winkelbogen θ an der Blende.
    // Die Winkel sind auch im Bild klein (≈ 7°) — darum große Bögen, sonst sieht man sie nicht.
    const r = Math.min(2.2, Math.hypot(k.ziel.x, k.ziel.y) * 0.4);
    setze(this.achse, [{ x: 0, y: 0 }, { x: aufSchirm ? L : Math.max(3, r * 2), y: 0 }]);
    setze(this.bogen, bogen({ x: 0, y: 0 }, r, 0, k.winkel));
    setze(this.mittelLinie, [{ x: 0, y: 0 }, k.ziel]);
    // Derselbe Winkel θ noch einmal im kleinen Dreieck am nahen Spalt: zwischen der Blende
    // (Richtung zum fernen Spalt) und der Linie zu Q, die senkrecht auf dem Weg steht.
    const rk = Math.min(1.6, Math.hypot(k.q.x - k.nah.x, k.q.y - k.nah.y) * 0.55);
    const zuFern = Math.atan2(k.fern.y - k.nah.y, k.fern.x - k.nah.x);
    const zuQ = Math.atan2(k.q.y - k.nah.y, k.q.x - k.nah.x);
    setze(this.bogenKlein, bogen(k.nah, rk, zuFern, zuQ));
    this.bogen.visible = this.bogenKlein.visible = this.mittelLinie.visible = mitWinkel;

    text(e.p, 'P', { x: k.ziel.x - 0.3, y: k.ziel.y + 0.6 * seite });
    // d: Klammer vor der Blende von Spaltmitte zu Spaltmitte, Beschriftung links daneben.
    const xd = -0.55;
    setze(this.dKlammer, [
      { x: xd + 0.2, y: k.nah.y }, { x: xd, y: k.nah.y }, { x: xd, y: k.fern.y }, { x: xd + 0.2, y: k.fern.y },
    ]);
    text(e.d, `d = ${alsText({ wert: echt.spaltabstand, einheit: MM2 })}`, { x: -2.1, y: 0 }, { x: xd, y: 0 });
    if (mitWinkel) {
      const ds = `Δs = ${alsText({ wert: g.ds, einheit: NM })}`;
      const mitteDs = { x: (k.fern.x + k.q.x) / 2, y: (k.fern.y + k.q.y) / 2 };
      text(e.ds, ds, { x: mitteDs.x - 2.0, y: mitteDs.y }, mitteDs);
      const theta = `θ = ${alsText({ wert: g.theta, einheit: GRAD })}`;
      const bogenMitte = { x: r * Math.cos(k.winkel / 2), y: r * Math.sin(k.winkel / 2) };
      text(e.theta, theta, { x: r + 1.1, y: bogenMitte.y - 0.7 * seite }, bogenMitte);
      const wk = zuFern + Math.atan2(Math.sin(zuQ - zuFern), Math.cos(zuQ - zuFern)) / 2;
      const kleinMitte = { x: k.nah.x + rk * Math.cos(wk), y: k.nah.y + rk * Math.sin(wk) };
      text(e.thetaKlein, 'θ', { x: kleinMitte.x + 0.7, y: kleinMitte.y }, kleinMitte);
    }

    this.schirmStrecke.visible = aufSchirm && mitWinkel;
    if (aufSchirm) {
      // Die echten Weglängen: s₁ vom näheren, s₂ vom ferneren Spalt. Beschriftet etwa in der
      // Mitte des Wegs, nach außen versetzt, damit sie sich nicht überdecken.
      const amWeg = (von: Punkt2): Punkt2 => ({
        x: von.x + (k.ziel.x - von.x) * 0.45,
        y: von.y + (k.ziel.y - von.y) * 0.45,
      });
      const aussen = (p: Punkt2, richtung: number): Punkt2 => ({ x: p.x, y: p.y + 0.7 * richtung });
      const aussenNah = Math.sign(k.nah.y - k.fern.y);
      const an1 = amWeg(k.nah);
      const an2 = amWeg(k.fern);
      text(e.sNah, `s₁ = ${alsText({ wert: g.wegNah, einheit: MM5 })}`, aussen(an1, aussenNah), an1);
      text(e.sFern, `s₂ = ${alsText({ wert: g.wegFern, einheit: MM5 })}`, aussen(an2, -aussenNah), an2);
      const anL = { x: L * 0.85, y: 0 };
      text(e.L, `L = ${alsText({ wert: echt.schirmabstand, einheit: M2 })}`, aussen(anL, -seite), anL);
      if (mitWinkel) {
        setze(this.schirmStrecke, [{ x: L, y: 0 }, k.ziel]);
        const anX = { x: L, y: k.ziel.y / 2 };
        text(e.x, `x = ${alsText({ wert: g.x, einheit: MM2 })}`, { x: L + 1.7, y: anX.y }, anX);
      }
    }
    this.striche.setze(striche);
    this.zeige(this.an);
  }
}
