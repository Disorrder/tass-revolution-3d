var presets = {};
export default presets;

presets.default = {
    maxParticles: 1e3,
    spawnRate: 30, // particles per sec
    // texture: 'https://threejs.org/examples/textures/particle2.png',
    texture: require('assets/textures/explosion_map.png'),
    perspective: true,
    easeIn: 0.3,
    easeOut: 0.7,

    position: new THREE.Vector3(),
    positionSpread: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    velocitySpread: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    accelerationSpread: new THREE.Vector3(),
    color: 0xff5566,
    colorSpread: 0.2,
    opacity: 1,
    lifetime: 1,
    size: 1,
    sizeSpread: 1,
};

presets.test = Object.assign({}, presets.default, {
    maxParticles: 1500,
    spawnRate: 300,

    velocity: new THREE.Vector3(0, 5, 0),
    velocitySpread: new THREE.Vector3(4, 1, 4),
    acceleration: new THREE.Vector3(0, -2, 0),
    accelerationSpread: new THREE.Vector3(0, 0.5, 0),
    lifetime: 5,
});

presets.snow = Object.assign({}, presets.default, {
    maxParticles: 5000,
    spawnRate: 300,

    position: new THREE.Vector3(0, 25, 0),
    positionSpread: new THREE.Vector3(100, 50, 100),
    velocity: new THREE.Vector3(0, -3, 0),
    velocitySpread: new THREE.Vector3(2, 1, 2),
    color: 'white',
    colorSpread: 0.2,
    opacity: 0.8,
    lifetime: 10,
    size: 0.5,
});
