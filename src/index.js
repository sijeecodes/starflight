import * as THREE from 'three';
import { OBJLoader } from './libs/OBJLoader';
import createDirectLight from './createDirectLight';
import { createStarGeo, createStarMaterial } from './createStars';
import createPlayer from './createPlayer';
import createAsteroids from './createAsteroids';
import updateStars from './updateStars';
import updateAsteroids from './updateAsteroids';
import checkCollision from './checkCollision';
import createBlast from './createBlast';
import updateBlast from './updateBlast';
import { setKeyState, resetKeyState } from './setKeyStates';
import adjustMusic from './adjustMusic';

var container, camera, scene, renderer, hemiLight;
var gameState = 'ready';
var gameScore = 0, shield = 100;
var starGeo, stars, asteroids, playerGroup, ties;
var blasts = [], blasterDelay = 15;
var gameScore = 0, scoreTimer = 0, shieldPoint = 30;
var docTitle, docShield, docScore, docScoreValue, docGameover;

var clock = new THREE.Clock();
var keyStates = {
  right: false,
  left: false,
  up: false,
  down: false,
  startGame: false,
  spacebar: false
}
var music = {
  turnOn: false,
  volume: 0,
  bgm: null
}

var xMaxSpeed = 1.8, yMaxSpeed = 1.4, xSpeed = 0, ySpeed = 0;
var xSpeedDecrease = 0.06, xSpeedIncrease = 0.1, ySpeedDecrease = 0.04, ySpeedIncrease = 0.08;

var particleGeometry;
var particleCount = 100;
var explosionPower = 1.06;
var particles;
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

  music.bgm = new THREE.Audio( listener );
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'bensound-evolution.mp3', function( buffer ) {
  	music.bgm.setBuffer( buffer );
  	music.bgm.setLoop( true );
  	music.bgm.setVolume( 0 );
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
  music = adjustMusic( music, 'adjustVolume' );

  if( gameState === 'gameover' || gameState === 'ready') {
    doExplosionLogic();

    if( keyStates.startGame ) {
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
      playerGroup.position.set( 0, 0, -25 );
      music = adjustMusic( music, 'turnOn' );
      scene.add( playerGroup );
      gameState = 'playing';
    }
  }

  if( gameState === 'playing' ) {
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
        music = adjustMusic( music, 'turnOff' );
        gameState = 'gameover';
      }
    }
    doExplosionLogic();

    if( keyStates.left && keyStates.right ) {
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
      if( keyStates.left && playerGroup.position.x > -120 ) {
        if( xSpeed > -xMaxSpeed ) {
          xSpeed -= xSpeedIncrease;
        }
      } else if( xSpeed < 0 ) {
        xSpeed += xSpeedDecrease;
        if ( xSpeed > 0 ) {
          xSpeed = 0;
        }
      }
      if( keyStates.right && playerGroup.position.x < 120 ) {
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

    if( keyStates.up && keyStates.down ) {
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
      if( keyStates.up && playerGroup.position.y < 40 ) {
        if( ySpeed < yMaxSpeed ) {
          ySpeed += ySpeedIncrease;
        }
      } else if( ySpeed > 0 ) {
        ySpeed -= ySpeedDecrease;
        if ( ySpeed < 0 ) {
          ySpeed = 0;
        }
      }
      if( keyStates.down && playerGroup.position.y > -40 ) {
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
    if( keyStates.spacebar && blasterDelay === 20 ) {
      blasts.push( createBlast( playerGroup.position, xSpeed, ySpeed ) );
      scene.add( blasts[ blasts.length - 1 ] );
      blasterDelay = 0;
    }

    playerGroup.position.x += xSpeed;
    playerGroup.position.y += ySpeed;
    playerGroup.rotation.x = ySpeed / 20 * Math.PI;
    playerGroup.rotation.y = -xSpeed / 20 * Math.PI;
    playerGroup.rotation.z = -xSpeed / 10 * Math.PI;
    camera.rotation.x = playerGroup.position.y / 1400 * Math.PI;
    camera.rotation.y = -playerGroup.position.x / 1400 * Math.PI;
    camera.position.x = playerGroup.position.x / 1.15;
    camera.position.y = playerGroup.position.y / 1.15;

    scoreTimer++;
    if( scoreTimer >= 20 ) {
      scoreTimer = 0;
      gameScore++;
      docScoreValue.innerHTML = gameScore;
    }
  }

  if( blasterDelay < 20 ) {
    blasterDelay++;
  }
  if( blasts.length > 0 ) {
    for( var i = 0; i < blasts.length; i++ ) {
      updateBlast( blasts[i] );
      if( blasts[i].position.z < -2000 ) {
        blasts.splice( blasts.indexOf( blasts[i] ), 1 );
      }
    }
  }

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
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

function setPressedKey( event ) {
  keyStates = setKeyState( keyStates, event );
}

function resetPressedKey( event ) {
  keyStates = resetKeyState( keyStates, event );
}
