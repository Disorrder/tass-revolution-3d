var defaultOptions = {
    transparent: true,
    depthWrite: false,
    uniforms: {
        "uTime": { value: 0.0 },
        "uScale": { value: 1.0 },
        "tNoise": { value: new THREE.Texture() },
        "tSprite": { value: new THREE.Texture() }
    },
    blending: THREE.AdditiveBlending,
    vertexShader: require('./vertex.glsl'),
    fragmentShader: require('./fragment.glsl'),
}

export default class extends THREE.ShaderMaterial {
    constructor(options, uniforms = {}) {
        options = Object.assign({}, defaultOptions, options);
        
        for (let k in options.uniforms) { // map uniforms
            let v = uniforms[k];
            if (v) options.uniforms[k].value = v;
        }

        super(options);
    }
}
