"use strict"

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const CANNON = require('cannon');

require('cannon/tools/threejs/CannonDebugRenderer.js');

require('./KeyboardState');

const TIMESTEP = 1 / 60;

let keyboard, clock, world, scene, camera, renderer, controls, model, pModel;
let cannonDebugRenderer;

keyboard = new KeyboardState();
initCannon();
initThree();
addLevel();
loadModel();

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
    camera.position.z = 5;
    camera.position.y = 5;

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
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
}

function addPhysicModel(geometry) {
    pModel = new CANNON.Body({ mass: 2 });

    let vertices = [];
    let faces = [];

    // Get vertices
    for (let gVertice of geometry.vertices) {
        vertices.push(gVertice.x, gVertice.y, gVertice.z);
    }

    // Get faces
    for (let gFace of geometry.faces) {
        faces.push(gFace.a, gFace.b, gFace.c);
    }

    let modelPart = new CANNON.Trimesh(vertices, faces);

    pModel.addShape(modelPart, new CANNON.Vec3(0, 0, 0));
    pModel.position = new CANNON.Vec3(0, 0, -5);

    let quat = new CANNON.Quaternion();
    //this quaternion vector makes object fly upwards (try normalizing quaternion for it)
    let rot = new CANNON.Vec3(0.8, 0, 0);
    quat.setFromAxisAngle(rot, (Math.PI / 5));
    pModel.quaternion = quat;

    pModel.angularVelocity.set(0, 1, 0);
    pModel.angularDamping = 0.5;
    world.add(pModel);
    animate();
}

function loadModel() {
    var jLoader = new THREE.JSONLoader();
    jLoader.load('assets/models/simpleCar/test.json', function(geometry, materials) {
        let object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        model = object;
        scene.add(object);
        addPhysicModel(geometry);
    });
}

function animate() {
    clock = new THREE.Clock();
    requestAnimationFrame(animate);
    updatePhysics();
    cannonDebugRenderer.update();

    renderer.render(scene, camera);
    updateUserInput();
}

function updatePhysics() {
    world.step(TIMESTEP);
    model.position.copy(pModel.position);
    model.quaternion.copy(pModel.quaternion);
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

    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        let rot = new CANNON.Vec3(0, -1, 0);
        let quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(rot, Math.PI / 120);
        pModel.quaternion = pModel.quaternion.mult(quat);
    }


    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        let rot = new CANNON.Vec3(0, 1, 0);
        let quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(rot, Math.PI / 120);
        pModel.quaternion = pModel.quaternion.mult(quat);
    }

    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        let speed = clock.getDelta();
        console.log("speed " + speed);
        pModel.velocity.y += 0.01;
    }

    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        pModel.velocity.y -= 0.01;
    }
}