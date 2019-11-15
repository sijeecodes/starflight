import * as THREE from 'three';
import { OrbitControls } from './libs/Orbitcontrols';
import { OBJLoader } from './libs/OBJLoader';
import Stats from './libs/stats.module.js';
import createDirectLight from './createDirectLight';
import { createStarGeo, createStarMaterial } from './createStars';
import createPlayer from './createPlayer';
import createAsteroids from './createAsteroids';
import updateStars from './updateStars';
import updateAsteroids from './updateAsteroids';
import checkCollision from './checkCollision';

var container, camera, scene, renderer, hemiLight;
var gameState = 'ready';
// ready, - press something to start
// playing, - set display playerGroup, check collisions, add score, gameover when shield < 0
// gameover - remove playerGroup from scene, display game over, press something to play again
var gameScore = 0, shield = 100;
var starGeo, stars, asteroids = [];
var controls;
var gameScore = 0, scoreTimer = 0, shieldPoint = 30;
var docTitle, docShield, docScore, docScoreValue, docGameover;

var stats, clock = new THREE.Clock();
var playerGroup;
var right = false, left = false, up = false, down = false, spacebar = false;

var maxSpeed = 0.8, xSpeed = 0, ySpeed = 0;
var xSpeedDecrease = 0.03, xSpeedIncrease = 0.05, ySpeedDecrease = 0.02, ySpeedIncrease = 0.04;

var particleGeometry;
var particleCount = 100;
var explosionPower = 1.06;
var particles;

init();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  scene.fog = new THREE.FogExp2( 0x000000, 0.0004 );
  // x(+left/-right) y(+high/-low) z(+front/-rear)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 4000 );
  playerGroup = createPlayer();
  starGeo = createStarGeo();
  asteroids = createAsteroids();
  addExplosion();

  scene.add( new THREE.HemisphereLight( 0xffffff, 0x444444, 0.8 ) );
  scene.add( createDirectLight() );
  scene.add( new THREE.Points( starGeo, createStarMaterial() ));
  scene.add( asteroids );

  // Render
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'keydown', setPressedKey );
  window.addEventListener( 'keyup', resetPressedKey );

  docTitle = document.getElementById('title');
  docShield = document.getElementById('shield');
  docScore = document.getElementById('score');
  docScoreValue = document.getElementById('score-value');
  docGameover = document.getElementById('gameover');
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  updateStars( starGeo );
  updateAsteroids( asteroids );

  if( gameState === 'gameover' || gameState === 'ready') {
    doExplosionLogic();

    if( spacebar ) {
      docTitle.style.opacity = 0;
      docGameover.style.opacity = 0;
      docShield.style.opacity = 1;
      docScore.style.opacity = 1;
      docScoreValue.innerHTML = 0;
      gameScore = 0;
      shieldPoint = 30;
      var shieldHTML = '';
      for( var i = 0; i < shieldPoint; i++ ) {
        shieldHTML += '|';
      }
      docShield.innerHTML = shieldHTML;
      playerGroup.position.set( 0, 0, -30 );
      scene.add( playerGroup );
      gameState = 'playing';
    }
  }

  if( gameState === 'playing' ) {
    var explodePosition = checkCollision( playerGroup, asteroids );
    if( explodePosition ) {
      explode( explodePosition );
      shieldPoint -= 10;
      if( shieldPoint >= 0 ) {
        var shieldHTML = '';
        for( var i = 0; i < shieldPoint; i++ ) {
          shieldHTML += '|';
        }
        docShield.innerHTML = shieldHTML;
      } else {
        scene.remove( playerGroup );
        docGameover.style.opacity = 1;
        gameState = 'gameover';
      }

    }
    doExplosionLogic();

    if( left && right ) {
      if( xSpeed < 0 ) {
        xSpeed += xSpeedDecrease;
        // xSpeed = xSpeed / 2 + xSpeedDecrease;
        if ( xSpeed > 0 ) {
          xSpeed = 0;
        }
      } else if( xSpeed > 0 ) {
        xSpeed -= xSpeedDecrease;
        // xSpeed = xSpeed / 2 - xSpeedDecrease;
        if ( xSpeed < 0 ) {
          xSpeed = 0;
        }
      }
    } else {
      if( left && playerGroup.position.x > -80 ) {
        if( xSpeed > -maxSpeed ) {
          xSpeed -= xSpeedIncrease;
        }
      } else if( xSpeed < 0 ) {
        xSpeed += xSpeedDecrease;
        // xSpeed = xSpeed / 2 + xSpeedDecrease;
        if ( xSpeed > 0 ) {
          xSpeed = 0;
        }
      }
      if( right && playerGroup.position.x < 80 ) {
        if( xSpeed < maxSpeed ) {
          xSpeed += xSpeedIncrease;
        }
      } else if( xSpeed > 0 ) {
        xSpeed -= xSpeedDecrease;
        // xSpeed = xSpeed / 2 - xSpeedDecrease;
        if ( xSpeed < 0 ) {
          xSpeed = 0;
        }
      }
    }

    if( up && down ) {
      if( ySpeed > 0 ) {
        ySpeed -= ySpeedDecrease;
        if ( ySpeed < 0 ) {
          ySpeed = 0;
        }
      } else if( ySpeed < 0 ) {
        ySpeed += ySpeedDecrease;
        if ( ySpeed > 0 ) {
          ySpeed = 0;
        }
      }
    } else {
      if( up && playerGroup.position.y < 30 ) {
        if( ySpeed < maxSpeed ) {
          ySpeed += ySpeedIncrease;
        }
      } else if( ySpeed > 0 ) {
        ySpeed -= ySpeedDecrease;
        if ( ySpeed < 0 ) {
          ySpeed = 0;
        }
      }
      if( down && playerGroup.position.y > -30 ) {
        if( ySpeed > -maxSpeed ) {
          ySpeed -= ySpeedIncrease;
        }
      } else if( ySpeed < 0 ) {
        ySpeed += ySpeedDecrease;
        if ( ySpeed > 0 ) {
          ySpeed = 0;
        }
      }
    }

    playerGroup.position.x += xSpeed;
    playerGroup.position.y += ySpeed;

    playerGroup.rotation.y = -xSpeed / 10 * Math.PI;
    playerGroup.rotation.x = ySpeed / 10 * Math.PI;
    playerGroup.rotation.z = -xSpeed / 5 * Math.PI;
    camera.rotation.y = -playerGroup.position.x / 700 * Math.PI;
    camera.position.x = playerGroup.position.x / 1.5;
    camera.rotation.x = playerGroup.position.y / 700 * Math.PI;
    camera.position.y = playerGroup.position.y / 1.5;

    scoreTimer++;
    if( scoreTimer >= 20 ) {
      scoreTimer = 0;
      gameScore++;
      docScoreValue.innerHTML = gameScore;
    }
  }

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

function setPressedKey( event ) {
  console.log( 'KEY', event.keyCode );
  if( event.keyCode === 65 ) {
    left = true;
  }
  if( event.keyCode === 68 ) {
    right = true;
  }
  if( event.keyCode === 87 ) {
    up = true;
  }
  if( event.keyCode === 83 ) {
    down = true;
  }
  if( event.keyCode === 32 ) {
    spacebar = true;
  }
}

function resetPressedKey( event ) {
  if( event.keyCode === 65 ) {
    left = false;
  }
  if( event.keyCode === 68 ) {
    right = false;
  }
  if( event.keyCode === 87 ) {
    up = false;
  }
  if( event.keyCode === 83 ) {
    down = false;
  }
  if( event.keyCode === 32 ) {
    spacebar = false;
  }
}
function addExplosion() {
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
  var sprite = new THREE.TextureLoader().load( 'models/explosion.png' );
  var pMaterial = new THREE.ParticleBasicMaterial( {
    color: 0xffffff,
    size: 0.5,
    map: sprite,
    transparent: true
  } );
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible = false;
}

function doExplosionLogic() {
	if( !particles.visible ) {
    return;
  }
	for( var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if( explosionPower > 1.03 ) {
		explosionPower -= 0.001;
	} else {
		particles.visible = false;
	}
	particleGeometry.verticesNeedUpdate = true;
}
function explode( explodePosition ) {
  particles.position.x = explodePosition.x;
	particles.position.y = explodePosition.y;
	particles.position.z = explodePosition.z;

	for ( var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 0.4 - 0.2;
		vertex.y = Math.random() * 0.4 - 0.2;
		vertex.z = Math.random() * 0.4 - 0.2;
		particleGeometry.vertices[i] = vertex;
	}
	explosionPower = 1.1;
	particles.visible = true;
}
