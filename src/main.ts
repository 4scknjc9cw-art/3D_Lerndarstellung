import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DoppelspaltSzene } from './experimente/doppelspalt/szene';
import { standardAufbau, streifenabstand } from './experimente/doppelspalt/physik';
import { zeitleiste } from './kern/ui/zeitleiste';
import { Zeit } from './kern/zeit';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// Muss zu --hintergrund in index.html passen.
scene.background = new THREE.Color(0x131315);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const licht = new THREE.DirectionalLight(0xffffff, 1.4);
licht.position.set(-4, 10, 6);
scene.add(licht);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(-6, 11, 15);
const steuerung = new OrbitControls(camera, renderer.domElement);
steuerung.target.set(4, 0, 0);
steuerung.enableDamping = true;
steuerung.update();

const aufbau = { ...standardAufbau };
const doppelspalt = new DoppelspaltSzene();
doppelspalt.setze(aufbau);
scene.add(doppelspalt.gruppe);

const zeit = new Zeit();
document.body.appendChild(zeitleiste(zeit));

// Hinweis bleibt immer sichtbar: ohne ihn lernt man aus dem Bild falsche Größenverhältnisse.
const hinweis = document.createElement('div');
hinweis.className = 'hinweis';
const mm = (m: number, stellen: number) => (m * 1e3).toFixed(stellen).replace('.', ',');
hinweis.innerHTML =
  '<b>Nicht maßstabsgetreu:</b> Im Bild ist die Wellenlänge stark vergrößert, die Winkel ' +
  'sind dadurch viel größer als in echt.<br>' +
  `Echte Werte: λ = ${Math.round(aufbau.wellenlaenge * 1e9)} nm, ` +
  `d = ${mm(aufbau.spaltabstand, 2)} mm, b = ${mm(aufbau.spaltbreite, 3)} mm, ` +
  `L = ${aufbau.schirmabstand.toFixed(2).replace('.', ',')} m → ` +
  `Streifenabstand ≈ ${mm(streifenabstand(aufbau), 1)} mm`;
document.body.appendChild(hinweis);

// Bildrate nur auf Wunsch (Adresse mit ?fps) — für die Messung am Laptop.
const fpsAnzeige = new URLSearchParams(location.search).has('fps')
  ? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'fps' }))
  : undefined;
let fpsBilder = 0;
let fpsSeit = performance.now();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const uhr = new THREE.Timer();
renderer.setAnimationLoop((zeitstempel) => {
  uhr.update(zeitstempel);
  zeit.weiter(uhr.getDelta());
  doppelspalt.animiere(zeit.sekunden);
  steuerung.update();
  renderer.render(scene, camera);

  if (fpsAnzeige) {
    fpsBilder++;
    const jetzt = performance.now();
    if (jetzt - fpsSeit >= 1000) {
      fpsAnzeige.textContent = `${Math.round((fpsBilder * 1000) / (jetzt - fpsSeit))} Bilder/s`;
      fpsBilder = 0;
      fpsSeit = jetzt;
    }
  }
});
