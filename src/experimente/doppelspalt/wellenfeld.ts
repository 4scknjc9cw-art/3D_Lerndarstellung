// Wellenfeld als Shader (Programm, das auf der Grafikkarte für jeden Gitterpunkt läuft).
// Dieselbe Rechnung wie feldVonSpalt/auslenkung in physik.ts — nur im Darstellungsmaßstab,
// weil die Grafikkarte mit 32-Bit-Zahlen rechnet. Ändert sich die Physik dort, hier mitziehen.

import * as THREE from 'three';
import type { Aufbau } from './physik';
import { punktquellen } from './physik';

export const MAX_QUELLEN = 64; // beide Spalte zusammen

const gemeinsam = /* glsl */ `
  uniform float uK;
  uniform float uPhase;
  uniform float uQuellen[${MAX_QUELLEN}];
  uniform int uAnzahl;
  uniform float uRmin;
  uniform float uSkala;
  uniform float uHoehe;
  uniform float uEinfallend; // 1 = Feld vor der Blende (ebene Welle), 0 = dahinter
  varying float vWert;

  float welle(vec2 p) {
    if (uEinfallend > 0.5) {
      // Ebene Welle läuft in +x auf die Blende zu; Phase bei x = 0 passt zu den Spaltquellen.
      return cos(uK * p.x - uPhase);
    }
    float s = 0.0;
    for (int i = 0; i < ${MAX_QUELLEN}; i++) {
      if (i >= uAnzahl) break;
      // uRmin: direkt an der Quelle wäre 1/sqrt(r) unendlich — nur für das Bild gekappt.
      float r = max(length(vec2(p.x, p.y - uQuellen[i])), uRmin);
      // p.x / r = Neigungsfaktor cos θ, wie in physik.ts.
      s += (p.x / r) * cos(uK * r - uPhase) / sqrt(r);
    }
    // Wie in physik.ts: durch die Quellenzahl je Spalt teilen (uAnzahl zählt beide Spalte).
    return s / (float(uAnzahl) * 0.5) * uSkala;
  }
`;

const vertex = /* glsl */ `
  ${gemeinsam}
  void main() {
    // Szene: x = Ausbreitung, z = quer (physik.ts nennt das y), y = nach oben.
    float s = welle(vec2(position.x, position.z));
    // tanh begrenzt nur die Anzeige, damit es nahe am Spalt nicht übersteuert.
    vWert = tanh(1.6 * s);
    vec3 p = position + vec3(0.0, uHoehe * vWert, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uFarbe;
  varying float vWert;
  void main() {
    // Berg = hell in der Lichtfarbe, Tal = dunkel, Ruhe (Auslöschung) = neutrales Grau,
    // passend zum dunklen Hintergrund ohne Blaustich.
    vec3 tal = vec3(0.025, 0.025, 0.028);
    vec3 ruhe = vec3(0.15, 0.15, 0.16);
    vec3 farbe = vWert >= 0.0 ? mix(ruhe, uFarbe, vWert) : mix(ruhe, tal, -vWert);
    gl_FragColor = vec4(farbe, 1.0);
  }
`;

export function wellenMaterial(einfallend: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.DoubleSide,
    uniforms: {
      uK: { value: 1 },
      uPhase: { value: 0 },
      uQuellen: { value: new Array(MAX_QUELLEN).fill(0) },
      uAnzahl: { value: 0 },
      uRmin: { value: 0.05 },
      // Hinter der Blende kommt physikalisch viel weniger an als davor. Die Anzeige wird dort
      // bewusst verstärkt, sonst sieht man die Interferenz kaum — die Rechnung bleibt gleich.
      uSkala: { value: einfallend ? 0.8 : 2.2 },
      uHoehe: { value: 0.22 },
      uEinfallend: { value: einfallend ? 1 : 0 },
      uFarbe: { value: new THREE.Color(0.3, 1, 0.3) },
    },
  });
}

/** Überträgt einen Aufbau (Darstellungsmaßstab) in die Shader-Werte. */
export function setzeAufbau(material: THREE.ShaderMaterial, bild: Aufbau): void {
  const quellen = [...punktquellen(bild, 'oben'), ...punktquellen(bild, 'unten')];
  if (quellen.length > MAX_QUELLEN) {
    // Laut scheitern statt still falsch rechnen (Regel 8).
    throw new Error(`Zu viele Huygens-Quellen für den Shader: ${quellen.length} > ${MAX_QUELLEN}`);
  }
  const u = material.uniforms;
  u.uK.value = (2 * Math.PI) / bild.wellenlaenge;
  u.uAnzahl.value = quellen.length;
  const feld = u.uQuellen.value as number[];
  feld.fill(0);
  quellen.forEach((q, i) => (feld[i] = q));
  u.uRmin.value = bild.spaltbreite / bild.quellenJeSpalt;
}
