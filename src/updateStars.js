var updateStars = function( starGeo ) {
  starGeo.vertices.forEach( function( star ) {
    star.velocity += star.acceleration
    star.z += star.velocity;

    if ( star.z > 0 ) {
      star.z = -1000;
      star.velocity = 0;
    }
  });
  starGeo.verticesNeedUpdate = true;
};

export default updateStars;
