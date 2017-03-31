export default class GlowMaterial extends THREE.ShaderMaterial {
    constructor(offset = 0, intensity = 1, power = 3, glowColor = 'orange') {
        super({
            uniforms: {
                offset: {
                    type: "f",
                    value: offset
                },
                intensity: {
                    type: "f",
                    value: intensity
                },
                power: {
                    type: "f",
                    value: power
                },
                glowColor: {
                    type: "c",
                    value: new THREE.Color(glowColor)
                },
            },
            vertexShader: require('./vertex.glsl'),
            fragmentShader: require('./fragment.glsl'),
            //blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
    }
}
