var updateAsteroids = function( asteroids ) {
  asteroids.children.forEach( function( asteroid ) {
    asteroid.rotation.x += asteroid.rotate.x;
    asteroid.rotation.y += asteroid.rotate.y;
    asteroid.rotation.z += asteroid.rotate.z;
    asteroid.position.x += asteroid.xyMove.x;
    asteroid.position.y += asteroid.xyMove.y;
    asteroid.position.z += asteroid.velocity;
    asteroid.velocity += 0.05;

    if ( asteroid.position.z > 25 ) {
      asteroid.scale.set(
        Math.random() * 20 + 40,
        Math.random() * 20 + 40,
        Math.random() * 20 + 40
      );
      asteroid.position.set(
        Math.random() * 1000 - 500,
        Math.random() * 1000 - 500,
        -4000
      );
      asteroid.velocity = Math.random() * 40;
    }
  } );
};

export default updateAsteroids;
