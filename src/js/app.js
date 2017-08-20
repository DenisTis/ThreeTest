"use strict"

//works with exception in browser: app.js:5 Uncaught ReferenceError: require is not defined
// require('script-loader!three/build/three.min.js');
// require('script-loader!three-obj-loader/dist/index.js');

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const CANNON = require('cannon');

//TODO: convert it to return new object
require('./KeyboardState');
//const KEYBOARD = require('./KeyboardState');
const TIMESTEP = 1 / 60;

let keyboard, clock, world, scene, camera, renderer, controls, model, pModel;

keyboard = new KeyboardState();
initCannon();
addPModel();
initThree();
loadModel();

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, -0.1, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

function initThree() {
    // Create an empty scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Create a basic perspective camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

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
}

function addPModel() {
    let shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    let mass = 1;
    pModel = new CANNON.Body({ mass: mass });
    pModel.position = new CANNON.Vec3(0, 0, -5);
    pModel.addShape(shape);
    pModel.angularVelocity.set(0, 1, 0);
    pModel.angularDamping = 0.5;
    world.add(pModel);
}

function loadModel() {
    var jLoader = new THREE.JSONLoader();
    jLoader.load('assets/models/simpleCar/test.json', function(geometry, materials) {
        let object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        object.position.z = -5;
        object.rotation.x = 0.5;
        model = object;
        scene.add(object);
        animate();
    });
}

function animate() {
    clock = new THREE.Clock();
    requestAnimationFrame(animate);
    updatePhysics();
    // model.rotation.x += 0.005;
    // model.rotation.y += 0.005;
    renderer.render(scene, camera);
    updateUserInput();
}

function updatePhysics() {
    world.step(TIMESTEP);
    model.position.copy(pModel.position);
    //model.quaternion.copy(pModel.position);
}

function updateUserInput() {
    keyboard.update();

    // if (keyboard.pressed("left") || keyboard.pressed("A")) {
    //     let moveDistance = 1 * clock.getDelta();
    //     car.rotation.y += moveDistance;
    // }


    // if (keyboard.pressed("right") || keyboard.pressed("D")) {
    //     let moveDistance = 0.7 * clock.getDelta();
    //     car.rotation.y -= moveDistance;
    // }

    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        let speed = clock.getDelta();
        console.log("speed " + speed);
        pModel.velocity.y += 0.01;

    }

    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        pModel.velocity.y -= 0.01;
    }
}