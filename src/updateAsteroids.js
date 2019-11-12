var updateAsteroids = function( asteroids ) {
  asteroids.children.forEach( function( asteroid ) {
    asteroid.position.z += asteroid.velocity;
    asteroid.velocity += 0.05;
    asteroid.rotation.x += asteroid.rotate.x;
    asteroid.rotation.y += asteroid.rotate.y;
    asteroid.rotation.z += asteroid.rotate.z;

    if ( asteroid.position.z > 0 ) {
      asteroid.scale.set(
        Math.random() * 20 + 30,
        Math.random() * 20 + 30,
        Math.random() * 20 + 30
      );
      asteroid.position.set(
        Math.random() * 1000 - 500,
        Math.random() * 1000 - 500,
        -4000
      );
      asteroid.velocity = Math.random() * 40;
    }
  });
};

export default updateAsteroids;
