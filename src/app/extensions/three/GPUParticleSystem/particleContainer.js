// construct a couple small arrays used for packing variables into floats etc
var UINT8_VIEW = new Uint8Array(4);
var FLOAT_VIEW = new Float32Array(UINT8_VIEW.buffer);

function decodeFloat(x, y, z, w) {
    UINT8_VIEW[0] = Math.floor(w);
    UINT8_VIEW[1] = Math.floor(z);
    UINT8_VIEW[2] = Math.floor(y);
    UINT8_VIEW[3] = Math.floor(x);
    return FLOAT_VIEW[0]
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var r = hex >> 16;
    var g = (hex & 0x00FF00) >> 8;
    var b = hex & 0x0000FF;

    if (r > 0) r--;
    if (g > 0) g--;
    if (b > 0) b--;

    return [r, g, b];
}

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

// ------
import turbulentShader from './turbulentShader';
var textureLoader = new THREE.TextureLoader();


// Subclass for particle containers, allows for very large arrays to be spread out
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
var i; // util vars

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


        this.particleCursor = 0;
        this.time = 0; // in seconds
    	this.particleUpdate = false;

    	this.geometry = new THREE.BufferGeometry();
        this.material = new turbulentShader({}, {
            tNoise: this.particleNoiseTex,
            tSprite: this.particleSpriteTex,
        });

        // new hyper compressed attributes
    	this.particleVertices = new Float32Array(this.PARTICLE_COUNT * 3); // current position
    	this.particlePositionsStartTime = new Float32Array(this.PARTICLE_COUNT * 4); // position on start

        this.particleVelocity = new Float32Array(this.PARTICLE_COUNT * 3); // current velocity
        this.particleColor = new Float32Array(this.PARTICLE_COUNT * 3); // current color
        this.particleSize = new Float32Array(this.PARTICLE_COUNT * 1); // current size
        this.particleLifetime = new Float32Array(this.PARTICLE_COUNT * 1); // current lifetime
        // this.particleVelColSizeLife = new Float32Array(this.PARTICLE_COUNT * 4);

        // ? need to init??
    	// for (var i = 0; i < this.PARTICLE_COUNT; i++) {
    	// 	this.particlePositionsStartTime[i * 4 + 0] = 100; //x
    	// 	this.particlePositionsStartTime[i * 4 + 1] = 0; //y
    	// 	this.particlePositionsStartTime[i * 4 + 2] = 0.0; //z
    	// 	this.particlePositionsStartTime[i * 4 + 3] = 0.0; //startTime
        //
    	// 	this.particleVertices[i * 3 + 0] = 0; //x
    	// 	this.particleVertices[i * 3 + 1] = 0; //y
    	// 	this.particleVertices[i * 3 + 2] = 0.0; //z
        //
    	// 	this.particleVelColSizeLife[i * 4 + 0] = decodeFloat(128, 128, 0, 0); //vel
    	// 	this.particleVelColSizeLife[i * 4 + 1] = decodeFloat(0, 254, 0, 254); //color
    	// 	this.particleVelColSizeLife[i * 4 + 2] = 1.0; //size
    	// 	this.particleVelColSizeLife[i * 4 + 3] = 0.0; //lifespan
    	// }

    	this.geometry.addAttribute('position', new THREE.BufferAttribute(this.particleVertices, 3));
    	this.geometry.addAttribute('particlePositionsStartTime', new THREE.BufferAttribute(this.particlePositionsStartTime, 4).setDynamic(true));
    	this.geometry.addAttribute('particleVelocity', new THREE.BufferAttribute(this.particleVelocity, 3));
    	// this.geometry.addAttribute('particleVelColSizeLife', new THREE.BufferAttribute(this.particleVelColSizeLife, 4).setDynamic(true));

    	this.posStart = this.geometry.getAttribute('particlePositionsStartTime');
    	this.velCol = this.geometry.getAttribute('particleVelColSizeLife');

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

		this.posStart.array[i * 4 + 0] = position.x;
		this.posStart.array[i * 4 + 1] = position.y;
		this.posStart.array[i * 4 + 2] = position.z;
		this.posStart.array[i * 4 + 3] = this.time; // + (getRandomSpread() * 2e-2); //startTime

		if (smoothPosition === true) {
			this.posStart.array[i * 4 + 0] -= velocity.x * getRandomSpread(); //x
			this.posStart.array[i * 4 + 1] -= velocity.y * getRandomSpread(); //y
			this.posStart.array[i * 4 + 2] -= velocity.z * getRandomSpread(); //z
		}

		// var velX = velocity.x + (getRandomSpread()) * velocitySpread;
		// var velY = velocity.y + (getRandomSpread()) * velocitySpread;
		// var velZ = velocity.z + (getRandomSpread()) * velocitySpread;

		// convert turbulence rating to something we can pack into a vec4
		var turbulence = Math.floor(turbulence * 254);

		// clamp our value to between 0. and 1.
		velX = Math.floor(maxSource * ((velX - -maxVel) / (maxVel - -maxVel)));
		velY = Math.floor(maxSource * ((velY - -maxVel) / (maxVel - -maxVel)));
		velZ = Math.floor(maxSource * ((velZ - -maxVel) / (maxVel - -maxVel)));

		this.velCol.array[i * 4 + 0] = decodeFloat(velX, velY, velZ, turbulence); //vel

		var rgb = hexToRgb(color);

		for (var c = 0; c < rgb.length; c++) {
			rgb[c] = Math.floor(rgb[c] + ((getRandomSpread()) * colorSpread) * 254);
			if (rgb[c] > 254) rgb[c] = 254;
			if (rgb[c] < 0) rgb[c] = 0;
		}

		this.velCol.array[i * 4 + 1] = decodeFloat(rgb[0], rgb[1], rgb[2], 254); //color
		this.velCol.array[i * 4 + 2] = size + (getRandomSpread()) * sizeSpread; //size
		this.velCol.array[i * 4 + 3] = lifetime; //lifespan

		if (this.offset == 0) {
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
            this.particleUpdate = false;

            // if we can get away with a partial buffer update, do so
            if (this.offset + this.count < this.PARTICLE_COUNT) {
                this.posStart.updateRange.offset = this.velCol.updateRange.offset = this.offset * 4;
                this.posStart.updateRange.count = this.velCol.updateRange.count = this.count * 4;
            } else {
                this.posStart.updateRange.offset = 0;
                this.posStart.updateRange.count = this.velCol.updateRange.count = (this.PARTICLE_COUNT * 4);
            }

            this.posStart.needsUpdate = true;
            this.velCol.needsUpdate = true;

            this.offset = 0;
            this.count = 0;
        }
    }
}


THREE.GPUParticleContainer = GPUParticleContainer;
