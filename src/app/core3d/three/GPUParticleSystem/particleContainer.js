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


// Subclass for particle containers, allows for very large arrays to be spread out

var defaultOptions = {
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    positionRandomness: 0.,
    velocityRandomness: 0.,
    color: 0xffffff,
    colorRandomness: 1.,
    turbulence: 1.,
    lifetime: 5.,
    size: 10.,
    sizeRandomness: 0.,
    smoothPosition: false,
}

export default class GPUParticleContainer extends THREE.Object3D {
    constructor(maxParticles, particleSystem) {
        super();

        this.PARTICLE_COUNT = maxParticles || 100000;
        this.PARTICLE_CURSOR = 0;
        this.time = 0;
        this.DPR = window.devicePixelRatio;
        this.GPUParticleSystem = particleSystem;

        var particlesPerArray = Math.floor(this.PARTICLE_COUNT / this.MAX_ATTRIBUTES);

        this.particles = [];
    	this.deadParticles = [];
    	this.particlesAvailableSlot = [];

    	// create a container for particles
    	this.particleUpdate = false;

    	// Shader Based Particle System
    	this.particleShaderGeo = new THREE.BufferGeometry();

    	// new hyper compressed attributes
    	this.particleVertices = new Float32Array(this.PARTICLE_COUNT * 3); // position
    	this.particlePositionsStartTime = new Float32Array(this.PARTICLE_COUNT * 4); // position
    	this.particleVelColSizeLife = new Float32Array(this.PARTICLE_COUNT * 4);

    	for (var i = 0; i < this.PARTICLE_COUNT; i++) {
    		this.particlePositionsStartTime[i * 4 + 0] = 100; //x
    		this.particlePositionsStartTime[i * 4 + 1] = 0; //y
    		this.particlePositionsStartTime[i * 4 + 2] = 0.0; //z
    		this.particlePositionsStartTime[i * 4 + 3] = 0.0; //startTime

    		this.particleVertices[i * 3 + 0] = 0; //x
    		this.particleVertices[i * 3 + 1] = 0; //y
    		this.particleVertices[i * 3 + 2] = 0.0; //z

    		this.particleVelColSizeLife[i * 4 + 0] = decodeFloat(128, 128, 0, 0); //vel
    		this.particleVelColSizeLife[i * 4 + 1] = decodeFloat(0, 254, 0, 254); //color
    		this.particleVelColSizeLife[i * 4 + 2] = 1.0; //size
    		this.particleVelColSizeLife[i * 4 + 3] = 0.0; //lifespan
    	}

    	this.particleShaderGeo.addAttribute('position', new THREE.BufferAttribute(this.particleVertices, 3));
    	this.particleShaderGeo.addAttribute('particlePositionsStartTime', new THREE.BufferAttribute(this.particlePositionsStartTime, 4).setDynamic(true));
    	this.particleShaderGeo.addAttribute('particleVelColSizeLife', new THREE.BufferAttribute(this.particleVelColSizeLife, 4).setDynamic(true));

    	this.posStart = this.particleShaderGeo.getAttribute('particlePositionsStartTime');
    	this.velCol = this.particleShaderGeo.getAttribute('particleVelColSizeLife');

    	this.particleShaderMat = this.GPUParticleSystem.particleShaderMat;

        var maxVel = 2;
    	var maxSource = 250;
    	this.offset = 0;
    	this.count = 0;
    }

    init() {
        this.particleSystem = new THREE.Points(this.particleShaderGeo, this.particleShaderMat);
        this.particleSystem.frustumCulled = false;
        this.add(this.particleSystem);
    }

    __position = new THREE.Vector3()
    __velocity = new THREE.Vector3()
    spawnParticle(options) {
		// setup reasonable default values for all arguments
        // options = Object.assign({}, defaultOptions, options)
		position = options.position !== undefined ? position.copy(options.position) : position.set(0., 0., 0.);
		velocity = options.velocity !== undefined ? velocity.copy(options.velocity) : velocity.set(0., 0., 0.);
		positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0.0;
		velocityRandomness = options.velocityRandomness !== undefined ? options.velocityRandomness : 0.0;
		color = options.color !== undefined ? options.color : 0xffffff;
		colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 1.0;
		turbulence = options.turbulence !== undefined ? options.turbulence : 1.0;
		lifetime = options.lifetime !== undefined ? options.lifetime : 5.0;
		size = options.size !== undefined ? options.size : 10;
		sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0.0;
		smoothPosition = options.smoothPosition !== undefined ? options.smoothPosition : false;

		if (this.DPR !== undefined) size *= this.DPR;

		i = this.PARTICLE_CURSOR;

		this.posStart.array[i * 4 + 0] = position.x + ((particleSystem.random()) * positionRandomness); // - ( velocity.x * particleSystem.random() ); //x
		this.posStart.array[i * 4 + 1] = position.y + ((particleSystem.random()) * positionRandomness); // - ( velocity.y * particleSystem.random() ); //y
		this.posStart.array[i * 4 + 2] = position.z + ((particleSystem.random()) * positionRandomness); // - ( velocity.z * particleSystem.random() ); //z
		this.posStart.array[i * 4 + 3] = this.time + (particleSystem.random() * 2e-2); //startTime

		if (smoothPosition === true) {
			this.posStart.array[i * 4 + 0] += -(velocity.x * particleSystem.random()); //x
			this.posStart.array[i * 4 + 1] += -(velocity.y * particleSystem.random()); //y
			this.posStart.array[i * 4 + 2] += -(velocity.z * particleSystem.random()); //z
		}

		var velX = velocity.x + (particleSystem.random()) * velocityRandomness;
		var velY = velocity.y + (particleSystem.random()) * velocityRandomness;
		var velZ = velocity.z + (particleSystem.random()) * velocityRandomness;

		// convert turbulence rating to something we can pack into a vec4
		var turbulence = Math.floor(turbulence * 254);

		// clamp our value to between 0. and 1.
		velX = Math.floor(maxSource * ((velX - -maxVel) / (maxVel - -maxVel)));
		velY = Math.floor(maxSource * ((velY - -maxVel) / (maxVel - -maxVel)));
		velZ = Math.floor(maxSource * ((velZ - -maxVel) / (maxVel - -maxVel)));

		this.velCol.array[i * 4 + 0] = decodeFloat(velX, velY, velZ, turbulence); //vel

		var rgb = hexToRgb(color);

		for (var c = 0; c < rgb.length; c++) {
			rgb[c] = Math.floor(rgb[c] + ((particleSystem.random()) * colorRandomness) * 254);
			if (rgb[c] > 254) rgb[c] = 254;
			if (rgb[c] < 0) rgb[c] = 0;
		}

		this.velCol.array[i * 4 + 1] = decodeFloat(rgb[0], rgb[1], rgb[2], 254); //color
		this.velCol.array[i * 4 + 2] = size + (particleSystem.random()) * sizeRandomness; //size
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
        this.particleShaderMat.uniforms['uTime'].value = time;
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
