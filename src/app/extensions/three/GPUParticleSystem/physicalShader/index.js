export default class extends THREE.ShaderMaterial {
    constructor(options) {
        var defaultOptions = {
            transparent: true,
            depthWrite: false,
            uniforms: {
                "uTime": { value: 0.0 },
                "uScale": { value: 1.0 },
                "tSprite": { value: new THREE.Texture() }
            },
            defines: {
                HAS_PERSPECTIVE: true,
                PERSPECTIVE_DPU: 300.0,
                EASE_IN: 0.3,
                EASE_OUT: 0.7,
            },
            blending: THREE.AdditiveBlending,
            vertexShader:   require('./vertex.glsl'),
            fragmentShader: require('./fragment.glsl'),
        }

        options = Object.assign(defaultOptions, options);
        super(options);
    }
}
