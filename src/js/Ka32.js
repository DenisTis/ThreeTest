module.exports = Ka32;

var keyboard, world;

var body, upperRotor, lowerRotor;
var upperRotorPivot, lowerRotorPivot;
var cannonModel, physicsModel;
var movementVector = new CANNON.Vec3(0, 0, 0);
var movementUpdateVector = new CANNON.Vec3(0, 0, 0);
var bladesSpeed = 0;
var MAXVERTSPEED = 20;
var MAXHORSPEED = 30;

function Ka32() {
    console.log("Started");
    this.initialize = loadKa32Model;
    this.updateUserInput = updateUserInput;
    this.updatePhysics = updatePhysics;
}

function loadKa32Model(keyboardObject, scene, worldObject) {
    keyboard = keyboardObject;
    world = worldObject;
    var jLoader = new THREE.JSONLoader();
    jLoader.load('assets/models/Ka32/Ka32Body.json', function(geometry, materials) {
        body = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(body);
    });

    jLoader.load('assets/models/Ka32/Ka32Tail.json', function(geometry, materials) {
        let tail = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        body.add(tail);
    });

    jLoader.load('assets/models/Ka32/Ka32UpperPart.json', function(geometry, materials) {
        let upperPart = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        body.add(upperPart);
    });

    jLoader.load('assets/models/Ka32/Ka32Rotator.json', function(geometry, materials) {
        let rotator = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        body.add(rotator);
    });

    //Because of three blades, center is determined incorrectly, and pivot is needed
    jLoader.load('assets/models/Ka32/Ka32UpperRotor.json', function(geometry, materials) {
        upperRotor = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        upperRotorPivot = new THREE.Group();
        upperRotor.position.z = -0.15;
        upperRotorPivot.position.z = 0.15;
        body.add(upperRotorPivot);
        upperRotorPivot.add(upperRotor);
    });

    jLoader.load('assets/models/Ka32/Ka32LowerRotor.json', function(geometry, materials) {
        lowerRotor = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        lowerRotorPivot = new THREE.Group();
        lowerRotor.position.z = -0.15;
        lowerRotorPivot.position.z = 0.15;
        body.add(lowerRotorPivot);
        lowerRotorPivot.add(lowerRotor);
    });

    jLoader.load('assets/models/Ka32/Ka32CannonBody.json', function(geometry) {
        //cannonModel = new THREE.Mesh(geometry);
        addPhysicsModel(geometry);
    });
}

function addPhysicsModel(geometry) {
    physicsModel = new CANNON.Body({ mass: 2000 });

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

    physicsModel.addShape(modelPart, new CANNON.Vec3(0, 0, 0));
    physicsModel.position = new CANNON.Vec3(0, -2.03066, -10);

    // let quat = new CANNON.Quaternion();
    // //this quaternion vector makes object fly upwards (try normalizing quaternion for it)
    // let rot = new CANNON.Vec3(0.8, 0, 0);
    // quat.setFromAxisAngle(rot, (Math.PI / 5));
    // physicsModel.quaternion = quat;

    //physicsModel.angularVelocity.set(0, 0, 0);
    //physicsModel.velocity.y = 4;
    let damping = 0.1;
    physicsModel.linearDamping = damping;
    physicsModel.angularDamping = damping;
    world.add(physicsModel);
}

function isOnGround() {
    if (!physicsModel) {
        return true;
    }
    if (physicsModel.position.y < -2.0306 && bladesSpeed <= 0.1) {
        return true;
    }
    return false;
}

function updateUserInputOnGround() {
    var isStarting = false;
    if (keyboard.pressed("shift")) {
        isStarting = true;
        bladesSpeed += 0.0005;
        if (bladesSpeed > 0.5) {
            //0.3 is minimum impulse possible here
            movementVector.y += 0.03;
        }
    }
    if (!isStarting) {
        bladesSpeed = bladesSpeed * 0.99;
    }
}

function updateUserInput() {
    /*While helicopter is on ground, 
    first blades should start to rotate, then heli should start to go up
    until then it should not be able to move or turn
    Coming back to ground should stop rotation after landing slowly
    */
    movementUpdateVector = new CANNON.Vec3(0, 0, 0);
    console.log(isOnGround());
    if (isOnGround()) {
        updateUserInputOnGround();
        return;
    }

    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        if (movementVector.z < MAXHORSPEED) {
            movementUpdateVector.z += 0.03;
        }
        // var localVelocity = new CANNON.Vec3(0, 0, 2);
        // physicsModel.quaternion.vmult(localVelocity, physicsModel.velocity);
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        if (movementVector.z > -MAXHORSPEED) {
            movementUpdateVector.z -= 0.03;
        }
        // var localVelocity = new CANNON.Vec3(0, 0, -2);
        // physicsModel.quaternion.vmult(localVelocity, physicsModel.velocity);
    }

    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        let rot = new CANNON.Vec3(0, -1, 0);
        let quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(rot, Math.PI / 240);
        physicsModel.quaternion = physicsModel.quaternion.mult(quat);
    }

    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        let rot = new CANNON.Vec3(0, 1, 0);
        let quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(rot, Math.PI / 240);
        physicsModel.quaternion = physicsModel.quaternion.mult(quat);
    }
    if (keyboard.pressed("shift")) {
        if (movementVector.y < MAXVERTSPEED) {
            movementUpdateVector.y += 0.2;
        }
        // var localVelocity = new CANNON.Vec3(0, 2, 0);
        // physicsModel.quaternion.vmult(localVelocity, physicsModel.velocity);
        //physicsModel.velocity.y += 0.1;
    }
    if (keyboard.pressed("ctrl")) {
        movementUpdateVector.y -= 0.2;
    }
    if (movementUpdateVector.z != 0 || movementUpdateVector.y != 0) {
        movementVector.vadd(movementUpdateVector, movementVector);
        //physicsModel.quaternion.vmult(movementUpdateVector, physicsModel.velocity);
    }
}

function updatePhysics() {
    // it is not only physics, but also three frame updates
    //apply here vector negation so that it starts to fall slowly after some time
    if (movementUpdateVector.z == 0) {
        movementVector.z = movementVector.z * 0.99;
    }
    if (movementUpdateVector.y == 0) {
        movementVector.y = movementVector.y * 0.7;
    }
    if (movementVector.z < 0.02 && movementVector.z > -0.02) {
        movementVector.z = 0;
    }
    if (movementVector.y < 0.02 && movementVector.y > -0.02) {
        movementVector.y = 0;
    }

    if (movementVector.z != 0 || movementVector.y != 0) {
        physicsModel.quaternion.vmult(movementVector, physicsModel.velocity);
    }

    if (physicsModel) {
        body.position.copy(physicsModel.position);
        body.quaternion.copy(physicsModel.quaternion);

        upperRotorPivot.rotation.y += bladesSpeed;
        lowerRotorPivot.rotation.y -= bladesSpeed;
    }
}