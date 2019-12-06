"use strict"

var renderer, scene, camera, ground, track
var distance = 30

var simulationState = 0

var cars = []

var simulationTicker, rotationTicker
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

  // ground.receiveShadow = true
  scene.add( ground )

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.y = 20;
  camera.lookAt(ground.position);

  var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
  directionalLight.position.set( 100, 350, 250 );
  directionalLight.castShadow = true;
  scene.add( directionalLight );

  var ambientLight = new THREE.AmbientLight( 0x404040 );
  scene.add(ambientLight);

  scene.add( camera )

  initTrack()
}

function initTrack() {
  var loader = new THREE.OBJLoader();
  track = new THREE.Mesh(
      new THREE.BoxGeometry( 10, 2, 1 ),
      new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, flatShading: true, doubleSided: true })
    )

  track.castShadow = true
  track.position.y = 1
  track.position.z = 10
  track.isObstacle = true

  scene.add(track)

  loader.load(
    '../assets/track.obj',
    obj => {
      obj.position.set(0, -4, 0)
      obj.scale.set(5,52,5)
      obj.isObstacle = true
      
      obj.material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, flatShading: true, doubleSided: true })

      console.log(obj)

      scene.add(obj)
    },
    xhr => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
    error => console.log( 'An error happened' )
  );
}

function rotateCamera() {
  var speed = Date.now() * 0.00015;
  camera.position.x = Math.cos(speed) * distance;
  camera.position.z = Math.sin(speed) * distance;
  camera.lookAt(ground.position);
}

async function runSimulation() {
  const res = await fetch('http://localhost:3000/generate_population');
  const json = await res.json();
  json.forEach(({ id, dna }) => {
    createCar(dna)  
  })

  simulationTicker = setInterval(() => {
    simulationTick++
  }, 1000)

  rotationTicker = setInterval(() => {
    cars.forEach(car => {
      const { rotation: { y }, direction } = car
      car.rotation.set(0, lerp(y, direction, 0.1), 0)
    })
  }, 10)
}

function stopSimulation() {
  clearInterval(simulationTicker)
  clearInterval(rotationTicker)
  simulationTicker = null
  rotationTicker = null
  simulationTick = 0

  console.log(cars[0].rotation.y)

  cars.forEach(car => {
    car.geometry.dispose();
    car.material.dispose();
    scene.remove(car);
  })

  cars = []
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  rotateCamera();
  renderer.render( scene, camera );
}

function createCar(directionArray) {
  const carGeometry = new THREE.BoxGeometry( 1, 2, 3 )
  const car = new THREE.Mesh( 
    carGeometry,
    new THREE.MeshPhongMaterial({ color: 0x171717, specular: 0x009900, flatShading: true })
  );
  cars.push(car)
  scene.add(car)

  car.crashed = false

  var raycaster = new THREE.Raycaster()
  const { x, y, z } = car.rotation
  const { x: posX, y: posY, z: posZ} = car.position
  car.direction = y + directionArray[simulationTick]

  let lastTick = simulationTick

  raycaster.set(new THREE.Vector3(posX, posY, posZ + 2), car.rotation)

  console.log(scene.children)

  car.onAfterRender = () => {
    var raycaster = new THREE.Raycaster()
    const { x: posX, y: posY, z: posZ} = car.position
    raycaster.set(new THREE.Vector3(posX, posY, posZ + 2), car.rotation)
      var intersects = raycaster.intersectObjects(scene.children);
      if(intersects.length){
        car.crashed = true
      }

    if(!car.crashed){
  
      if(lastTick !== simulationTick){
        lastTick = simulationTick
        car.direction = y + directionArray[simulationTick]
      }

      car.translateZ(.1);
    }
  }
}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}