import * as THREE from 'three';
import { FBXLoader } from './libs/FBXLoader';
import { OrbitControls } from './libs/Orbitcontrols';
import { OBJLoader } from './libs/OBJLoader';
import Stats from './libs/stats.module.js';

var container, camera, scene, renderer, hemiLight, directLight;
var starGeo, stars, asteroids;
let controls;

var stats, clock = new THREE.Clock();
var playerGroup;
var right = false, left = false, up = false, down = false, controlSpeed = 0.3;

init();
animate();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
  // x(+left/-right) y(+high/-low) z(+front/-rear)

  hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.8 );
  scene.add( hemiLight );

  directLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
  directLight.position.set( 100, 200, 100 );
  directLight.castShadow = true;
  directLight.shadow.mapSize.width = 5120;
  directLight.shadow.mapSize.height = 5120;
  directLight.shadow.camera.bottom = -200;
  directLight.shadow.camera.left = -200;
  directLight.shadow.camera.top = 80;
  directLight.shadow.camera.right = 80;
  scene.add( directLight );

  starGeo = new THREE.Geometry();
  for( let i = 0 ; i < 3000 ; i++ ) {
    let star = new THREE.Vector3(
      Math.random() * 1000 - 500,
      Math.random() * 1000 - 500,
      - Math.random() * 1000
    );
    star.velocity = 0;
    star.acceleration = 0.03;
    starGeo.vertices.push( star );
  }
  let sprite = new THREE.TextureLoader().load( 'models/star.png' );
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 2,
    map: sprite
  });
  stars = new THREE.Points( starGeo, starMaterial );
  scene.add( stars );

  var loader2 = new OBJLoader()
  loader2.load('models/asteroid1.obj', function (object) {
    var texture = new THREE.TextureLoader().load('models/asteroidTexture.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 2, 2 );

    object.traverse(function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = new THREE.MeshLambertMaterial();
            child.material.map = texture;
        }
    });
    object.scale.set( 3, 3, 3 );
    object.position.set( 0, 0, -10 );
    object.rotation.y = 0.5 * Math.PI;
    scene.add( object );
  });

  //
  // for(let i=0;i<3000;i++) {
  //   let star = new THREE.Vector3(
  //     Math.random() * 1000 - 500,
  //     Math.random() * 1000 - 500,
  //     Math.random() * 1000 - 500
  //   );
  //   star.velocity = 0;
  //   star.acceleration = 0.03;
  //   starGeo.vertices.push(star);
  // }
  // let sprite = new THREE.TextureLoader().load( 'models/star.png' );
  // let starMaterial = new THREE.PointsMaterial({
  //   color: 0xaaaaaa,
  //   size: 2,
  //   map: sprite
  // });
  // stars = new THREE.Points(starGeo,starMaterial);
  // scene.add(stars);


  // Player space ship + collision check box
  playerGroup = new THREE.Group();
  var loader = new FBXLoader();
  loader.load( 'models/X.fbx', function ( object ) {
    object.castShadow = true;
    playerGroup.add( object );
  } );

  playerGroup.scale.set( 0.8, 0.8, 0.8 );
  // playerGroup.rotation.x = 0.5 * Math.PI;
  playerGroup.position.set( 0, 0, -20 );
  scene.add( playerGroup );

  // Render
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  controls = new OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 0, -20 );
  controls.update();

  stats = new Stats();
  container.appendChild( stats.dom );

  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'keydown', setPressedKey );
  window.addEventListener( 'keyup', resetPressedKey );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  starGeo.vertices.forEach(function(p) {
    p.velocity += p.acceleration
    p.z += p.velocity;

    if ( p.z > 0 ) {
      p.z = -1000;
      p.velocity = 0;
    }
  });
  starGeo.verticesNeedUpdate = true;

  if ( left ) {
    playerGroup.position.x -= controlSpeed;
    // playerGroup.rotation.y = 0.25 * Math.PI;
  }
  if ( right ) {
    playerGroup.position.x += controlSpeed;
    // playerGroup.rotation.y = -0.25 * Math.PI;
  }
  if ( up ) {
    playerGroup.position.y += controlSpeed;
  }
  if ( down ) {
    playerGroup.position.y -= controlSpeed;
  }

  stats.update();
  renderer.render( scene, camera );
}

function setPressedKey( event ) {
  console.log('???', event.keyCode );

  if ( event.keyCode === 65 ) {
    left = true;
  }
  if ( event.keyCode === 68 ) {
    right = true;
  }
  if ( event.keyCode === 87 ) {
    up = true;
  }
  if ( event.keyCode === 83 ) {
    down = true;
  }
  // if ( event.keyCode === )
}

function resetPressedKey( event ) {
  if ( event.keyCode === 65 ) {
    left = false;
  }
  if ( event.keyCode === 68 ) {
    right = false;
  }
  if ( event.keyCode === 87 ) {
    up = false;
  }
  if ( event.keyCode === 83 ) {
    down = false;
  }
}

function checkCollision( object1, object2 ){
  var originPoint = group.position.clone();
  var collidableMeshList = [];
  collidableMeshList.push(object2);
  for (var vertexIndex = 0; vertexIndex < object1.geometry.vertices.length; vertexIndex++)
  {
    var localVertex = object1.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4( object1.matrix );
    var directionVector = globalVertex.sub( object1.position );

    var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
    var collisionResults = ray.intersectObjects( collidableMeshList );
    if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
      console.log('Hit');
    }
  }
}
