//import * as THREE from "./lib/threejs/three";

// "Shortcuts"
// let sin = Math.sin;
// let cos = Math.cos;
// let tan = Math.tan;
const pi = Math.PI;

let sound, amplitude;

// p5 sound preload
function preload() {
    sound = loadSound('https://dev.darkphotonbeam.com/audio/test/rain.mp3');
}

// p5 setup
function setup() {
    //cnv = createCanvas(0,0);
    masterVolume(1);
    sound.play();
    amplitude = new p5.Amplitude();
    console.log("p5 SETUP");



    // START THREE.JS ANIMATION
    animate();
}

function rgb(r, g, b) {
    return "rgb(" + (r%256) + ", " + (g%256) + ", " + (b%256) + ")";
}

function sweep(time) {
    return 0.5*Math.sin(time) + 0.5;
}

function asEnvelopeFS(signal, attack, sustain, steep) {
    if (signal > attack) {
        return sustain;
    } else {
        return Math.pow(signal/attack, steep)
    }
}

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );

// $( window ).resize(  );
window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
});

document.body.appendChild( renderer.domElement );

const CUBE_SIDE = 0.1;

// let geometry = new THREE.BoxGeometry();
let geometry = new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE); // 32
let material = new THREE.MeshBasicMaterial( {
    color: 0xaa0033,
    flatShading: true,
    transparent: true,
    opacity: 1
} );


let objArr = [];
let origin = {
    x: 0,
    y: 0,
    z: -30
};

let ttt = 0;

function addObjects(geo, mat, num, amp, offAng) {

    for (let i = 0; i < num; i++) {
        let angle = i / num * 2 * pi + offAng;
        //if (i === 0) angle = 0;
        let mesh = new THREE.Mesh( geometry, material );
        mesh.position.z = origin.z;

        // cube.position.x = cubeAmp * sin(angle);
        // cube.position.y = cubeAmp * cos(angle);
        //console.log(amp);


        objArr.push({
            "mesh" : mesh,
            "angle" : angle,
            "amp" : amp,
            "color" : [1.0, 0.0, 0.0],
            "opacity": 1.0,
            "offAngle" : offAng
        });
        scene.add(mesh);
    }

}


const OBJ_NUM = 16;
const OBJ_AMP = 1.5;
const OBJ_OFF = 0;


addObjects(geometry, material, OBJ_NUM, OBJ_AMP, OBJ_OFF);
// addObjects(geometry, material, 12, 2.5, pi / 12);


camera.position.z = 5;

let angleAdd = 0.0;
ampAdd = 0;

let tcount01 = 0;
const TCOUNT01 = 1;

let tcount02 = 0;
const TCOUNT02 = 0.5;

//let deltaTime;
let then = 0.0;

var clock = new THREE.Clock();

let levelSamples = [];
//let sampleCounter = 0;
const SAMPLE_BUFFER = 1000;

let loudest = 0;
let quietest = 1;
let normalizationBoost = 0;
const NORM_BIAS = 0.1;
const NORM_LEVEL = 0.3;
const MIN_SAMPLES = 100;

const COMP_RATIO = 0.8;

const SPEED_RAMP_EXP = 1.4;
const SPEED_RAMP_OFF = 0.1;
const SPEED_RAMP_BIAS = 90;
const SPEED_RAMP_BIAS2 = 0.05;
let speedRampBias = 1;

const ANGLE_ROTATION = 0.3;

const SIDE_AMP_EXP = 1.5;
const SIDE_AMP_OFF = 0.1;
const SIDE_AMP_BIAS = 20;

const AMP_EXP = 1.5;
const AMP_OFF = 0.1;
const AMP_BIAS = 5;


let animate = function (now) {
    //console.clear();
    // PRE
    let width = window.innerWidth;
    let height = window.innerHeight;
    const delta = clock.getDelta();
    //then = now;
    //ttt = now;

    let level = amplitude.getLevel();
    if (levelSamples.length === SAMPLE_BUFFER) {
        levelSamples.splice(0, 1);
        //console.log("BUFFER FILLED");
    }
    levelSamples.push(level);
    //sampleCounter++;
    //console.log(level);

    //ampAdd = 1*sin(now * 0.001) + 1;
    angleAdd += ANGLE_ROTATION * delta;
    //console.log(angleAdd);

    if (tcount01 > TCOUNT01) {
        addObjects(geometry, material, OBJ_NUM, OBJ_AMP, OBJ_OFF);
        tcount01 = 0;
    }

    function normalize() {
        let ratio = NORM_LEVEL / loudest;
        //console.log(loudest);
        if (ratio < 1) {
            normalizationBoost = ratio * COMP_RATIO;
        } else {
            normalizationBoost = ratio;
        }

        tcount02 = 0;
    }

    if (level > loudest) {
        loudest = level;
        normalize();
    }

    if (level < quietest) {
        quietest = level;
    }

    if (tcount02 > TCOUNT02) {
        // GET LOUDES VOLUME AND SET NORMALIZATION
        for (let s = 0; s < levelSamples.length; s++) {
            if (levelSamples[s] > loudest) loudest = levelSamples[s];
            if (levelSamples[s] < quietest) quietest = levelSamples[s];
        }
        normalize();
    }



    //console.log(normalizationBoost);
    if (levelSamples.length > MIN_SAMPLES) {
        level *= normalizationBoost;
        let dynamicRange = loudest - quietest;
        let dynamicRatio = 1 / dynamicRange;
        speedRampBias = dynamicRatio * SPEED_RAMP_BIAS2;
        speedRampBias = 1;
    }



    //console.log("NORMALIZED LEVEL: " + level);

    requestAnimationFrame( animate );

    const rotAdd = 0.01;



    // MAIN
    for (let i = 0; i < objArr.length; i++) {
        let c = objArr[i];
        let phi = c.angle + angleAdd;
        let a = c.amp + ampAdd + AMP_BIAS * Math.pow(level + AMP_OFF, AMP_EXP);
        c.mesh.rotation.z = -phi;
        c.mesh.rotation.x += rotAdd;
        c.mesh.rotation.y += rotAdd;
        c.mesh.position.x = a * Math.sin(phi);
        c.mesh.position.y = a * Math.cos(phi);
        c.mesh.position.z += delta * SPEED_RAMP_BIAS * Math.pow(level * speedRampBias+SPEED_RAMP_OFF, SPEED_RAMP_EXP);

        //c.material.color = new THREE.Color(i / objArr.length, 0.1, 0); // 0.1, sweep(now * 0.00072) * 0.6
        let distRat = 1-((camera.position.z - c.mesh.position.z) / (camera.position.z - origin.z));
        c.opacity = asEnvelopeFS(distRat, 0.7, 1, 2);

        c.color[2] = 1-level;
        c.color[0] = level;

        let sideAmp = Math.pow(level + SIDE_AMP_OFF, SIDE_AMP_EXP) * SIDE_AMP_BIAS + 1;

        c.mesh.scale.x = sideAmp;
        c.mesh.scale.y = sideAmp;
        c.mesh.scale.z = sideAmp;


        c.mesh.material = new THREE.MeshBasicMaterial( {
            color: new THREE.Color(c.color[0], c.color[1], c.color[2]),
            flatShading: true,
            transparent: true,
            opacity: c.opacity
        } );

        // Delete if far behind camera
        const MAX_DISTANCE_BEHIND_CAMERA = 4;
        if ((c.mesh.position.z - camera.position.z) > MAX_DISTANCE_BEHIND_CAMERA) {
            c.mesh.visible = false;
            objArr.splice(i, 1);
        }
    }

    //console.log(asEnvelopeFS(objArr[0].mesh.position.z / camera.z, 0.2, 1, 2));
    //console.log(objArr[0].mesh.position.z / camera.position.z);

    renderer.render( scene, camera );

    tcount01 += delta * 10 * (level);
    tcount02 += delta;
};
