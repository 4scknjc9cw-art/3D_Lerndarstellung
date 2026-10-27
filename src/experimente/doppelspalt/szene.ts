// 3D-Aufbau des Doppelspalts: Laser → ebene Welle → Blende mit zwei Spalten → Wellenfeld → Schirm.
// Alles hier ist im Darstellungsmaßstab (siehe darstellung.ts).

import * as THREE from 'three';
import type { Punkt } from '../../kern/experiment';
import { darstellungsAufbau } from './darstellung';
import { wellenlaengeZuFarbe } from './farbe';
import { konstruiere } from './konstruktion';
import { KonstruktionsBild } from './konstruktionsbild';
import { LambdaMass, Ordnungen } from './hilfen';
import { type Aufbau, feld, intensitaet } from './physik';
import { setzeAufbau, wellenMaterial } from './wellenfeld';

const BREITE = 16; // Ausdehnung quer zur Ausbreitung (z von −8 bis +8)
const VORLAUF = 5; // Strecke der ebenen Welle vor der Blende
const PERIODE_SEK = 1.6; // eine Schwingung pro 1,6 s bei normalem Tempo
const SCHIRM_PUNKTE = 1024;
// Gitterabstand ~ λ/8 im Bild, aber nie feiner als 0,04 — sonst wird es am Laptop zu viel.
const GITTER_MIN = 0.04;

export class DoppelspaltSzene {
  readonly gruppe = new THREE.Group();
  private feldMaterial = wellenMaterial(false);
  private einfallMaterial = wellenMaterial(true);
  private feld = new THREE.Mesh(new THREE.BufferGeometry(), this.feldMaterial);
  private feldSchluessel = '';
  private blende = new THREE.Group();
  private blendenMaterial = new THREE.MeshStandardMaterial({ color: 0x8a919c, roughness: 0.6 });
  private schirmTextur = new THREE.DataTexture(
    new Uint8Array(SCHIRM_PUNKTE * 4),
    SCHIRM_PUNKTE,
    1,
  );
  private schirm: THREE.Mesh;
  private konstruktion = new KonstruktionsBild();
  private bild?: Aufbau;
  private auswahl: Punkt | null = null;
  private lambdaMass = new LambdaMass();
  private ordnungen = new Ordnungen();

  constructor() {
    this.schirmTextur.colorSpace = THREE.SRGBColorSpace;
    this.schirmTextur.magFilter = THREE.LinearFilter;

    const einfall = new THREE.Mesh(this.gitter(VORLAUF, GITTER_MIN), this.einfallMaterial);
    einfall.position.x = -VORLAUF;
    this.gruppe.add(einfall, this.feld, this.blende);
    const laserGruppe = new THREE.Group();

    const laser = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x30343c, metalness: 0.4, roughness: 0.5 }),
    );
    laser.position.set(-VORLAUF - 0.8, 0.2, 0);
    // Orange Kennstreifen = Gerät/Bedienteil (Akzentfarbe), nicht Licht.
    const streifen = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.08, 1.62),
      new THREE.MeshStandardMaterial({ color: 0xff8c2e, roughness: 0.4 }),
    );
    streifen.position.set(-VORLAUF - 0.8, 0.45, 0);
    laserGruppe.add(laser, streifen);
    this.gruppe.add(laserGruppe);

    const schirmGeo = new THREE.PlaneGeometry(BREITE, 3);
    // Ebene zeigt danach in −x (zur Blende hin); u läuft dabei in +z.
    schirmGeo.rotateY(-Math.PI / 2);
    this.schirm = new THREE.Mesh(schirmGeo, new THREE.MeshBasicMaterial({ map: this.schirmTextur }));
    this.gruppe.add(this.schirm, this.konstruktion.gruppe, this.lambdaMass.gruppe, this.ordnungen.gruppe);

    this.teile = new Map<string, THREE.Object3D>([
      ['laser', laserGruppe],
      ['einfall', einfall],
      ['blende', this.blende],
      ['feld', this.feld],
      ['schirm', this.schirm],
    ]);
  }

  /** Namen, die Tour-Schritte in `sichtbar` verwenden dürfen. */
  readonly teile: Map<string, THREE.Object3D>;

  /** Hilfen, die nur auf Wunsch eines Tour-Teils erscheinen (nie im freien Modus). */
  readonly hilfen = ['lambdaMass', 'ordnungen'];

  zeigeHilfen(namen: readonly string[]): void {
    for (const name of namen) {
      if (!this.hilfen.includes(name)) throw new Error(`Unbekannte Hilfe: ${name}`);
    }
    this.lambdaMass.zeige(namen.includes('lambdaMass'));
    this.ordnungen.zeige(namen.includes('ordnungen'));
  }

  zeige(namen: readonly string[] | null): void {
    for (const name of namen ?? []) {
      if (!this.teile.has(name)) throw new Error(`Unbekannter Szenenteil: ${name}`);
    }
    for (const [name, teil] of this.teile) teil.visible = namen === null || namen.includes(name);
  }

  /**
   * Neuer Aufbau (echte Werte). Wird beim Ziehen eines Reglers pro Bild aufgerufen, darum
   * wird nur neu gebaut, was sich geändert hat — das Gitter (teuer) nur bei neuem L oder λ.
   */
  setze(echt: Aufbau): void {
    const bild = darstellungsAufbau(echt);
    const farbe = wellenlaengeZuFarbe(echt.wellenlaenge);
    for (const m of [this.feldMaterial, this.einfallMaterial]) {
      setzeAufbau(m, bild);
      (m.uniforms.uFarbe.value as THREE.Color).setRGB(...farbe);
    }

    const abstand = Math.max(GITTER_MIN, bild.wellenlaenge / 8);
    const schluessel = `${bild.schirmabstand}|${abstand}`;
    if (schluessel !== this.feldSchluessel) {
      this.feld.geometry.dispose();
      this.feld.geometry = this.gitter(bild.schirmabstand, abstand);
      this.feldSchluessel = schluessel;
    }

    this.baueBlende(bild);
    this.zeichneSchirm(bild, farbe);
    this.lambdaMass.setzeWellenlaenge(bild.wellenlaenge);
    this.ordnungen.setze(bild, BREITE / 2, this.schirm.position.y + 1.5);
    this.bild = bild;
    // Ändert sich der Aufbau, wandert die Konstruktion mit (z. B. Schirm bei neuem L).
    this.zeigeAuswahl(this.auswahl);
  }

  /**
   * Klick als Strahl: trifft er das Wellenfeld (Ebene y = 0) oder den Schirm? Gerechnet gegen
   * die mathematischen Ebenen statt gegen das Gitter — das hat 150 000 Punkte und wäre pro
   * Klick unnötig langsam. Die Wellenhöhe (±0,22) spielt beim Zielen keine Rolle.
   */
  trefferpunkt(strahl: THREE.Ray): Punkt | null {
    // Beim Einzelspalt gibt es keine zwei Wege und damit keinen Gangunterschied.
    if (!this.bild || this.bild.spalte === 1) return null;
    const L = this.bild.schirmabstand;
    const kandidaten: { punkt: Punkt; abstand: number }[] = [];
    const treffer = new THREE.Vector3();

    if (this.feld.visible && strahl.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), treffer)) {
      if (treffer.x > 0.05 && treffer.x <= L && Math.abs(treffer.z) <= BREITE / 2) {
        kandidaten.push({
          punkt: { x: treffer.x, z: treffer.z, aufSchirm: false },
          abstand: strahl.origin.distanceTo(treffer),
        });
      }
    }
    const schirmEbene = new THREE.Plane(new THREE.Vector3(-1, 0, 0), L + 0.05);
    if (this.schirm.visible && strahl.intersectPlane(schirmEbene, treffer)) {
      const y = treffer.y - this.schirm.position.y;
      if (Math.abs(treffer.z) <= BREITE / 2 && Math.abs(y) <= 1.5) {
        kandidaten.push({
          punkt: { x: L, z: treffer.z, aufSchirm: true },
          abstand: strahl.origin.distanceTo(treffer),
        });
      }
    }
    kandidaten.sort((a, b) => a.abstand - b.abstand);
    return kandidaten[0]?.punkt ?? null;
  }

  zeigeAuswahl(punkt: Punkt | null): void {
    this.auswahl = punkt;
    if (!punkt || !this.bild || this.bild.spalte === 1) {
      this.konstruktion.zeige(false);
      return;
    }
    const L = this.bild.schirmabstand;
    const x = punkt.aufSchirm ? L : Math.min(punkt.x, L);
    this.konstruktion.zeichne(konstruiere(this.bild, { x, y: punkt.z }));
    this.konstruktion.zeige(true);
  }

  /** Pro Bild aufrufen: nur die Phase läuft, die Physik bleibt dieselbe. */
  animiere(simSekunden: number): void {
    const phase = (2 * Math.PI * simSekunden) / PERIODE_SEK;
    this.feldMaterial.uniforms.uPhase.value = phase;
    this.einfallMaterial.uniforms.uPhase.value = phase;
    this.lambdaMass.folge(phase);
  }

  /** Waagerechtes Gitter von x = 0 bis laenge, z über die ganze Breite. */
  private gitter(laenge: number, abstand: number): THREE.PlaneGeometry {
    const geo = new THREE.PlaneGeometry(
      laenge,
      BREITE,
      Math.ceil(laenge / abstand),
      Math.ceil(BREITE / abstand),
    );
    geo.rotateX(-Math.PI / 2);
    geo.translate(laenge / 2, 0, 0);
    return geo;
  }

  private baueBlende(bild: Aufbau): void {
    for (const steg of this.blende.children) (steg as THREE.Mesh).geometry.dispose();
    this.blende.clear();
    const dicke = 0.15;
    const hoehe = 1.4;
    const halbD = bild.spaltabstand / 2;
    const halbB = bild.spaltbreite / 2;
    // Drei Stege: außen unten, Mitte, außen oben — dazwischen die beiden Spalte.
    // Beim Einzelspalt ist der untere Spalt zu: ein durchgehender Steg bis zum oberen.
    const stege: [number, number][] =
      bild.spalte === 1
        ? [
            [-BREITE / 2, halbD - halbB],
            [halbD + halbB, BREITE / 2],
          ]
        : [
            [-BREITE / 2, -halbD - halbB],
            [-halbD + halbB, halbD - halbB],
            [halbD + halbB, BREITE / 2],
          ];
    for (const [von, bis] of stege) {
      const steg = new THREE.Mesh(
        new THREE.BoxGeometry(dicke, hoehe, bis - von),
        this.blendenMaterial,
      );
      steg.position.set(0, 0.3, (von + bis) / 2);
      this.blende.add(steg);
    }
  }

  private zeichneSchirm(bild: Aufbau, farbe: [number, number, number]): void {
    // Schirmbild aus physik.ts (64-Bit, dieselbe Rechnung wie die Tests), im Bildmaßstab —
    // damit die hellen Streifen genau dort liegen, wo im Wellenfeld die Berge ankommen.
    // Auf das hellste Stück bezogen statt auf die Mitte: beim Einzelspalt (oben, nicht mittig)
    // ist die Schirmmitte nicht die hellste Stelle.
    const daten = this.schirmTextur.image.data as Uint8Array;
    const werte = Array.from({ length: SCHIRM_PUNKTE }, (_, i) =>
      intensitaet(feld(bild, bild.schirmabstand, -BREITE / 2 + (BREITE * (i + 0.5)) / SCHIRM_PUNKTE)),
    );
    const hellste = Math.max(...werte);
    for (let i = 0; i < SCHIRM_PUNKTE; i++) {
      const hell = werte[i] / hellste;
      daten[i * 4] = Math.round(255 * hell * farbe[0]);
      daten[i * 4 + 1] = Math.round(255 * hell * farbe[1]);
      daten[i * 4 + 2] = Math.round(255 * hell * farbe[2]);
      daten[i * 4 + 3] = 255;
    }
    this.schirmTextur.needsUpdate = true;
    this.schirm.position.set(bild.schirmabstand + 0.05, 1.2, 0);
  }
}
