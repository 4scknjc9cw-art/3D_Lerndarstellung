// 3D-Aufbau des Doppelspalts: Laser → ebene Welle → Blende mit zwei Spalten → Wellenfeld → Schirm.
// Alles hier ist im Darstellungsmaßstab (siehe darstellung.ts).

import * as THREE from 'three';
import { darstellungsAufbau } from './darstellung';
import { wellenlaengeZuFarbe } from './farbe';
import { type Aufbau, schirmIntensitaet } from './physik';
import { setzeAufbau, wellenMaterial } from './wellenfeld';

const BREITE = 16; // Ausdehnung quer zur Ausbreitung (z von −8 bis +8)
const VORLAUF = 5; // Strecke der ebenen Welle vor der Blende
const PERIODE_SEK = 1.6; // eine Schwingung pro 1,6 s bei normalem Tempo
const SCHIRM_PUNKTE = 1024;

export class DoppelspaltSzene {
  readonly gruppe = new THREE.Group();
  private feldMaterial = wellenMaterial(false);
  private einfallMaterial = wellenMaterial(true);
  private feld?: THREE.Mesh;
  private blende = new THREE.Group();
  private schirm?: THREE.Mesh;
  private schirmTextur = new THREE.DataTexture(
    new Uint8Array(SCHIRM_PUNKTE * 4),
    SCHIRM_PUNKTE,
    1,
  );

  constructor() {
    this.schirmTextur.colorSpace = THREE.SRGBColorSpace;
    this.schirmTextur.magFilter = THREE.LinearFilter;

    const einfall = new THREE.Mesh(this.gitter(VORLAUF, 0.04), this.einfallMaterial);
    einfall.position.x = -VORLAUF;
    this.gruppe.add(einfall);

    const laser = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x30343c, metalness: 0.4, roughness: 0.5 }),
    );
    laser.position.set(-VORLAUF - 0.8, 0.2, 0);
    this.gruppe.add(laser);
    // Orange Kennstreifen = Gerät/Bedienteil (Akzentfarbe), nicht Licht.
    const streifen = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.08, 1.62),
      new THREE.MeshStandardMaterial({ color: 0xff8c2e, roughness: 0.4 }),
    );
    streifen.position.set(-VORLAUF - 0.8, 0.45, 0);
    this.gruppe.add(streifen);
    this.gruppe.add(this.blende);
  }

  /** Neuer Aufbau (echte Werte): Bild, Blende und Schirm werden daraus neu erzeugt. */
  setze(echt: Aufbau): void {
    const bild = darstellungsAufbau(echt);
    const [r, g, b] = wellenlaengeZuFarbe(echt.wellenlaenge);
    for (const m of [this.feldMaterial, this.einfallMaterial]) {
      setzeAufbau(m, bild);
      (m.uniforms.uFarbe.value as THREE.Color).setRGB(r, g, b);
    }

    // Gitterabstand ~ λ/10 im Bild, damit die Welle glatt aussieht, aber nicht feiner als nötig.
    if (this.feld) this.gruppe.remove(this.feld);
    this.feld = new THREE.Mesh(
      this.gitter(bild.schirmabstand, bild.wellenlaenge / 10),
      this.feldMaterial,
    );
    this.gruppe.add(this.feld);

    this.baueBlende(bild);
    this.baueSchirm(bild, [r, g, b]);
  }

  /** Pro Bild aufrufen: nur die Phase läuft, die Physik bleibt dieselbe. */
  animiere(simSekunden: number): void {
    const phase = (2 * Math.PI * simSekunden) / PERIODE_SEK;
    this.feldMaterial.uniforms.uPhase.value = phase;
    this.einfallMaterial.uniforms.uPhase.value = phase;
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
    this.blende.clear();
    const material = new THREE.MeshStandardMaterial({ color: 0x8a919c, roughness: 0.6 });
    const dicke = 0.15;
    const hoehe = 1.4;
    const halbD = bild.spaltabstand / 2;
    const halbB = bild.spaltbreite / 2;
    // Drei Stege: außen unten, Mitte, außen oben — dazwischen die beiden Spalte.
    const stege: [number, number][] = [
      [-BREITE / 2, -halbD - halbB],
      [-halbD + halbB, halbD - halbB],
      [halbD + halbB, BREITE / 2],
    ];
    for (const [von, bis] of stege) {
      const steg = new THREE.Mesh(new THREE.BoxGeometry(dicke, hoehe, bis - von), material);
      steg.position.set(0, 0.3, (von + bis) / 2);
      this.blende.add(steg);
    }
  }

  private baueSchirm(bild: Aufbau, farbe: [number, number, number]): void {
    // Schirmbild aus physik.ts (64-Bit, dieselbe Rechnung wie die Tests), im Bildmaßstab —
    // damit die hellen Streifen genau dort liegen, wo im Wellenfeld die Berge ankommen.
    const daten = this.schirmTextur.image.data as Uint8Array;
    for (let i = 0; i < SCHIRM_PUNKTE; i++) {
      const z = -BREITE / 2 + (BREITE * (i + 0.5)) / SCHIRM_PUNKTE;
      const hell = Math.min(1, schirmIntensitaet(bild, z));
      daten[i * 4] = Math.round(255 * hell * farbe[0]);
      daten[i * 4 + 1] = Math.round(255 * hell * farbe[1]);
      daten[i * 4 + 2] = Math.round(255 * hell * farbe[2]);
      daten[i * 4 + 3] = 255;
    }
    this.schirmTextur.needsUpdate = true;

    if (this.schirm) this.gruppe.remove(this.schirm);
    const geo = new THREE.PlaneGeometry(BREITE, 3);
    // Ebene zeigt danach in −x (zur Blende hin); u läuft dabei in +z.
    geo.rotateY(-Math.PI / 2);
    this.schirm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.schirmTextur }));
    this.schirm.position.set(bild.schirmabstand + 0.05, 1.2, 0);
    this.gruppe.add(this.schirm);
  }
}
