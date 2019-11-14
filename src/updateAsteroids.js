var updateAsteroids = function( asteroids, hit ) {
  var updateAsteroid = function( asteroid, initiate ) {
    if( asteroid.position.z > 300 || initiate ) {
      asteroid.scale.set(
        Math.random() * 60 + 40,
        Math.random() * 60 + 40,
        Math.random() * 60 + 40
      );
      asteroid.position.set(
        Math.random() * 1000 - 500,
        Math.random() * 1000 - 500,
        -4000
      );
      asteroid.velocity = Math.random() * 30;
      if( initiate ) {
        console.log('init');
      }
    } else {
      asteroid.rotation.x += asteroid.rotate.x;
      asteroid.rotation.y += asteroid.rotate.y;
      asteroid.rotation.z += asteroid.rotate.z;
      asteroid.position.x += asteroid.xyMove.x;
      asteroid.position.y += asteroid.xyMove.y;
      asteroid.position.z += asteroid.velocity;
      asteroid.velocity += 0.005;
    }
  }

  if( hit ) {
    updateAsteroid( asteroids, true );
  } else {
    asteroids.children.forEach( function( asteroid ) {
      updateAsteroid( asteroid, false );
    } );
  }

};

export default updateAsteroids;
