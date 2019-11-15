import * as THREE from 'three';
import { OBJLoader } from './libs/OBJLoader';
import createDirectLight from './createDirectLight';
import { createStarGeo, createStarMaterial } from './createStars';
import createPlayer from './createPlayer';
import createAsteroids from './createAsteroids';
import updateStars from './updateStars';
import updateAsteroids from './updateAsteroids';
import checkCollision from './checkCollision';

var container, camera, scene, renderer, hemiLight;
var gameState = 'ready';
var gameScore = 0, shield = 100;
var starGeo, stars, asteroids = [];
var gameScore = 0, scoreTimer = 0, shieldPoint = 30;
var docTitle, docShield, docScore, docScoreValue, docGameover;

var clock = new THREE.Clock();
var playerGroup;
var right = false, left = false, up = false, down = false, spacebar = false;

var xMaxSpeed = 0.9, yMaxSpeed = 0.7, xSpeed = 0, ySpeed = 0;
var xSpeedDecrease = 0.03, xSpeedIncrease = 0.05, ySpeedDecrease = 0.02, ySpeedIncrease = 0.04;

var particleGeometry;
var particleCount = 100;
var explosionPower = 1.06;
var particles;
var bgm, music = false, audioVolume = 0;
var explosionSound;

init();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  scene.fog = new THREE.FogExp2( 0x000000, 0.0004 );
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 4000 );
  playerGroup = createPlayer();
  starGeo = createStarGeo();
  asteroids = createAsteroids();
  addExplosion();

  scene.add( new THREE.HemisphereLight( 0xffffff, 0x444444, 0.8 ) );
  scene.add( createDirectLight() );
  scene.add( new THREE.Points( starGeo, createStarMaterial() ));
  scene.add( asteroids );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'keydown', setPressedKey );
  window.addEventListener( 'keyup', resetPressedKey );

  // create an AudioListener and add it to the camera
  var listener = new THREE.AudioListener();
  camera.add( listener );

  bgm = new THREE.Audio( listener );
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'bensound-evolution.mp3', function( buffer ) {
  	bgm.setBuffer( buffer );
  	bgm.setLoop( true );
  	bgm.setVolume( audioVolume );
  } );
  explosionSound = new THREE.Audio( listener );
  audioLoader.load( 'explosion.wav', function( buffer ) {
    explosionSound.setBuffer( buffer );
    explosionSound.setLoop( false );
    explosionSound.setVolume( 0.6 );
  } );

  docTitle = document.getElementById('title');
  docShield = document.getElementById('shield');
  docScore = document.getElementById('score');
  docScoreValue = document.getElementById('score-value');
  docGameover = document.getElementById('gameover');

  window.onload = animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  updateStars( starGeo );
  updateAsteroids( asteroids );

  if( !music ) {
    if( audioVolume > 0 ) {
      audioVolume -= 0.001;
      bgm.setVolume( audioVolume );
      console.log('current volume', audioVolume );
    }
    if( audioVolume <= 0 && bgm.isPlaying ) {
      bgm.stop();
    }
  }

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
      if( !music ) {
        music = true;
        audioVolume = 0.5;
        bgm.setVolume( audioVolume );
        bgm.play();
        console.log('music on');
      }
      scene.add( playerGroup );
      gameState = 'playing';
    }
  }

  if( gameState === 'playing' ) {
    if( !music ) {
      music = true;
      audioVolume = 0.5;
      bgm.setVolume( audioVolume );
      bgm.play();
      console.log('music on');
    }

    var explodePosition = checkCollision( playerGroup, asteroids );
    if( explodePosition ) {
      explode( explodePosition );
      if( explosionSound.isPlaying ){
        explosionSound.stop();
      }
      explosionSound.play();
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
        if( music ) {
          music = false;
        }
      }

    }
    doExplosionLogic();

    if( left && right ) {
      if( xSpeed < 0 ) {
        xSpeed += xSpeedDecrease;
        if ( xSpeed > 0 ) {
          xSpeed = 0;
        }
      } else if( xSpeed > 0 ) {
        xSpeed -= xSpeedDecrease;
        if ( xSpeed < 0 ) {
          xSpeed = 0;
        }
      }
    } else {
      if( left && playerGroup.position.x > -80 ) {
        if( xSpeed > -xMaxSpeed ) {
          xSpeed -= xSpeedIncrease;
        }
      } else if( xSpeed < 0 ) {
        xSpeed += xSpeedDecrease;
        if ( xSpeed > 0 ) {
          xSpeed = 0;
        }
      }
      if( right && playerGroup.position.x < 80 ) {
        if( xSpeed < xMaxSpeed ) {
          xSpeed += xSpeedIncrease;
        }
      } else if( xSpeed > 0 ) {
        xSpeed -= xSpeedDecrease;
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
        if( ySpeed < yMaxSpeed ) {
          ySpeed += ySpeedIncrease;
        }
      } else if( ySpeed > 0 ) {
        ySpeed -= ySpeedDecrease;
        if ( ySpeed < 0 ) {
          ySpeed = 0;
        }
      }
      if( down && playerGroup.position.y > -30 ) {
        if( ySpeed > -yMaxSpeed ) {
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
