"use strict"

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const CANNON = require('cannon');

require('cannon/tools/threejs/CannonDebugRenderer.js');

require('./KeyboardState');
const KA32 = require('./Ka32');

const TIMESTEP = 1 / 60;

let keyboard, clock, world, scene, camera, renderer, controls, model, pModel;
let cannonDebugRenderer;

keyboard = new KeyboardState();
let ka32 = new KA32();

initCannon();
initThree();
addLevel();
ka32.initialize(keyboard, scene, world);
animate();

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, -1, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

function initThree() {
    // Create an empty scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Create a basic perspective camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 15;
    camera.position.x = -5;

    controls = new OrbitControls(camera);

    // Create a renderer with Antialiasing
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // Configure renderer clear color
    renderer.setClearColor("#000000");
    // Configure renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Append Renderer to DOM
    document.body.appendChild(renderer.domElement);

    //Provide lights to load the model
    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);
    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(15, 15, 0);
    scene.add(directionalLight);

    // cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
}

function animate() {
    // clock = new THREE.Clock();
    requestAnimationFrame(animate);
    updatePhysics();
    // cannonDebugRenderer.update();

    renderer.render(scene, camera);
    updateUserInput();
}

function updatePhysics() {
    world.step(TIMESTEP);
    ka32.updatePhysics();
}

function addLevel() {
    // Physics
    let shape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(shape);
    groundBody.position.y = -2;
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
    world.add(groundBody);

    // Graphics
    let geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x7ec0ee, side: THREE.DoubleSide });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    mesh.position.y = -2;
    scene.add(mesh);
}

function updateUserInput() {
    keyboard.update();
    if (ka32) {
        ka32.updateUserInput();
    }

    // if (keyboard.pressed("left") || keyboard.pressed("A")) {
    //     let rot = new CANNON.Vec3(0, -1, 0);
    //     let quat = new CANNON.Quaternion();
    //     quat.setFromAxisAngle(rot, Math.PI / 120);
    //     pModel.quaternion = pModel.quaternion.mult(quat);
    // }


    // if (keyboard.pressed("right") || keyboard.pressed("D")) {
    //     let rot = new CANNON.Vec3(0, 1, 0);
    //     let quat = new CANNON.Quaternion();
    //     quat.setFromAxisAngle(rot, Math.PI / 120);
    //     pModel.quaternion = pModel.quaternion.mult(quat);
    // }

    // if (keyboard.pressed("up") || keyboard.pressed("W")) {
    //     let speed = clock.getDelta();
    //     console.log("speed " + speed);
    //     pModel.velocity.y += 0.01;
    // }

    // if (keyboard.pressed("down") || keyboard.pressed("S")) {
    //     pModel.velocity.y -= 0.01;
    // }
}