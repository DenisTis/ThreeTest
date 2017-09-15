module.exports = Ka32;

var keyboard;

var upperRotor, lowerRotor;

function Ka32() {
    console.log("Started");
    this.initialize = loadKa32Model;
    this.updateUserInput = updateUserInput;
}

function loadKa32Model(keyboardObject, scene) {
    keyboard = keyboardObject;
    var jLoader = new THREE.JSONLoader();
    jLoader.load('assets/models/Ka32/Ka32Body.json', function(geometry, materials) {
        let body = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(body);
    });

    jLoader.load('assets/models/Ka32/Ka32Tail.json', function(geometry, materials) {
        let tail = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(tail);
    });

    jLoader.load('assets/models/Ka32/Ka32UpperPart.json', function(geometry, materials) {
        let upperPart = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(upperPart);
    });

    jLoader.load('assets/models/Ka32/Ka32Rotator.json', function(geometry, materials) {
        let rotator = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(rotator);
    });

    jLoader.load('assets/models/Ka32/Ka32UpperRotor.json', function(geometry, materials) {
        upperRotor = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(upperRotor);
    });

    jLoader.load('assets/models/Ka32/Ka32LowerRotor.json', function(geometry, materials) {
        lowerRotor = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(lowerRotor);
    });
}

function updateUserInput() {
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        var speed = 0.1;
        //exported object loses its initial blender rotation
        //use quaternion to calculate complex rotation then...
        //probably rework design so that rotator is inclined not in blender,
        // but after object loading
        upperRotor.rotation.y += speed;
        lowerRotor.rotation.y -= speed;
    }
}