var textureLoader = new THREE.TextureLoader();

AFRAME.registerComponent('particle-fire', {
    schema: {
        // path: { type: string },
        // points: { type: 'number', default: 50 }
    },

    init() {
        this.particleSystem = new THREE.GPUParticleSystem({
			maxParticles: 250000,
            particleNoiseTex: textureLoader.load('https://threejs.org/examples/textures/perlin-512.png'),
            particleSpriteTex: textureLoader.load('https://threejs.org/examples/textures/particle2.png'),
		});

        this.options = {
            position: new THREE.Vector3(),
            positionRandomness: .99,
            velocity: new THREE.Vector3(0.1, 0.15, 0),
            velocityRandomness: .0,
            color: 0xff5566, //aa88ff
            colorRandomness: .2,
            turbulence: .0,
            lifetime: 2,
            size: 15,
            sizeRandomness: 1
        };

        this.spawnerOptions = {
            spawnRate: 100,
            timeScale: 1
        };

        this.el.setObject3D('particle-system', this.particleSystem);

        console.log('par sys', this.particleSystem);
    },

    update() {

    },

    tick(time, dt) {
        time /= 1000; dt /= 1000;
        // console.log(dt, this.spawnerOptions.spawnRate * dt);
        for ( var x = 0; x < this.spawnerOptions.spawnRate * dt; x++ ) {
            this.particleSystem.spawnParticle(this.options);
        }
        this.particleSystem.update(time * this.spawnerOptions.timeScale);
    }
});
