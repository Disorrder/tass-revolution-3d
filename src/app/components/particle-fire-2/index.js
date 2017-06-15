import ParticleSystem from 'app/extensions/three/GPUParticleSystem';

var textureLoader = new THREE.TextureLoader();

AFRAME.registerComponent('particle-fire-2', {
    schema: {
        maxParticles: { type: 'number', default: 1e3 },
        texture: { type: 'map', default: 'https://threejs.org/examples/textures/particle2.png' },
        perspective: { type: 'boolean', default: true },
    },

    init() {
        console.log('dataaa' ,this.data);
        this.options = {
            maxParticles: this.data.maxParticles,
            particleSpriteTex: textureLoader.load(this.data.texture),
        }

        this.particleOptions = {
            position: new THREE.Vector3(),
            positionSpread: new THREE.Vector3(0, 0.1, 0),
            // velocity: new THREE.Vector3(0, 5, 0),
            // velocitySpread: new THREE.Vector3(),
            // acceleration: new THREE.Vector3(),
            // accelerationSpread: new THREE.Vector3(),
            velocity: new THREE.Vector3(0, 3, 0),
            velocitySpread: new THREE.Vector3(2, 1, 2),
            acceleration: new THREE.Vector3(0, -1, 0),
            accelerationSpread: new THREE.Vector3(1, 1, 1),
            color: 0xff5566, //aa88ff
            colorSpread: .2,
            opacity: 0.5,
            lifetime: 4,
            size: 1,
            sizeSpread: 1,
        };

        this.particleSystem = new ParticleSystem(this.options, this.particleOptions);

        // this.particleSystem.material.defines.HAS_PERSPECTIVE = false;

        this._particleCursor = 0;
        this._spawnDt = 0;
        this._spawnLastTime = 0;
        this.spawnRate = 30 * 5;
        this.timeScale = 1; // not implemented

        this.el.setObject3D('particle-system', this.particleSystem);
    },

    update() {
        console.log('upd');
        this._spawnTimeInterval = 1 / this.spawnRate;
    },

    tick(time, dt) {
        time /= 1000; dt /= 1000;
        if (!this._spawnLastTime) return this._spawnLastTime = time;

        this._spawnDt = time - this._spawnLastTime;

        for ( this._spawnLastTime; this._spawnLastTime <= time-this._spawnTimeInterval; this._spawnLastTime += this._spawnTimeInterval ) {
            this.particleOptions.position.x = (++this._particleCursor % 5) * 5 - 10;
            this.particleSystem.spawnParticle(this.options);
        }

        this.particleSystem.update(time);
    }
});
