import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { doppelspalt } from './experimente/doppelspalt';
import { Parameter } from './kern/parameter';
import { erklaerfeld } from './kern/ui/erklaerung';
import { reglerListe } from './kern/ui/regler';
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
camera.position.set(-7, 13, 18);
const steuerung = new OrbitControls(camera, renderer.domElement);
steuerung.target.set(3.5, 0, 0);
steuerung.enableDamping = true;
// Kurts Wunsch: rechts = Sicht drehen, Mausrad gedrückt = verschieben, Mausrad = Zoom.
// Links bleibt frei — damit werden ab Schritt 5 Punkte am Schirm angeklickt.
steuerung.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

// Nur zum Prüfen per Bildschirmfoto: ?kamera=x,y,z,zielX,zielY,zielZ
const adresse = new URLSearchParams(location.search);
const kameraParam = adresse.get('kamera');
if (kameraParam) {
  const [x, y, z, tx, ty, tz] = kameraParam.split(',').map(Number);
  camera.position.set(x, y, z);
  steuerung.target.set(tx, ty, tz);
}
steuerung.update();

const experiment = doppelspalt;
const parameter = new Parameter(experiment.parameter);
// Ebenfalls Prüfhilfe: ?werte=d:0.0002,lambda:6.5e-7 setzt Startwerte (SI-Einheiten).
for (const paar of adresse.get('werte')?.split(',') ?? []) {
  const [name, wert] = paar.split(':');
  parameter.setze(name, Number(wert));
}

const experimentSzene = experiment.erzeugeSzene();
scene.add(experimentSzene.gruppe);
parameter.beobachte((werte) => experimentSzene.setze(werte));

const zeit = new Zeit();
document.body.appendChild(zeitleiste(zeit));

// Hinweis bleibt immer sichtbar: ohne ihn lernt man aus dem Bild falsche Größenverhältnisse.
const hinweis = document.createElement('div');
hinweis.className = 'hinweis';
hinweis.innerHTML =
  '<b>Nicht maßstabsgetreu:</b> Im Bild ist die Wellenlänge stark vergrößert, die Winkel ' +
  'sind dadurch viel größer als in echt. Alle Zahlen rechts sind echte Werte.';
document.body.appendChild(hinweis);

const seitenfeld = document.createElement('aside');
seitenfeld.className = 'seitenfeld';
const titel = document.createElement('h1');
titel.textContent = experiment.titel;
const ausprobieren = document.createElement('h2');
ausprobieren.textContent = 'Ausprobieren';
seitenfeld.append(
  titel,
  erklaerfeld(experiment, parameter),
  ausprobieren,
  reglerListe(parameter, experiment.parameter),
);
document.body.appendChild(seitenfeld);

// Bildrate nur auf Wunsch (Adresse mit ?fps) — für die Messung am Laptop.
const fpsAnzeige = adresse.has('fps')
  ? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'fps' }))
  : undefined;
let fpsBilder = 0;
let fpsSeit = performance.now();

// Das Seitenfeld (390 px + Rand, siehe index.html) liegt über dem Bild. Die Bildmitte wird
// darum in die Mitte der freien Fläche links davon verschoben, sonst verdeckt es den Schirm.
const SEITENFELD_PX = 406;
function passeAnsichtAn(): void {
  const b = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(b, h);
  camera.aspect = b / h;
  camera.setViewOffset(b, h, SEITENFELD_PX / 2, 0, b, h);
  camera.updateProjectionMatrix();
}
passeAnsichtAn();
window.addEventListener('resize', passeAnsichtAn);

const uhr = new THREE.Timer();
renderer.setAnimationLoop((zeitstempel) => {
  uhr.update(zeitstempel);
  zeit.weiter(uhr.getDelta());
  experimentSzene.animiere(zeit.sekunden);
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
