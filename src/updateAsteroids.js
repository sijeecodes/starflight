var updateAsteroids = function( asteroids ) {
  asteroids.children.forEach( function( asteroid ) {
    asteroid.position.z += 10;

    if ( asteroid.position.z > 0 ) {
      asteroid.position.z = -20000;
    }
  });
};

export default updateAsteroids;
