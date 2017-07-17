export default class Material extends THREE.ShaderMaterial {
    constructor(params) {
        var defaultParams = {
            uniforms: {
                map: { type: "t", value: new THREE.Texture() },
                alphaMap: { type: "t", value: new THREE.Texture() },
                amount: { type: "f", value: 0 },
                borderScale: { type: "f", value: 1.05 },
                borderColor: { type: "c", value: new THREE.Color('#f41') },
        	},
        	vertexShader:   require('./vertex.glsl'),
        	fragmentShader: require('./fragment.glsl'),
            transparent: true,
        };

        params = Object.assign(defaultParams, params);
        super(params);
    }

    get map() { return this.uniforms.map.value; }
    set map(v) { this.uniforms.map.value = v; }
};
