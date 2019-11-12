import * as THREE from 'three';
import { OBJLoader } from './libs/OBJLoader';


var createAsteroids = function() {
  var asteroids = new THREE.Object3D();

  for( var i = 0; i < 300; i++ ) {
    var loader = new OBJLoader()
    loader.load('models/asteroid1.obj',
      function( asteroid ) {
        var texture = new THREE.TextureLoader().load('models/asteroidTexture.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 2, 2 );

        asteroid.traverse(function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = new THREE.MeshLambertMaterial();
                child.material.map = texture;
            }
        });
        asteroid.scale.set(
          Math.random() * 10 + 10,
          Math.random() * 10 + 10,
          Math.random() * 10 + 10
        );
        asteroid.position.set(
          Math.random() * 500 - 250,
          Math.random() * 500 - 250,
          -Math.random() * 20000
        );
        asteroids.add( asteroid );
      }
    );
  }
  return asteroids;
}

export default createAsteroids;
