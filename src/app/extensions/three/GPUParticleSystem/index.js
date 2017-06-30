// some another utils
function getRandomSpread() {
    return Math.random() - 0.5;
}

function spreadVector3(vec, spread) {
    vec.x += spread.x * getRandomSpread();
    vec.y += spread.y * getRandomSpread();
    vec.z += spread.z * getRandomSpread();
    return vec;
}

function spreadColor(color, spread) {
    spread *= getRandomSpread();
    color.r += color.r * spread;
    color.g += color.g * spread;
    color.b += color.b * spread;
    return color;
}

import particleShader from './physicalShader';
var textureLoader = new THREE.TextureLoader();

var position = new THREE.Vector3();
var positionSpread = new THREE.Vector3();
var velocity = new THREE.Vector3();
var velocitySpread = new THREE.Vector3();
var acceleration = new THREE.Vector3();
var accelerationSpread = new THREE.Vector3();
var color = new THREE.Color();
var colorSpread = 1.0;
var opacity = 1.0;
var turbulence = 1.0;
var lifetime = 5.0;
var size = 10.0;
var sizeSpread = 0.0;
var smoothPosition = false;
var i, attr; // util vars

export default class GPUParticleSystem extends THREE.Object3D {
    constructor(options, particleOptions) {
        super();

        this.DPR = window.devicePixelRatio || 1;
        if (this.DPR === 4) this.DPR = 1; // SGS7 issue

        this.maxParticles = options.maxParticles || 1e5;
        this.particleNoiseTex = options.particleNoiseTex;
        this.particleSpriteTex = options.particleSpriteTex;

        this.particleOptions = {
            position: new THREE.Vector3(),
            positionSpread: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            velocitySpread: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            accelerationSpread: new THREE.Vector3(),
            color: 0xffffff,
            colorSpread: 1.,
            opacity: 1.,
            turbulence: 1.,
            lifetime: 5.,
            size: 10.,
            sizeSpread: 0.,
            smoothPosition: false,
        };
        Object.assign(this.particleOptions, particleOptions);


        this.PARTICLE_CURSOR = this.particleCursor = 0;
        this.time = 0; // in seconds
    	this.particleUpdate = false;

    	this.geometry = new THREE.BufferGeometry();
        this.material = new particleShader();
        this.material.uniforms.tSprite.value = this.particleSpriteTex;

        // TODO: pack some of this attributes into one vec4 or smth like this
        this.attributesMeta = [
            { name: 'position', constr: Float32Array, size: 3, dynamic: false },
            { name: 'particlePositionTime', constr: Float32Array, size: 4, dynamic: true },
            { name: 'particleVelocity',     constr: Float32Array, size: 3, dynamic: true },
            { name: 'particleAcceleration', constr: Float32Array, size: 3, dynamic: true },
            { name: 'particleColor',        constr: Float32Array, size: 4, dynamic: true },
            { name: 'particleSize',         constr: Float32Array, size: 1, dynamic: true },
            { name: 'particleLifetime',     constr: Float32Array, size: 1, dynamic: true },
        ]

        // init attributes
        this.attributesMeta.forEach((v) => {
            let arr = new v.constr(this.maxParticles * v.size);
            let attr = new THREE.BufferAttribute(arr, v.size);
            if (v.dynamic) attr.setDynamic(true);
            this.geometry.addAttribute(v.name, attr);
        });

    	this.offset = 0;
    	this.count = 0;

        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.particleSystem.frustumCulled = false;
        this.add(this.particleSystem);
    }

    spawnParticle(options) {
		// setup reasonable default values for all arguments
        position.copy( options.position || this.particleOptions.position );
        positionSpread.copy( options.positionSpread || this.particleOptions.positionSpread );
        velocity.copy( options.velocity || this.particleOptions.velocity );
        velocitySpread.copy( options.velocitySpread || this.particleOptions.velocitySpread );
        acceleration.copy( options.acceleration || this.particleOptions.acceleration );
        accelerationSpread.copy( options.accelerationSpread || this.particleOptions.accelerationSpread );
        color.set( options.color || this.particleOptions.color );

        colorSpread = options.colorSpread || this.particleOptions.colorSpread;
        opacity = options.opacity || this.particleOptions.opacity;
        turbulence = options.turbulence || this.particleOptions.turbulence;
        lifetime = options.lifetime || this.particleOptions.lifetime;
        size = options.size || this.particleOptions.size;
        sizeSpread = options.sizeSpread || this.particleOptions.sizeSpread;
        smoothPosition = options.smoothPosition || this.particleOptions.smoothPosition;

        spreadVector3(position, positionSpread);
        spreadVector3(velocity, velocitySpread);
        spreadVector3(acceleration, accelerationSpread);
        spreadColor(color, colorSpread);
        size += sizeSpread * getRandomSpread();
        size *= this.DPR;

        i = this.PARTICLE_CURSOR;

        attr = this.geometry.getAttribute('particlePositionTime');
		attr.array[i * 4 + 0] = position.x;
		attr.array[i * 4 + 1] = position.y;
		attr.array[i * 4 + 2] = position.z;
		attr.array[i * 4 + 3] = this.time; // + (getRandomSpread() * 2e-2); //startTime

        attr = this.geometry.getAttribute('particleVelocity');
        attr.array[i * 3 + 0] = velocity.x;
        attr.array[i * 3 + 1] = velocity.y;
        attr.array[i * 3 + 2] = velocity.z;

        attr = this.geometry.getAttribute('particleAcceleration');
        attr.array[i * 3 + 0] = acceleration.x;
        attr.array[i * 3 + 1] = acceleration.y;
        attr.array[i * 3 + 2] = acceleration.z;

        attr = this.geometry.getAttribute('particleColor');
        attr.array[i * 4 + 0] = color.r;
        attr.array[i * 4 + 1] = color.g;
        attr.array[i * 4 + 2] = color.b;
        attr.array[i * 4 + 3] = opacity;

        attr = this.geometry.getAttribute('particleSize');
        attr.array[i * 1 + 0] = size;

        attr = this.geometry.getAttribute('particleLifetime');
        attr.array[i * 1 + 0] = lifetime;


		if (this.offset === 0) { // ===
			this.offset = this.PARTICLE_CURSOR;
		}
		this.count++;

		this.PARTICLE_CURSOR++;
		if (this.PARTICLE_CURSOR >= this.maxParticles) {
			this.PARTICLE_CURSOR = 0;
		}

		this.particleUpdate = true;
	}

    update(time) {
        this.time = time;
        this.material.uniforms['uTime'].value = time;
        this.geometryUpdate();
    }

    geometryUpdate() {
        if (this.particleUpdate == true) {
            this.attributesMeta.forEach((v) => {
                let attr = this.geometry.getAttribute(v.name);
                if (this.offset + this.count < this.maxParticles) {
                    attr.updateRange.offset = attr.updateRange.offset = this.offset * v.size;
                    attr.updateRange.count = attr.updateRange.count = this.count * v.size;
                } else {
                    attr.updateRange.offset = 0;
                    attr.updateRange.count = attr.updateRange.count = (this.maxParticles * v.size);
                }
                attr.needsUpdate = true;
            });

            this.particleUpdate = false;
            this.offset = 0;
            this.count = 0;
        }
    }
}

// THREE.GPUParticleSystem = GPUParticleSystem;
