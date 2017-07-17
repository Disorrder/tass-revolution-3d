export default class Material extends THREE.ShaderMaterial {
    constructor(params) {
        var defaultParams = {
            uniforms: {
                map: { type: "t", value: new THREE.Texture() },
                alphaMap: { type: "t", value: new THREE.Texture() },
                amount: { type: "f", value: 0 },
                border: { type: "f", value: 0.09 },
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
