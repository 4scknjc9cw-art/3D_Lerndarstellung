import * as THREE from 'three';

// Schritt 0 — Tracer: ein drehender Würfel. Funktional belanglos; beweist nur, dass
// "ändern → pushen → unter der festen Adresse sichtbar" trägt. Wird in Schritt 2 ersetzt.

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 4);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x4f8cff }),
);
scene.add(cube);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(3, 4, 5);
scene.add(light);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop((zeitMs) => {
  cube.rotation.x = zeitMs / 2000;
  cube.rotation.y = zeitMs / 1500;
  renderer.render(scene, camera);
});
