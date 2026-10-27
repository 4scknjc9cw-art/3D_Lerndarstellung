import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { doppelspalt } from './experimente/doppelspalt';
import { Kamerafahrt } from './kern/kamera';
import { Parameter } from './kern/parameter';
import { seitenfeld } from './kern/ui/seitenfeld';
import { zeitleiste } from './kern/ui/zeitleiste';
import { Zeit } from './kern/zeit';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// Muss zu --hintergrund in index.html passen.
scene.background = new THREE.Color(0x131315);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const licht = new THREE.DirectionalLight(0xffffff, 1.4);
licht.position.set(-4, 10, 6);
scene.add(licht);

const experiment = doppelspalt;

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera.position.set(...experiment.ansicht.position);
const steuerung = new OrbitControls(camera, renderer.domElement);
steuerung.target.set(...experiment.ansicht.ziel);
steuerung.enableDamping = true;
// Kurts Wunsch: rechts = Sicht drehen, Mausrad gedrückt = verschieben, Mausrad = Zoom.
// Links bleibt frei — damit werden ab Schritt 5 Punkte am Schirm angeklickt.
steuerung.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
steuerung.update();
const fahrt = new Kamerafahrt(camera, steuerung);

const parameter = new Parameter(experiment.parameter);
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

const feld = seitenfeld(experiment, parameter, experimentSzene, fahrt);
document.body.appendChild(feld.element);

// Prüfhilfen für Bildschirmfotos (in der Adresse):
//   ?frei  ?schritt=2 (ab 1)  ?werte=d:0.0002,lambda:6.5e-7 (SI)  ?kamera=x,y,z,zx,zy,zz  ?fps
const adresse = new URLSearchParams(location.search);
feld.starte(adresse.has('frei') ? 'frei' : 'tour', Number(adresse.get('schritt') ?? 1) - 1);
for (const paar of adresse.get('werte')?.split(',') ?? []) {
  const [name, wert] = paar.split(':');
  parameter.setze(name, Number(wert));
}
const kameraParam = adresse.get('kamera');
if (kameraParam) {
  const [x, y, z, zx, zy, zz] = kameraParam.split(',').map(Number);
  fahrt.fahre({ position: [x, y, z], ziel: [zx, zy, zz] }, true);
} else if (adresse.has('schritt') || adresse.has('frei')) {
  // Ohne Fahrt direkt in die Ansicht — das Bildschirmfoto soll nicht mitten in der Fahrt entstehen.
  fahrt.fahre(
    adresse.has('frei')
      ? experiment.ansicht
      : experiment.touren[0].schritte[Number(adresse.get('schritt')) - 1].kamera,
    true,
  );
}

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

// Bildrate nur auf Wunsch (Adresse mit ?fps) — für die Messung am Laptop.
const fpsAnzeige = adresse.has('fps')
  ? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'fps' }))
  : undefined;
let fpsBilder = 0;
let fpsSeit = performance.now();

const uhr = new THREE.Timer();
renderer.setAnimationLoop((zeitstempel) => {
  uhr.update(zeitstempel);
  zeit.weiter(uhr.getDelta());
  experimentSzene.animiere(zeit.sekunden);
  fahrt.aktualisiere();
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
