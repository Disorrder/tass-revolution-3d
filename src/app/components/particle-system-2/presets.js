var presets = {};
export default presets;

presets.default = {
    maxParticles: 1e3,
    spawnRate: 30, // particles per sec
    // texture: 'https://threejs.org/examples/textures/particle2.png',
    texture: require('assets/textures/explosion_map.png'),
    perspective: true,

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
