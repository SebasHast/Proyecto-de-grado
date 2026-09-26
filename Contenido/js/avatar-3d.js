import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const host = document.getElementById('avatarCanvas');
if (!host) throw new Error('No se encontró el área del avatar.');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6e7df);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 1.8, 6.2);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
host.replaceChildren(renderer.domElement);
renderer.domElement.setAttribute('aria-label', 'Avatar 3D. Arrastra para rotarlo y usa la rueda o el gesto de pellizco para acercarlo.');

scene.add(new THREE.HemisphereLight(0xffffff, 0x969184, 2.1));
const keyLight = new THREE.DirectionalLight(0xfff3df, 3.1);
keyLight.position.set(-3.5, 5, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xdbe8ff, 1.4);
fillLight.position.set(3, 2.5, -2);
scene.add(fillLight);
const ground = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshStandardMaterial({ color: 0xd2d4c9, roughness: 0.95 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.025;
ground.receiveShadow = true;
scene.add(ground);
const pivot = new THREE.Group();
scene.add(pivot);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.65, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 8;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI * 0.86;
controls.update();

const material = (color, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
function mesh(geometry, mat, parent, position, scale) {
  const obj = new THREE.Mesh(geometry, mat);
  obj.position.set(...position);
  if (scale) obj.scale.set(...scale);
  obj.castShadow = true;
  obj.receiveShadow = true;
  parent.add(obj);
  return obj;
}
function sphere(parent, mat, pos, scale) { return mesh(new THREE.SphereGeometry(1, 32, 24), mat, parent, pos, scale); }
function segment(parent, mat, a, b, radiusA, radiusB = radiusA) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), direction = end.clone().sub(start);
  const obj = mesh(new THREE.CylinderGeometry(radiusB, radiusA, direction.length(), 20, 1), mat, parent, start.clone().add(end).multiplyScalar(0.5).toArray());
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  sphere(parent, mat, a, [radiusA, radiusA, radiusA]);
  sphere(parent, mat, b, [radiusB, radiusB, radiusB]);
  return obj;
}
function colorFor(label) {
  const text = (label || '').toLocaleLowerCase('es');
  if (text.includes('negro')) return '#30312f';
  if (text.includes('blanco')) return '#f0eee8';
  if (text.includes('azul')) return '#526f8b';
  if (text.includes('gris')) return '#858780';
  if (text.includes('café') || text.includes('chocolate')) return '#795844';
  if (text.includes('beige')) return '#c8b894';
  if (text.includes('amarillo')) return '#d1b648';
  if (text.includes('rojo')) return '#a85049';
  if (text.includes('verde')) return '#687852';
  return '#89906f';
}
function clearModel() {
  while (pivot.children.length) {
    const child = pivot.children[0];
    pivot.remove(child);
    child.traverse(object => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach(item => item.dispose());
      else object.material?.dispose();
    });
  }
}
function addHair(head, hairMat, style) {
  if (style === 'long') {
    sphere(head, hairMat, [0, 0.02, -0.08], [0.48, 0.60, 0.39]);
    sphere(head, hairMat, [-0.31, -0.20, 0.02], [0.16, 0.50, 0.23]);
    sphere(head, hairMat, [0.31, -0.20, 0.02], [0.16, 0.50, 0.23]);
    sphere(head, hairMat, [0, 0.39, 0.01], [0.40, 0.20, 0.38]);
  } else if (style === 'curly') {
    sphere(head, hairMat, [0, 0.22, -0.02], [0.48, 0.37, 0.42]);
    for (let i = 0; i < 13; i++) {
      const angle = (i / 13) * Math.PI * 2;
      sphere(head, hairMat, [Math.cos(angle) * 0.39, 0.14 + (i % 3) * 0.06, Math.sin(angle) * 0.34], [0.13, 0.14, 0.13]);
    }
  } else {
    sphere(head, hairMat, [0, 0.22, -0.06], [0.46, 0.28, 0.40]);
    sphere(head, hairMat, [0, 0.36, 0.08], [0.34, 0.13, 0.30]);
  }
}
function buildAvatar(state) {
  clearModel();
  const profile = state.profile || {};
  const garments = state.garments || [];
  const height = Math.max(120, Math.min(220, Number(profile.height) || 165));
  const weight = Math.max(30, Math.min(250, Number(profile.weight) || 60));
  const bmi = weight / ((height / 100) ** 2);
  const width = Math.max(0.82, Math.min(1.38, 1 + (bmi - 22) * 0.018));
  const heightScale = Math.max(0.76, Math.min(1.34, height / 165));
  const gender = profile.gender || 'neutro';
  const skinColor = profile.skin || '#dba77f';
  const skin = material(skinColor, 0.78);
  const hairMat = material(gender === 'hombre' ? '#342923' : '#43302a', 0.86);
  const faceMat = material('#493831', 0.72);
  const shoeMat = material('#353633', 0.84);
  const body = new THREE.Group();
  body.scale.set(width, heightScale, width);
  pivot.add(body);
  const isWoman = gender === 'mujer';
  const shoulders = isWoman ? 0.42 : 0.48;
  const hips = isWoman ? 0.39 : 0.35;
  const topGarment = garments.find(item => ['Camisetas', 'Hoodies', 'Chaquetas', 'Tops', 'Camisas'].includes(item.category));
  const bottomGarment = garments.find(item => ['Pantalones', 'Jeans', 'Shorts', 'Faldas'].includes(item.category));

  // Base mannequin: head, neck, trunk, arms and legs.
  sphere(body, skin, [0, 1.31, 0], [hips, 0.34, 0.27]);
  sphere(body, skin, [0, 1.84, 0], [shoulders, 0.61, 0.28]);
  segment(body, skin, [-shoulders + 0.03, 2.16, 0], [-0.65, 1.65, 0], 0.14, 0.105);
  segment(body, skin, [-0.65, 1.65, 0], [-0.72, 1.14, 0.01], 0.105, 0.075);
  segment(body, skin, [shoulders - 0.03, 2.16, 0], [0.65, 1.65, 0], 0.14, 0.105);
  segment(body, skin, [0.65, 1.65, 0], [0.72, 1.14, 0.01], 0.105, 0.075);
  const legSpread = isWoman ? 0.20 : 0.18;
  for (const side of [-1, 1]) {
    segment(body, skin, [side * legSpread, 1.10, 0], [side * legSpread * 1.16, 0.60, 0], 0.16, 0.115);
    segment(body, skin, [side * legSpread * 1.16, 0.60, 0], [side * legSpread * 1.2, 0.14, 0], 0.115, 0.075);
    sphere(body, shoeMat, [side * legSpread * 1.2, 0.09, 0.10], [0.12, 0.085, 0.22]);
  }
  mesh(new THREE.CylinderGeometry(0.115, 0.13, 0.22, 24), skin, body, [0, 2.40, 0]);
  const head = new THREE.Group(); head.position.set(0, 2.72, 0); body.add(head);
  sphere(head, skin, [0, 0, 0], [0.34, 0.43, 0.31]);
  addHair(head, hairMat, profile.hair || 'short');
  // Simple, friendly face on the front (+Z).
  for (const side of [-1, 1]) {
    sphere(head, faceMat, [side * 0.12, 0.02, 0.293], [0.025, 0.026, 0.015]);
    sphere(head, skin, [side * 0.34, -0.04, 0.005], [0.07, 0.11, 0.065]);
  }
  segment(head, skin, [0, 0.00, 0.30], [0, -0.11, 0.33], 0.025, 0.018);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.009, 8, 20, Math.PI), faceMat);
  mouth.position.set(0, -0.16, 0.296); mouth.rotation.z = Math.PI; head.add(mouth);

  // Generic clothing meshes use only product type and color; no marks or textures.
  if (topGarment) {
    const cloth = material(colorFor(topGarment.color), 0.8);
    sphere(body, cloth, [0, 1.83, 0.005], [shoulders * 1.08, 0.64, 0.315]);
    const longSleeve = ['Hoodies', 'Chaquetas'].includes(topGarment.category);
    for (const side of [-1, 1]) {
      segment(body, cloth, [side * shoulders * 0.83, 2.15, 0], [side * 0.66, 1.69, 0.015], 0.155, 0.112);
      if (longSleeve) segment(body, cloth, [side * 0.66, 1.69, 0.015], [side * 0.72, 1.16, 0.02], 0.112, 0.082);
    }
    if (topGarment.category === 'Hoodies') {
      sphere(body, cloth, [0, 2.28, -0.20], [0.27, 0.26, 0.18]);
      for (const side of [-1, 1]) segment(body, material('#e8e5dc', 0.65), [side * 0.045, 2.13, 0.30], [side * 0.045, 1.82, 0.31], 0.008, 0.008);
    }
    if (topGarment.category === 'Chaquetas') segment(body, material('#dad8cf', 0.45), [0, 2.35, 0.31], [0, 1.30, 0.30], 0.012, 0.012);
    if (['Camisetas', 'Tops', 'Camisas'].includes(topGarment.category)) {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 10, 28), material('#ede8dd', 0.65));
      collar.position.set(0, 2.39, 0.25); collar.rotation.x = Math.PI / 2; body.add(collar);
    }
  }
  if (bottomGarment) {
    const cloth = material(colorFor(bottomGarment.color), 0.82);
    if (bottomGarment.category === 'Faldas') {
      mesh(new THREE.CylinderGeometry(0.28, 0.49, 0.64, 40, 1, false), cloth, body, [0, 1.00, 0]);
    } else {
      const shortLength = bottomGarment.category === 'Shorts';
      for (const side of [-1, 1]) {
        segment(body, cloth, [side * legSpread, 1.10, 0], [side * legSpread * 1.16, shortLength ? 0.59 : 0.60, 0], 0.172, 0.128);
        if (!shortLength) segment(body, cloth, [side * legSpread * 1.16, 0.60, 0], [side * legSpread * 1.2, 0.14, 0], 0.128, 0.087);
      }
    }
  }
  pivot.position.y = 0;
  document.getElementById('avatarPreviewTitle').textContent = garments.length ? 'Tu conjunto' : 'Avatar 3D';
}

function resize() {
  const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();
const getStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
function fromStorage() {
  const products = window.CLOTHES_PRODUCTS || [];
  let ids = getStored('clothes.worn', []); if (!Array.isArray(ids)) ids = ids ? [ids] : [];
  const garments = ids.map(id => products.find(item => item.id === id)).filter(Boolean).map(item => ({ category: item.category, color: item.color }));
  return { profile: getStored('clothes.profile', { gender: 'neutro', height: 165, weight: 60, hair: 'short', skin: '#dba77f' }), garments };
}
window.addEventListener('clothes:avatar-updated', event => buildAvatar(event.detail));
buildAvatar(fromStorage());
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
