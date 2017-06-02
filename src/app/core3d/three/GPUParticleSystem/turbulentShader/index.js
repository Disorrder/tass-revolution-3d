var defaultOptions = {
    transparent: true,
    depthWrite: false,
    uniforms: {
        "uTime": { value: 0.0 },
        "uScale": { value: 1.0 },
        "tNoise": { value: self.particleNoiseTex },
        "tSprite": { value: self.particleSpriteTex }
    },
    blending: THREE.AdditiveBlending,
    vertexShader: GPUParticleShader.vertexShader,
    fragmentShader: GPUParticleShader.fragmentShader
}

export default class extends THREE.ShaderMaterial {
    constructor(options) {
        options = Object.assign({}, defaultOptions, options);
        super(options);
    }
}
