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

import turbulentShader from './turbulentShader';
var textureLoader = new THREE.TextureLoader();


var defaultOptions = { //?
    maxParticles: 1e5,
    particleNoiseTex: null, // new THREE.Texture(),
    particleSpriteTex: null, // new THREE.Texture(),
};

var defaultParticleOptions = { //?
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(), // not implemented
    positionSpread: new THREE.Vector3(),
    velocitySpread: new THREE.Vector3(),
    accelerationSpread: new THREE.Vector3(), // not implemented
    color: 0xffffff,
    colorSpread: 1.,
    turbulence: 1.,
    lifetime: 5.,
    size: 10.,
    sizeSpread: 0.,
    smoothPosition: false,
}

var position = new THREE.Vector3();
var velocity = new THREE.Vector3();
var acceleration = new THREE.Vector3(); // not implemented
var positionSpread = new THREE.Vector3();
var velocitySpread = new THREE.Vector3();
var accelerationSpread = new THREE.Vector3(); // not implemented
var color = new THREE.Color();
var colorSpread = 1.0;
var turbulence = 1.0;
var lifetime = 5.0;
var size = 10.0;
var sizeSpread = 0.0;
var smoothPosition = false;
var i, attr; // util vars

//?
var maxVel = 2;
var maxSource = 250;

export default class GPUParticleContainer extends THREE.Object3D {
    constructor(options, particleOptions) {
        super();

        this.DPR = window.devicePixelRatio || 1;

        this.PARTICLE_COUNT = options.maxParticles || 1e5; //?
        this.maxParticles = options.maxParticles || 1e5;
        this.particleNoiseTex = options.particleNoiseTex;
        this.particleSpriteTex = options.particleSpriteTex;

        this.particleOptions = {
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(), // not implemented
            positionSpread: new THREE.Vector3(),
            velocitySpread: new THREE.Vector3(),
            accelerationSpread: new THREE.Vector3(), // not implemented
            color: 0xffffff,
            colorSpread: 1.,
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
        this.material = new turbulentShader({}, {
            tNoise: this.particleNoiseTex,
            tSprite: this.particleSpriteTex,
        });


        this.attributesMeta = [
            { name: 'position', constr: Float32Array, size: 3, dynamic: false },
            { name: 'particlePositionTime', constr: Float32Array, size: 4, dynamic: true },
            { name: 'particleVelocity',     constr: Float32Array, size: 3, dynamic: false },
            { name: 'particleColor',        constr: Float32Array, size: 3, dynamic: false },
            { name: 'particleSize',         constr: Float32Array, size: 1, dynamic: false },
            { name: 'particleLifetime',     constr: Float32Array, size: 1, dynamic: false },
        ]

        // init attributes
        this.attributesMeta.forEach((v) => {
            let arr = new v.constr(this.PARTICLE_COUNT * v.size);
            let attr = new THREE.BufferAttribute(arr, v.size);
            if (v.dynamic) attr.setDynamic(true);
            this.geometry.addAttribute(v.name, attr);
        });

        // this.attributes = {
        //     position: new Float32Array(this.PARTICLE_COUNT * 3),
        //     particlePositionTime: new Float32Array(this.PARTICLE_COUNT * 4),
        //     particleVelocity: new Float32Array(this.PARTICLE_COUNT * 3),
        //     particleColor: new Float32Array(this.PARTICLE_COUNT * 3),
        //     particleSize: new Float32Array(this.PARTICLE_COUNT * 1),
        //     particleLifetime: new Float32Array(this.PARTICLE_COUNT * 1),
        // };

        // for (let k in this.attributes) {
        //     let v = this.attributes[k];
        //     this.attributes[k] = new THREE.BufferAttribute(v, v.length / this.PARTICLE_COUNT);
        //     this.geometry.addAttribute(k, this.attributes[k]);
        // }
        // this.attributes.particlePositionTime.setDynamic(true);


    	// this.particleVertices = new Float32Array(this.PARTICLE_COUNT * 3); // current position
    	// this.particlePositionsStartTime = new Float32Array(this.PARTICLE_COUNT * 4); // position on start
        //
        // this.particleVelocity = new Float32Array(this.PARTICLE_COUNT * 3); // current velocity
        // this.particleColor = new Float32Array(this.PARTICLE_COUNT * 3); // current color
        // this.particleSize = new Float32Array(this.PARTICLE_COUNT * 1); // current size
        // this.particleLifetime = new Float32Array(this.PARTICLE_COUNT * 1); // current lifetime
        // // this.particleVelColSizeLife = new Float32Array(this.PARTICLE_COUNT * 4);
        //
    	// this.geometry.addAttribute('position', new THREE.BufferAttribute(this.particleVertices, 3));
    	// this.geometry.addAttribute('particlePositionsStartTime', new THREE.BufferAttribute(this.particlePositionsStartTime, 4).setDynamic(true));
        //
        // this.geometry.addAttribute('particleVelocity', new THREE.BufferAttribute(this.particleVelocity, 3));
    	// this.geometry.addAttribute('particleColor', new THREE.BufferAttribute(this.particleColor, 3));
    	// this.geometry.addAttribute('particleSize', new THREE.BufferAttribute(this.particleSize, 1));
    	// this.geometry.addAttribute('particleLifetime', new THREE.BufferAttribute(this.particleLifetime, 1));
    	// // this.geometry.addAttribute('particleVelColSizeLife', new THREE.BufferAttribute(this.particleVelColSizeLife, 4).setDynamic(true));
        //
    	// this.posStart = this.geometry.getAttribute('particlePositionsStartTime');
    	// this.velocity = this.geometry.getAttribute('particleVelocity');
    	// this.color = this.geometry.getAttribute('particleColor');
    	// this.size = this.geometry.getAttribute('particleSize');
    	// this.lifetime = this.geometry.getAttribute('particleLifetime');
        //
    	// // this.velCol = this.geometry.getAttribute('particleVelColSizeLife');

    	this.offset = 0;
    	this.count = 0;

        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.particleSystem.frustumCulled = false;
        this.add(this.particleSystem);
    }

    spawnParticle(options) {
		// setup reasonable default values for all arguments
        position.copy( options.position || this.particleOptions.position );
        velocity.copy( options.velocity || this.particleOptions.velocity );
        positionSpread.copy( options.positionSpread || this.particleOptions.positionSpread );
        velocitySpread.copy( options.velocitySpread || this.particleOptions.velocitySpread );
        color.set( options.color || this.particleOptions.color );

        colorSpread = options.colorSpread || this.particleOptions.colorSpread;
        turbulence = options.turbulence || this.particleOptions.turbulence;
        lifetime = options.lifetime || this.particleOptions.lifetime;
        size = options.size || this.particleOptions.size;
        sizeSpread = options.sizeSpread || this.particleOptions.sizeSpread;
        smoothPosition = options.smoothPosition || this.particleOptions.smoothPosition;

        spreadVector3(position, positionSpread);
        spreadVector3(velocity, velocitySpread);
        color.multiplyScalar( colorSpread * getRandomSpread() );
        size += sizeSpread * getRandomSpread();
        size *= this.DPR;


        i = this.PARTICLE_CURSOR;

        attr = this.geometry.getAttribute('particlePositionTime');
		attr.array[i * 4 + 0] = position.x;
		attr.array[i * 4 + 1] = position.y;
		attr.array[i * 4 + 2] = position.z;
		attr.array[i * 4 + 3] = this.time; // + (getRandomSpread() * 2e-2); //startTime

		// if (smoothPosition === true) {
		// 	attr.array[i * 4 + 0] -= velocity.x * getRandomSpread(); //x
		// 	attr.array[i * 4 + 1] -= velocity.y * getRandomSpread(); //y
		// 	attr.array[i * 4 + 2] -= velocity.z * getRandomSpread(); //z
		// }

        attr = this.geometry.getAttribute('particleVelocity');
        attr.array[i * 3 + 0] = velocity.x;
        attr.array[i * 3 + 1] = velocity.y;
        attr.array[i * 3 + 2] = velocity.z;

        attr = this.geometry.getAttribute('particleColor');
        attr.array[i * 3 + 0] = color.r;
        attr.array[i * 3 + 1] = color.g;
        attr.array[i * 3 + 2] = color.b;

        attr = this.geometry.getAttribute('particleSize');
        attr.array[i * 1 + 0] = size;

        attr = this.geometry.getAttribute('particleLifetime');
        attr.array[i * 1 + 0] = lifetime;

        // console.log('spawn', i, this.time, position, velocity, color, size, lifetime);


		if (this.offset == 0) { //===
			this.offset = this.PARTICLE_CURSOR;
		}
		this.count++;

		this.PARTICLE_CURSOR++;
		if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) {
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
            // if we can get away with a partial buffer update, do so !!thin place!!
            attr = this.geometry.getAttribute('particlePositionTime');
            if (this.offset + this.count < this.PARTICLE_COUNT) {
                attr.updateRange.offset = attr.updateRange.offset = this.offset * 4;
                attr.updateRange.count = attr.updateRange.count = this.count * 4;
            } else {
                attr.updateRange.offset = 0;
                attr.updateRange.count = attr.updateRange.count = (this.PARTICLE_COUNT * 4);
            }

            attr.needsUpdate = true;
            // this.velCol.needsUpdate = true;

            this.particleUpdate = false;
            this.offset = 0;
            this.count = 0;
        }
    }
}


THREE.GPUParticleContainer = GPUParticleContainer;
