
// Import dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';

// Connect to the multiplayer server
const socket = io('https://your-server-url-here'); // Replace with actual deployed server URL

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10);
controls.update();

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Block Generation Function
function createBlock(x, y, z, color = 0x8B4513) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    scene.add(block);
    return block;
}

// Generate a simple ground
for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
        createBlock(x, 0, z);
    }
}

// Player Movement
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x0000ff }));
player.position.set(0, 1, 0);
scene.add(player);

const velocity = { x: 0, z: 0 };
document.addEventListener('keydown', (event) => {
    if (event.key === 'w') velocity.z = -0.1;
    if (event.key === 's') velocity.z = 0.1;
    if (event.key === 'a') velocity.x = -0.1;
    if (event.key === 'd') velocity.x = 0.1;
});
document.addEventListener('keyup', () => {
    velocity.x = 0;
    velocity.z = 0;
});

// Multiplayer
socket.on('playerMoved', ({ id, x, z }) => {
    if (!players[id]) {
        players[id] = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        scene.add(players[id]);
    }
    players[id].position.set(x, 1, z);
});

const players = {};

// Game Loop
function animate() {
    requestAnimationFrame(animate);
    player.position.x += velocity.x;
    player.position.z += velocity.z;
    controls.update();
    renderer.render(scene, camera);
    socket.emit('movePlayer', { x: player.position.x, z: player.position.z });
}
animate();
