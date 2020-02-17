//import * as THREE from "./lib/threejs/three";


requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: 'js/'
    }
});

requirejs(['threejs/three'], function() {
    //require('./lib/threejs/three.js');

//require("lib/threejs/three.js");


});