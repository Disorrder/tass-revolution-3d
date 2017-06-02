const defaultOptions = {
    size: 1,
    color: 'orange',
    opacity: 1,
    displayRadius: 1,
}

export default class extends THREE.ShaderMaterial {
    constructor(options) {
        options = Object.assign({}, defaultOptions, options);

        super({
            uniforms: {
                size: {
                    type: "f",
                    value: options.size
                },
                color: {
                    type: "c",
                    value: new THREE.Color(options.color)
                },
                opacity: {
                    type: "f",
                    value: options.opacity
                },
                radius: {
                    type: "f",
                    value: options.radius
                },
                runTime: {
                    type: "f",
                    value: 0
                },
                deltaTime: {
                    type: "f",
                    value: 0
                }
            },
            vertexShader: require('./vertex.glsl'),
            fragmentShader: require('./fragment.glsl'),
            //blending: THREE.AdditiveBlending,
            // shading: THREE.FlatShading,
            transparent: true,
            depthWrite: false,
        });
    }
}
