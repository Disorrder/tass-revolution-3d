// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;

function getParams(params) {
    var defaultParams = {
        uniforms: {
            c: { type: "f", value: 0.85 },
            p: { type: "f", value: 3 },
            alpha: { type:"f", value: 0.7 },
            glowColor: { type: "c", value: new THREE.Color(0x6789af) },
            viewVector: { type: "v3", value: new THREE.Vector3(0,1,0) },
    	},
    	vertexShader:   require('./vertex.glsl'),
    	fragmentShader: require('./fragment.glsl'),
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    };

    // var uniforms = Object.assign(defaultParams.uniforms, params.uniforms);
    // return Object.assign(defaultParams, params, {uniforms});

    return Object.assign(defaultParams, params);
}

export default class Material extends THREE.ShaderMaterial {
    constructor(params) {  // get this to basic class
        params = getParams(params);
        super(params);
    }
};
