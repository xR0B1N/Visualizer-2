//import * as THREE from "./lib/threejs/three";

// "Shortcuts"
let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;
let pi = Math.PI;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let geometry = new THREE.BoxGeometry();
let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


let cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

let deltaTime;
let then = 0;
let dtc = 0;
let animate = function (now) {
    // PRE
    let width = window.innerWidth;
    let height = window.innerHeight;
    deltaTime = now - then;
    then = now;

    requestAnimationFrame( animate );

    // MAIN
    cube.position.x = sin(now * 0.001);
    cube.position.y = cos(now * 0.001);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();