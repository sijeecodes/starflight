import * as THREE from 'three';

var checkCollision = function( playerGroup, asteroids ) {
  var collidableMeshList = [];
  var originPoint = playerGroup.position.clone();

  asteroids.children.forEach( function( asteroid ) {
    if( asteroid.position.distanceTo(playerGroup.position) < 50 ) {
      collidableMeshList.push(asteroid.children[0]);
    }
  } );

  if( collidableMeshList.length > 0 ) {
    for( var i = 0; i < 3; i++ ) {
      var collisionVertices = playerGroup.children[i].geometry.vertices
      for( var vertexIndex = 0; vertexIndex < collisionVertices.length; vertexIndex++ ) {
        var localVertex = collisionVertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( playerGroup.children[i].matrix );
        var directionVector = globalVertex.sub( playerGroup.children[i].position );

        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( collidableMeshList );
        if( collisionResults.length > 0 ) { //&& collisionResults[0].distance < directionVector.length() ) {
          for( var j = 0; j < collisionResults.length; j++) {
            if( collisionResults[j].distance < directionVector.length() ) {
              console.log('Hit', collisionResults[j].distance, collisionResults);
            }
          }
        }
      }
    }
  }
};

export default checkCollision;
