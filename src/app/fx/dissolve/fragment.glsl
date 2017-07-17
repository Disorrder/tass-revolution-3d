uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float amount;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(map, vUv);
    vec4 alphaColor = texture2D(alphaMap, vUv);

    if (alphaColor.r >= 1.0 - amount) {
        color.a = 0.0;
    }

    gl_FragColor = color;
}
