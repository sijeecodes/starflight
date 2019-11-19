var updateAsteroids = function( asteroids, hit ) {
  var updateAsteroid = function( asteroid, initiate ) {
    if( asteroid.position.z > 200 || initiate ) {
      asteroid.scale.set(
        ( Math.random() * 10 / 3 + 1 ) * 21,
        ( Math.random() * 10 / 3 + 1 ) * 21,
        ( Math.random() * 10 / 3 + 1 ) * 21
      );
      asteroid.position.set(
        Math.random() * 1000 - 500,
        Math.random() * 1000 - 500,
        -4000
      );
      asteroid.velocity = Math.random() + 10;
    } else {
      asteroid.rotation.x += asteroid.rotate.x;
      asteroid.rotation.y += asteroid.rotate.y;
      asteroid.rotation.z += asteroid.rotate.z;
      asteroid.position.x += asteroid.xyMove.x;
      asteroid.position.y += asteroid.xyMove.y;
      asteroid.position.z += asteroid.velocity;
      // asteroid.velocity += 0.006;
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
