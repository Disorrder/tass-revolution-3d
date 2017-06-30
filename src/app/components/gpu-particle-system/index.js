import ParticleSystem from 'app/extensions/three/GPUParticleSystem';
import presets from './presets';

var textureLoader = new THREE.TextureLoader();

var schema = {
    spawnEnabled: { type: 'boolean', default: true },
    preset: { type: 'string', default: 'default',
        // oneOf: ['default', 'test']
    },

    maxParticles: { type: 'number' },
    spawnRate: { type: 'number' },
    texture: { type: 'map' },
    // texture: { type: 'map' },
    perspective: { type: 'boolean' },
    easeIn: { type: 'number' },
    easeOut: { type: 'number' },

    position: { type: 'vec3' },
    positionSpread: { type: 'vec3' },
    velocity: { type: 'vec3' },
    velocitySpread: { type: 'vec3' },
    acceleration: { type: 'vec3' },
    accelerationSpread: { type: 'vec3' },
    color: { type: 'color' },
    colorSpread: { type: 'number' },
    opacity: { type: 'number' },
    lifetime: { type: 'number' },
    size: { type: 'number' },
    sizeSpread: { type: 'number' },
};

{
    let preset = presets[schema.preset.default];
    for (let k in preset) {
        schema[k].default = preset[k];
    }
}

AFRAME.registerComponent('gpu-particle-system', {
    schema,

    init() {
        this.options = {
            maxParticles: this.data.maxParticles,
            particleSpriteTex: textureLoader.load(this.data.texture),
        }

        this.particleOptions = {};
        this.particleOptionsKeys = [
            'position', 'positionSpread',
            'velocity', 'velocitySpread',
            'acceleration', 'accelerationSpread',
            'color', 'colorSpread', 'opacity',
            'lifetime', 'size', 'sizeSpread'
        ];

        this.particleOptionsKeys.forEach((option) => this.particleOptions[option] = this.data[option])

        this.particleSystem = new ParticleSystem(this.options, this.particleOptions);

        this._particleCursor = 0;
        this._spawnDt = 0;
        this._spawnLastTime = 0;
        this.timeScale = 1; // not implemented

        this.el.setObject3D('particle-system', this.particleSystem);
    },

    update(oldData) {
        if (_.isEmpty(oldData)) oldData = presets.default;
        var diff = AFRAME.utils.diff(oldData, this.data);
        // aframe's diff doesn't check vectors, but return Object. So do it again.
        // See: https://github.com/aframevr/aframe/blob/master/src/utils/index.js#L180
        for (let k in diff) {
            let v = diff[k];
            let oldVal = oldData[k];
            if (oldVal && oldVal.equals && oldVal.equals(v)) {
                delete diff[k];
            }
        }

        if (diff.preset && presets[diff.preset]) {
            let preset = presets[diff.preset];
            diff = Object.assign({}, preset, diff);
        }

        if (this.particleSystem) {
            if (diff.maxParticles) this.particleSystem.maxParticles = diff.maxParticles;
            if (diff.perspective != null) this.particleSystem.material.defines.HAS_PERSPECTIVE = diff.perspective;
            if (diff.easeIn != null) this.particleSystem.material.defines.EASE_IN = diff.easeIn;
            if (diff.easeOut != null) this.particleSystem.material.defines.EASE_OUT = diff.easeOut;
            // console.log(diff, diff.easeIn, this.particleSystem.material.defines);
        }

        if (diff.spawnRate) this._spawnTimeInterval = 1 / diff.spawnRate;
        if (diff.maxParticles) this.options.maxParticles = diff.maxParticles;

        this.particleOptionsKeys.forEach((option) => {
            if (diff[option] != null) {
                this.particleOptions[option] = diff[option];
            }
        });
    },

    spawnParticle(options = this.particleOptions) {
        this.particleSystem.spawnParticle(this.particleOptions);
    },

    _tick(time, dt) { // pulse
        time /= 1000; dt /= 1000;

        if (this.data.spawnEnabled) {
            if (time - this._spawnLastTime >= this.particleOptions.lifetime) {
                for (let i = 0; i < this.particleSystem.maxParticles; i++) {
                    this.particleSystem.spawnParticle(this.particleOptions);
                }
                this._spawnLastTime = time;
            }
        }

        this.particleSystem.update(time);
    },

    tick(time, dt) { // flow
        time /= 1000; dt /= 1000;
        if (!this._spawnLastTime) return this._spawnLastTime = time;

        if (this.data.spawnEnabled) {
            this._spawnDt = time - this._spawnLastTime;

            for ( this._spawnLastTime; this._spawnLastTime <= time-this._spawnTimeInterval; this._spawnLastTime += this._spawnTimeInterval ) {
                this.particleSystem.spawnParticle(this.particleOptions);
            }
        }

        this.particleSystem.update(time);
    },

    setPreset(name) {
        Object.assign(this.data, presets[name]);
        this.update();
    },
});
