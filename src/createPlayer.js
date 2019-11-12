import * as THREE from 'three';
import { FBXLoader } from './libs/FBXLoader';

var createPlayer = function() {
  var playerGroup = new THREE.Group();
  var loader = new FBXLoader();
  loader.load( 'models/X.fbx', function ( object ) {
    object.castShadow = true;
    playerGroup.add( object );
  } );

  var geometry = new THREE.BoxGeometry( 12.3, 0.8, 0.8 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var bodyCollisionCheckBox = new THREE.Mesh( geometry, material );
  bodyCollisionCheckBox.position.set( 0, 0, 0 );
  bodyCollisionCheckBox.rotation.y = 0.5 * Math.PI;
  bodyCollisionCheckBox.geometry.vertices[4] = new THREE.Vector3( -6, 1, -1 );
  bodyCollisionCheckBox.geometry.vertices[5] = new THREE.Vector3( -6, 1, 1 );
  bodyCollisionCheckBox.geometry.vertices[6] = new THREE.Vector3( -6, -1.2, -1 );
  bodyCollisionCheckBox.geometry.vertices[7] = new THREE.Vector3( -6, -1.2, 1 );
  // bodyCollisionCheckBox.visible = false;
  playerGroup.add( bodyCollisionCheckBox );

  geometry = new THREE.PlaneGeometry( 12, 2, 1 );
  material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var wingCollisionCheckPlane1 = new THREE.Mesh( geometry, material );
  wingCollisionCheckPlane1.position.set( 0, -0.1, 4.2 );
  wingCollisionCheckPlane1.rotation.x = 0.5 * Math.PI;
  wingCollisionCheckPlane1.rotation.y = 0.09 * Math.PI;
  // wingCollisionCheckPlane1.visible = false;
  playerGroup.add( wingCollisionCheckPlane1 );

  var wingCollisionCheckPlane2 = new THREE.Mesh( geometry, material );
  wingCollisionCheckPlane2.position.set( 0, -0.1, 4.2 );
  wingCollisionCheckPlane2.rotation.x = 0.5 * Math.PI;
  wingCollisionCheckPlane2.rotation.y = -0.09 * Math.PI;
  // wingCollisionCheckPlane2.visible = false;
  playerGroup.add( wingCollisionCheckPlane2 );

  playerGroup.scale.set( 0.3, 0.3, 0.3 );
  playerGroup.position.set( 0, 0, -20 );

  return playerGroup;
}

export default createPlayer;
