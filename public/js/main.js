"use strict"

var renderer, scene, camera, ground, track, track2
var obstacles = []
var distance = 30
var walls = []

const defaultCameraPosition = { x: 0, y: 20, z: -22 }

var simulationState = 0

var cars = []

var simulationTicker, rotationTicker
var simulationTick = 0

var carModels = []

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

  setupCamera()

  var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
  directionalLight.position.set( 100, 350, 250 );
  directionalLight.castShadow = true;
  scene.add( directionalLight );

  var ambientLight = new THREE.AmbientLight( 0x404040 );
  scene.add(ambientLight);

  scene.add( camera )

  initTrack()
  loadOBJ()
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = defaultCameraPosition.z;
  camera.position.y = defaultCameraPosition.y;

  const cameraDirection = new THREE.Mesh()
  cameraDirection.position.set(0,1,10)

  scene.add(cameraDirection)

  camera.lookAt(cameraDirection.position)

  scene.add( camera )
}

function initTrack() {
  const addObstacle = (x,y,z,rot,long) => {
    console.log(rot, long)
    const obstacle = new THREE.Mesh(
      new THREE.BoxGeometry( 1, 2, long ? 40 : 1 ),
      new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, flatShading: true, doubleSided: true })
    )

    obstacle.position.set(x,y,z)
    obstacle.rotateY(rot)

    obstacle.boundingBox = new THREE.Box3
    obstacle.boundingBox.setFromObject(obstacle)

    var box = new THREE.BoxHelper( obstacle, 0xffff00 );
    scene.add(box)

    obstacles.push(obstacle)
    scene.add(obstacle)
  }

  const addStripe = (z) => {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry( 1, .2, 5 ),
      new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0x009900, flatShading: true, doubleSided: true })
    )

    stripe.position.set(0,0,z)

    scene.add(stripe)
  }

  ground = new THREE.Mesh( 
    new THREE.BoxGeometry( 25, .1, 150 ),
    new THREE.MeshPhongMaterial({ color: 0x545454, flatShading: true, doubleSided: true })
  );

  ground.position.set(0,0, 75)
  scene.add( ground )

  walls[0] = new THREE.Mesh( 
    new THREE.BoxGeometry( 1, 2, 150 ),
    new THREE.MeshPhongMaterial({ color: 0x404040, flatShading: true, doubleSided: true })
  );

  walls[1] = new THREE.Mesh( 
    new THREE.BoxGeometry( 1, 2, 150 ),
    new THREE.MeshPhongMaterial({ color: 0x404040, flatShading: true, doubleSided: true })
  );

  walls[0].position.set(13, 0, 75)
  walls[1].position.set(-13, 0, 75)

  walls[0].boundingBox = new THREE.Box3
  walls[0].boundingBox.setFromObject(walls[0])

  walls[1].boundingBox = new THREE.Box3
  walls[1].boundingBox.setFromObject(walls[1])

  scene.add(walls[0])
  scene.add(walls[1])

  var finishLine = new THREE.TorusGeometry( 10, 3, 16, 100 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var torus = new THREE.Mesh( 
    new THREE.TorusGeometry( 10, 3, 8, 10 ),
    new THREE.MeshPhongMaterial({ color: 0x519e2f, doubleSided: true, emissive: 0x519e2f })
  ) 

  torus.position.set(0,0,120)
  torus.rotation.set(.3,0,0)
  scene.add( torus );

  Array.from([
    [11,0,10,0],
    [10,0,10,0],
    [9,0,10,0],
    [8,0,10,0],
    [7,0,10,0],

    [6,0,10,0],
    [5,0,10.5,0],
    [4,0,11,0],
    [3,0,11.5,0],
    [2,0,12,0],
    [1,0,12.5,0],
    [0,0,13,0],

    [-11,0,22,0],
    [-10,0,22,0],
    [-9,0,22,0],
    [-8,0,22,0],
    [-7,0,22,0],
    [-6,0,22,0],
    [-5,0,22,0],
    [-4,0,23,0],
    [-3,0,24,0],
    [-2,0,25,0],
    [-1,0,26,0],

    [3,0,35,0],
    [4,0,35,0],
    [5,0,35,0],
    [6,0,35,0],
    [7,0,35,0],
    [8,0,35,0],
    [9,0,35,0],
    [10,0,35,0],

    [2,0,40,0],
    [2,0,39,0],
    [2,0,38,0],
    [2,0,37,0],
    [2,0,36,0],

    [-4,0,50,0],

    [9,0,70,0],
    [8,0,70.5,0],
    [7,0,71,0],
    [6,0,71.5,0],
    [5,0,72,0],
    [4,0,72.5,0],

    [-9,0,70,0],
    [-8,0,70.5,0],
    [-7,0,71,0],
    [-6,0,71.5,0],
    [-5,0,72,0],
    [-4,0,72.5,0],

    [-4,0,93,0,true],
    [4,0,93,0,true],

    ]).forEach(([x,y,z,rot,long]) => addObstacle(x,y,z,rot,long))

  for(let i = 0; i < 13; i++){
    addStripe(5 + (i * 11))
  }
}

function checkIfSimulationFinished() {
  let id
  let biggestDistance = camera.position.z
  cars.forEach(car => {
    if(car.distance >= biggestDistance){
      biggestDistance = car.distance
      id = car.id
    }
  })
  if(biggestDistance > 180){
    console.log('win!!!!')
    simulationState = 2
  }
  console.log(simulationTick)
  let allCrashed = true
  cars.forEach(({ crashed }) => !crashed && ( allCrashed = false))
  if(allCrashed || simulationTicker > 1000){
    console.log('sim end', ' max distance: ', biggestDistance, ' id: ', id)
    stopSimulation()
  }
}

function moveCamera() {
  let biggestDistance = camera.position.z
  cars.forEach(car => {
    if(car.distance >= biggestDistance){
      biggestDistance = car.distance
    }
  })
  camera.position.set(
    defaultCameraPosition.x,
    defaultCameraPosition.y,
    defaultCameraPosition.z + biggestDistance
  )
}

function rotateCamera() {
  var speed = Date.now() * 0.00015;
  camera.position.x = Math.cos(speed) * distance;
  camera.position.z = Math.sin(speed) * distance;
  camera.lookAt(ground.position);
}

async function runSimulation() {
  console.log('sim state: ', simulationState)
  if(simulationState === 1){
    return null
  }

  let res = {}
  if(simulationState !== 2){
    res = await fetch('http://localhost:3000/generate_population');
  } else {
    const results = JSON.stringify(cars.map(({ carId: id, distance }) => ({
      id,
      distance
    })));

    res = await fetch('http://localhost:3000/crossover', {
      method: 'POST',
      body: results
    });
  }

  const json = await res.json();

  if(simulationState == 2){
    clearSimulation()
    simulationState = 1
  }

  simulationState = 1

  json.forEach(({ id, dna }) => {
    createCar(dna, id)
  })

  simulationTicker = setInterval(() => {
    simulationTick++
  }, 300)

  rotationTicker = setInterval(() => {
    cars.forEach(car => {
      const { rotation: { y }, direction } = car
      car.rotation.set(0, lerp(y, direction, 0.1), 0)
    })
  }, 10)
}

function stopAndClear(){
  stopSimulation()
  clearSimulation()
  simulationState = 0
}

function stopSimulation() {
  clearInterval(simulationTicker)
  clearInterval(rotationTicker)
  simulationTicker = null
  rotationTicker = null
  simulationTick = 0
  simulationState = 2
}

function clearSimulation() {
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
  if(simulationState == 1){
    checkIfSimulationFinished()
    moveCamera();
  }

  renderer.render( scene, camera );
}

function loadOBJ() {
  const models = [{
      obj: 'car_01.obj',
      mtl: 'car_01.mtl'
    }
  ]

  models.forEach(({ obj, mtl }) => {
    const OBJLoader2 = new THREE.OBJLoader2()
    const MTLLoader = new THREE.MTLLoader()
    MTLLoader.setPath( '../assets/' );
    MTLLoader.load(
    mtl,
    materials => {
      materials.preload()
      OBJLoader2.setPath('../assets/')
      OBJLoader2.setMaterials(materials)
      OBJLoader2.load(
        obj,
        ({ detail: { loaderRootNode }}) => {
          const geometry = loaderRootNode.children[0].geometry
          geometry.scale(.02,.02,.02)
          geometry.computeBoundingBox()
          geometry.size = {}

          Array.from(['x','y','z']).forEach(dimension => {
            const { min, max } = geometry.boundingBox
            geometry.size[dimension] = Math.abs(min[dimension]) + Math.abs(max[dimension])
          })

          carModels.push({
            geometry,
            materials
          })
        }
      )
    })
  })
}

function createCar(directionArray, id) {
  const modelID = getRndInteger(0, carModels.length - 1)
  const materialValues = Object.values(carModels[modelID].materials.materials)

  const car = new THREE.Mesh( 
    carModels[modelID].geometry,
    new THREE.MeshPhongMaterial({ color: getRandomColor() })
  );

  car.carId = id
  car.size = car.geometry.size
  car.boundingBox = new THREE.Box3();

  cars.push(car)
  scene.add(car)

  car.crashed = false
  car.distance = 0

  const { y: rotY } = car.rotation
  car.direction = rotY + directionArray[simulationTick]

  let lastTick = simulationTick

  car.onAfterRender = () => {
    if(!car.crashed){
      car.boundingBox.setFromCenterAndSize(car.position, car.size)

      if(
        car.boundingBox.intersectsBox(walls[0].boundingBox) ||
        car.boundingBox.intersectsBox(walls[1].boundingBox)
      ){
        car.crashed = true
      }

      obstacles.forEach(obstacle => {
        if(car.boundingBox.intersectsBox(obstacle.boundingBox)){
          car.crashed = true
        }
      })

      if(lastTick !== simulationTick){
        lastTick = simulationTick
        car.direction = rotY + (directionArray[simulationTick] * 1)
      }

      car.translateZ(.1);

      car.distance = distanceVector(car.position, { x: 0, y: 0, z: 0 })
      // console.log(car.distance
    }
  }
}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}