import ParticleSystem from 'app/extensions/three/GPUParticleSystem';

var textureLoader = new THREE.TextureLoader();

AFRAME.registerComponent('particle-fire-2', {
    schema: {
        // path: { type: string },
        // points: { type: 'number', default: 50 }
    },

    init() {
        this.options = {
            maxParticles: 1e5,
            particleNoiseTex: textureLoader.load('https://threejs.org/examples/textures/perlin-512.png'),
            particleSpriteTex: textureLoader.load('https://threejs.org/examples/textures/particle2.png'),
        }

        this.particleOptions = {
            position: new THREE.Vector3(),
            positionSpread: new THREE.Vector3(5, 0, 0),
            velocity: new THREE.Vector3(1, 1, 0),
            velocitySpread: new THREE.Vector3(1, 0.2, 1),
            acceleration: new THREE.Vector3(0, -0.05, 0),
            accelerationSpread: new THREE.Vector3(3, 1, 3),
            color: 0xff5566, //aa88ff
            colorSpread: .2,
            opacity: 0.5,
            // turbulence: .05,
            lifetime: 4,
            size: 5,
            sizeSpread: 1,
        };

        this.particleSystem = new ParticleSystem(this.options, this.particleOptions);

        this.spawnerOptions = {
            spawnRate: 10,
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
