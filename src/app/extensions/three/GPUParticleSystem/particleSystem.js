// import 'three/examples/js/GPUParticleSystem.js';
/*
 * GPU Particle System
 * @author flimshaw - Charlie Hoey - http://charliehoey.com
 * Modified by Disorder
 */

// -- math::random --
// preload a million random numbers [-0.5, 0.5]
// const RANDOM_LENGTH = 1e6;
// var _rand = [], _randCursor;
// for (_randCursor = 0; _randCursor < RANDOM_LENGTH; _randCursor++) {
//     _rand.push( Math.random() - 0.5 );
// }
//
// function getRandomSpread() {
//     return ++_randCursor >= RANDOM_LENGTH ? _rand[_randCursor = 0] : _rand[_randCursor];
// }

function getRandomSpread() {
    return Math.random() - 0.5;
}

// ------
var textureLoader = new THREE.TextureLoader();

var defaultOptions = {
    maxParticles: 1000000,
    containerCount: 1,
    particleNoiseTex: null,
    particleSpriteTex: null
}

export default class GPUParticleSystem extends THREE.Object3D {
    constructor(options) {
        super();
        options = Object.assign({}, defaultOptions, options);

        this.PARTICLE_COUNT = options.maxParticles;
        this.PARTICLE_CONTAINERS = options.containerCount;

        this.PARTICLE_SPRITE_TEXTURE = options.particleSpriteTex;
    	this.PARTICLE_NOISE_TEXTURE = options.particleNoiseTex;

    	this.PARTICLES_PER_CONTAINER = Math.ceil(this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS);
    	this.PARTICLE_CURSOR = 0;
    	this.time = 0;
        this.particleContainers = [];

        // load textures
        var tex;
        tex = this.PARTICLE_SPRITE_TEXTURE;
        if (typeof tex === 'string') tex = textureLoader.load(tex);
        if (tex instanceof THREE.Texture) {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        }
        this.particleSpriteTex = tex;

        tex = this.PARTICLE_NOISE_TEXTURE;
        if (typeof tex === 'string') tex = textureLoader.load(tex);
        if (tex instanceof THREE.Texture) {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        }
        this.particleNoiseTex = tex;

        // define defaults for all values
    	this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [0, 0, 0, 0];
    	this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [0, 0, 0, 0];

        this.init();
    }

    init() {
		for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
			let c = new THREE.GPUParticleContainer(this.PARTICLES_PER_CONTAINER, this);
			this.particleContainers.push(c);
			this.add(c);
		}
	};

    update(time) {
        for (var i = 0; i < this.PARTICLE_CONTAINERS; i++) {
            this.particleContainers[i].update(time);
        }
    };


    spawnParticle(options) {
		this.PARTICLE_CURSOR++;
		if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) {
			this.PARTICLE_CURSOR = 1;
		}

		var container = this.particleContainers[this.PARTICLE_CURSOR % this.this.particleContainers.length];
		container.spawnParticle(options);
	};

}
