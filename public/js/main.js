"use strict"

var renderer, scene, camera, ground
var distance = 30

var simulationState = 0

var cars = []

var simulationTicker
var simulationTick = 0

init()
animate()

function init() {
  const container = document.getElementById('container')
  renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  ground = new THREE.Mesh( 
    new THREE.BoxGeometry( 30, 1, 30 ),
    new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, flatShading: true, doubleSided: true })
  );

  ground.receiveShadow = true
  scene.add( ground )

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.y = 20;
  camera.lookAt(ground.position);

  const test = new THREE.Mesh(
      new THREE.BoxGeometry( 2, 2, 2 ),
      new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, flatShading: true, doubleSided: true })
    )

  test.castShadow = true
  test.position.y = 5

  scene.add(test)

  var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
  directionalLight.position.set( 100, 350, 250 );
  directionalLight.castShadow = true;
  scene.add( directionalLight );

  var ambientLight = new THREE.AmbientLight( 0x404040 );
  scene.add(ambientLight);

  scene.add( camera )

  createCar()
}

function rotateCamera() {
  var speed = Date.now() * 0.00015;
  camera.position.x = Math.cos(speed) * distance;
  camera.position.z = Math.sin(speed) * distance;
  camera.lookAt(ground.position);
}

function runSimulation() {
  simulationTicker = setInterval(() => {
    simulationTick++
  }, 100)
}

function stopSimulation() {
  clearInterval(simulationTicker)
  simulationTick = 0
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  rotateCamera();
  renderer.render( scene, camera );
  // console.log('xd')
}

function createCar(directionArray) {
  const carGeometry = new THREE.BoxGeometry( 1, 2, 3 )
  const car = new THREE.Mesh( 
    carGeometry,
    new THREE.MeshPhongMaterial({ color: 0x171717, specular: 0x009900, flatShading: true, doubleSided: true })
  );

  console.log(car)

  cars.push(car)
  scene.add(car)

  const { x, y, z } = car.rotation

  car.onAfterRender = () => {
    car.translateZ(.1);
    car.rotation.set(0, lerp(y, simulationTick, .1), 0)
    // car.rotation.set(0,simulationTick,0)
  }
}

// while(true){
//   console.log('xd')
// }

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}