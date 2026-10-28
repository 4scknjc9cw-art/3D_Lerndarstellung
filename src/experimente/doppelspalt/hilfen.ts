// Hilfen im Bild, die nur Tour-Teile einblenden: ein λ-Maß zwischen zwei Wellenbergen, die
// Welle als Kurve von der Seite, Maße (b, d, L) und die Ordnungen m an den hellen Streifen.
// Gezeichnet im Bildmaßstab, beschriftet mit ECHTEN Werten (Kurt: überall Zahlen dazu).

import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import type { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Einheit } from '../../kern/experiment';
import { alsText } from '../../kern/format';
import { beschriftung as leer, Hinweisstriche } from './beschriftung';
import { schirmStelle } from './konstruktion';
import type { Aufbau } from './physik';
import { EINFALL_SKALA, WELLEN_HOEHE } from './wellenfeld';

const AKZENT = 0xff8c2e; // = --akzent in index.html
const NM: Einheit = { zeichen: 'nm', faktor: 1e-9, stellen: 0 };
const MM2: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 2 };
const MM3: Einheit = { zeichen: 'mm', faktor: 1e-3, stellen: 3 };
const M2: Einheit = { zeichen: 'm', faktor: 1, stellen: 2 };

function beschriftung(text: string, klasse = 'akzent'): CSS2DObject {
  const b = leer(klasse);
  b.element.textContent = text;
  return b;
}

function strich(farbe = AKZENT, breite = 0.035): Line2 {
  const l = new Line2(
    new LineGeometry(),
    new LineMaterial({ color: farbe, linewidth: breite, worldUnits: true, depthTest: false }),
  );
  l.renderOrder = 10;
  return l;
}

function setzePunkte(l: Line2, punkte: number[]): void {
  l.geometry.dispose();
  l.geometry = new LineGeometry().setPositions(punkte);
}

/** CSS-Beschriftungen folgen der Sichtbarkeit ihrer Gruppe nicht von selbst. */
function sichtbar(gruppe: THREE.Group, etiketten: CSS2DObject[], an: boolean): void {
  gruppe.visible = an;
  for (const e of etiketten) e.visible = an;
}

/** Höhe der einfallenden Welle im Bild — dieselbe Formel wie welle() im Shader. */
function einfallHoehe(k: number, x: number, phase: number): number {
  return WELLEN_HOEHE * Math.tanh(1.6 * EINFALL_SKALA * Math.cos(k * x - phase));
}

/**
 * Klammer über genau einer Wellenlänge der einfallenden Welle. Sie läuft mit einem Wellenberg
 * mit, damit man sieht: von Berg zu Berg ist es λ.
 */
export class LambdaMass {
  readonly gruppe = new THREE.Group();
  private linie = strich();
  private etikett = beschriftung('λ');
  private wellenlaenge = 1;

  // Bereich, in dem der linke Berg der Klammer gehalten wird; Lage quer zur Welle = Mitte,
  // dort, wo in Schritt 1 auch die Kurve von der Seite liegt.
  static readonly START = -3.6;
  static readonly Z = 0;
  private static readonly HOEHE = 0.34; // knapp über den Bergen (Höhe ≈ 0,19)

  constructor() {
    this.gruppe.add(this.linie, this.etikett);
    this.zeige(false);
  }

  setzeWellenlaenge(lambdaBild: number, lambdaEcht: number): void {
    this.wellenlaenge = lambdaBild;
    const h = LambdaMass.HOEHE;
    // Waagerechter Strich mit zwei Endhaken nach unten zu den Bergspitzen.
    setzePunkte(this.linie, [0, h - 0.12, 0, 0, h, 0, lambdaBild, h, 0, lambdaBild, h - 0.12, 0]);
    // Etwas nach hinten versetzt: von der Seite unverändert, von oben steht es neben der
    // Klammer statt auf ihr (von oben sieht man die Klammer nur als Strich).
    this.etikett.position.set(lambdaBild / 2, h + 0.2, -0.35);
    this.etikett.element.textContent = `λ = ${alsText({ wert: lambdaEcht, einheit: NM })}`;
  }

  /** Die einfallende Welle hat Berge bei k·x − Phase = 2πn → x = (Phase + 2πn)/k. */
  folge(phase: number): void {
    const lambda = this.wellenlaenge;
    const ersterBerg = (phase / (2 * Math.PI)) * lambda;
    const versatz = (((ersterBerg - LambdaMass.START) % lambda) + lambda) % lambda;
    this.gruppe.position.set(LambdaMass.START + versatz, 0, LambdaMass.Z);
  }

  zeige(an: boolean): void {
    sichtbar(this.gruppe, [this.etikett], an);
  }
}

/**
 * Die einfallende Welle als Kurve, wie von der Seite gesehen (Schritt 1): ein Schnitt durch
 * die Mitte des Lichtstrahls. Mit „Berg" und „Tal", die mitlaufen. Weiß statt Lichtfarbe —
 * sie liegt über der grünen Fläche und muss sich davon abheben (Kurt: Welle als Linie sehen).
 */
export class Profil {
  readonly gruppe = new THREE.Group();
  private linie = strich(0xffffff, 0.035);
  private berg = beschriftung('Berg', '');
  private tal = beschriftung('Tal', '');
  private striche = new Hinweisstriche();
  private k = 1;
  private an = false;

  static readonly VON = -5;
  static readonly BIS = 0;
  private static readonly PUNKTE = 240;
  /** Wo ungefähr „Berg" und „Tal" stehen (rechts von der λ-Klammer). */
  private static readonly ETIKETT_X = -1.6;

  constructor() {
    this.gruppe.add(this.linie, this.berg, this.tal, this.striche.linien);
    this.gruppe.position.z = LambdaMass.Z;
    this.zeige(false);
  }

  setze(lambdaBild: number): void {
    this.k = (2 * Math.PI) / lambdaBild;
  }

  folge(phase: number): void {
    if (!this.an) return; // Kurve nur neu rechnen, wenn man sie sieht
    const n = Profil.PUNKTE;
    const punkte: number[] = [];
    for (let i = 0; i <= n; i++) {
      const x = Profil.VON + ((Profil.BIS - Profil.VON) * i) / n;
      punkte.push(x, einfallHoehe(this.k, x, phase) + 0.01, 0);
    }
    setzePunkte(this.linie, punkte);
    // Berg = nächste Stelle mit k·x − Phase = 2πn bei ETIKETT_X; das Tal eine halbe Welle weiter.
    const lambda = (2 * Math.PI) / this.k;
    const einBerg = phase / this.k;
    const berg = einBerg + Math.round((Profil.ETIKETT_X - einBerg) / lambda) * lambda;
    // Etwas abseits, damit die Beschriftung die Welle nicht verdeckt — ein Strich zeigt hin.
    const h = WELLEN_HOEHE * Math.tanh(1.6 * EINFALL_SKALA);
    this.berg.position.set(berg + 0.25, h + 0.5, 0);
    this.tal.position.set(berg + lambda / 2 + 0.25, -h - 0.5, 0);
    this.striche.setze([
      [[berg + 0.25, h + 0.42, 0], [berg, h + 0.03, 0]],
      [[berg + lambda / 2 + 0.25, -h - 0.42, 0], [berg + lambda / 2, -h - 0.03, 0]],
    ]);
  }

  zeige(an: boolean): void {
    this.an = an;
    sichtbar(this.gruppe, [this.berg, this.tal], an);
  }
}

/**
 * Maße am Aufbau mit echten Zahlen: Spaltbreite b, Spaltabstand d (Mitte zu Mitte) und
 * Schirmabstand L. Die Klammern liegen knapp über der Blende, damit man sie von oben und
 * schräg sieht.
 */
export class Masse {
  readonly gruppe = new THREE.Group();
  private spalt = new THREE.Group();
  private schirm = new THREE.Group();
  private d = strich();
  private b = strich();
  private L = strich();
  private etiketten = { d: beschriftung('d'), b: beschriftung('b'), L: beschriftung('L') };
  private striche = new Hinweisstriche();

  private static readonly HOEHE = 1.15; // Blende reicht bis y = 1,0

  constructor() {
    this.spalt.add(this.d, this.b, this.etiketten.d, this.etiketten.b, this.striche.linien);
    this.schirm.add(this.L, this.etiketten.L);
    this.gruppe.add(this.spalt, this.schirm);
    this.zeige(false, false);
  }

  setze(bild: Aufbau, echt: Aufbau, halbeBreite: number): void {
    const h = Masse.HOEHE;
    const halbD = bild.spaltabstand / 2;
    const halbB = bild.spaltbreite / 2;
    const haken = 0.25;
    // d: vor der Blende, von Spaltmitte zu Spaltmitte, mit Haken zur Blende hin.
    const xd = -0.7;
    setzePunkte(this.d, [xd + haken, h, -halbD, xd, h, -halbD, xd, h, halbD, xd + haken, h, halbD]);
    this.etiketten.d.position.set(xd - 1.6, h, 0);
    this.etiketten.d.element.textContent = `d = ${alsText({ wert: echt.spaltabstand, einheit: MM2 })}`;
    // b: hinter der Blende, über dem oberen Spalt (der beim Einzelspalt offen bleibt).
    const xb = 0.6;
    setzePunkte(this.b, [
      xb - haken, h, halbD - halbB, xb, h, halbD - halbB, xb, h, halbD + halbB, xb - haken, h, halbD + halbB,
    ]);
    this.etiketten.b.position.set(xb + 1.7, h, halbD);
    this.etiketten.b.element.textContent = `b = ${alsText({ wert: echt.spaltbreite, einheit: MM3 })}`;
    // L: am hinteren Rand des Wellenfelds von der Blende bis zum Schirm (vorn läge es in den
    // Schrägansichten außerhalb des Bilds).
    const z = -(halbeBreite + 0.5);
    const L = bild.schirmabstand;
    setzePunkte(this.L, [0, 0.05, z + haken, 0, 0.05, z, L, 0.05, z, L, 0.05, z + haken]);
    this.etiketten.L.position.set(L * 0.7, 0.05, z - 0.45);
    this.etiketten.L.element.textContent = `L = ${alsText({ wert: echt.schirmabstand, einheit: M2 })}`;
    // Die Beschriftungen von d und b stehen neben ihren Klammern; Striche zeigen auf die Mitte.
    this.striche.setze([
      [[xd - 0.9, h, 0], [xd, h, 0]],
      [[xb + 0.9, h, halbD], [xb, h, halbD]],
    ]);
  }

  zeige(spalt: boolean, schirm: boolean): void {
    sichtbar(this.spalt, [this.etiketten.d, this.etiketten.b], spalt);
    sichtbar(this.schirm, [this.etiketten.L], schirm);
  }
}

/** Beschriftet die hellen Streifen am Bild-Schirm mit ihrer Ordnung m. */
export class Ordnungen {
  readonly gruppe = new THREE.Group();
  private etiketten: CSS2DObject[] = [];
  private an = false;

  setze(bild: Aufbau, halbeBreite: number, oberkante: number): void {
    for (const e of this.etiketten) this.gruppe.remove(e);
    this.etiketten = [];
    if (bild.spalte === 1) return;
    for (let m = -12; m <= 12; m++) {
      const z = schirmStelle(bild, m, halbeBreite);
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
    sichtbar(this.gruppe, this.etiketten, an);
  }
}
