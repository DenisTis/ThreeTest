"use strict"

//works with exception in browser: app.js:5 Uncaught ReferenceError: require is not defined
// require('script-loader!three/build/three.min.js');
// require('script-loader!three-obj-loader/dist/index.js');

var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
// var OBJLoader = require('three-obj-loader');
// OBJLoader(THREE);
// var MTLLoader = require('three-mtl-loader');

// Create an empty scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

let controls = new OrbitControls(camera);

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({ antialias: true });
// Configure renderer clear color
renderer.setClearColor("#000000");
// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);
// Append Renderer to DOM
document.body.appendChild(renderer.domElement);

// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

//Provide lights to load the model
var ambient = new THREE.AmbientLight(0x101030);
scene.add(ambient);
var directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);


//Load model
var model;

var jLoader = new THREE.JSONLoader();
jLoader.load('assets/models/simpleCar/test.json', function(geometry, materials) {
    let object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    object.position.z = -5;
    object.rotation.x = 0.5;
    model = object;
    scene.add(object);
    render();
    //    checkLoaded();
});

// Render Loop
var render = function() {
    requestAnimationFrame(render);
    model.rotation.x += 0.005;
    model.rotation.y += 0.005;
    // Render the scene
    renderer.render(scene, camera);
};