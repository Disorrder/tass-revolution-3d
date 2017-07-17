uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float amount;
uniform float border;
uniform vec3 borderColor;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(map, vUv);
    vec4 alphaColor = texture2D(alphaMap, vUv);

    if (alphaColor.r < amount) {
        alphaColor.a = 0.0;
    } else {
        float modifier = 1.0 - amount * 1.1;
        alphaColor += modifier;
        alphaColor = clamp(alphaColor, 0.0, 1.0);
        if (alphaColor.r < 1.0) {
            // TODO: realistic fire gradient
            // float diff = 1.0 / (1.0 - amount);
            // alphaColor = (alphaColor - amount) * diff;
            alphaColor.rgb *= borderColor;
        }
    }

    // gl_FragColor = vec4(color.rgb, color.a * displayPixel);
    gl_FragColor = color * alphaColor;
}
