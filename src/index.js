import * as THREE from 'three';

var container, camera, scene, renderer, hemiLight, directLight;
var ground;

init();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set( 0, 30, 30 );
  camera.lookAt(scene.position);

  hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.9 );
  hemiLight.position.set( 0, 20, 0 );
  scene.add( hemiLight );

  var geometry = new THREE.PlaneGeometry( 60, 30, 1, 1 );
  var material = new THREE.MeshLambertMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  ground = new THREE.Mesh( geometry, material );
  ground.rotation.x = -0.5 * Math.PI;
  scene.add( ground );

  var axes = new THREE.AxesHelper(3);
  scene.add( axes );
  var gridXZ = new THREE.GridHelper(10, 5);
  scene.add( gridXZ );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer.shadowMap.enabled = true;
  renderer.render( scene, camera );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
