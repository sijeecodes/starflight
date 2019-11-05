import * as THREE from 'three';
import { FBXLoader } from './libs/FBXLoader';

var container, camera, scene, renderer, hemiLight, directLight;
var ground;

var mixer, clock = new THREE.Clock();

init();
animate();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );
  scene.fog = new THREE.Fog( 0xa0a0a0, 150, 300 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set( 0, 45, -40 );
  camera.rotation.y = -0.5 * Math.PI;
  camera.lookAt(0, 30, 0);
  // x(+left/-right) y(+high/-low) z(+front/-rear)

  hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 1.5 );
  scene.add( hemiLight );

  directLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
  // directLight = new THREE.SpotLight( 0xffffff );
  directLight.position.set( 100, 200, 100 );
  directLight.castShadow = true;
  directLight.shadow.mapSize.width = 5120;
  directLight.shadow.mapSize.height = 5120;
  directLight.shadow.camera.bottom = -200;
  directLight.shadow.camera.left = -200;
  directLight.shadow.camera.top = 80;
  directLight.shadow.camera.right = 80;
  // directLight.shadow.camera.near = 0.1;
  // directLight.shadow.camera.far = 2000;
  scene.add( directLight );

  var geometry = new THREE.PlaneGeometry( 1500, 1500, 10, 10 );
  var texture = new THREE.TextureLoader().load( 'models/grass.jpg' );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 20, 20 );
  var material = new THREE.MeshPhongMaterial( { map: texture } );
  ground = new THREE.Mesh( geometry, material );
  ground.rotation.x = -0.5 * Math.PI;
  ground.receiveShadow = true;
  ground.castShadow = false;
  scene.add( ground );

  var loader = new FBXLoader();
  loader.load( 'models/run.fbx', function ( object ) {
    mixer = new THREE.AnimationMixer( object );
    var action = mixer.clipAction( object.animations[ 0 ] );
    action.play();
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    object.scale.set( 0.2, 0.2, 0.2 );
    scene.add( object );
  } );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  var delta = clock.getDelta();

  if ( mixer ) {
    mixer.update( delta );
  }

  renderer.render( scene, camera );
}
