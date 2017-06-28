float scaleLinear(float value, vec2 valueDomain) {
    return (value - valueDomain.x) / (valueDomain.y - valueDomain.x);
}

float scaleLinear(float value, vec2 valueDomain, vec2 valueRange) {
    return mix(valueRange.x, valueRange.y, scaleLinear(value, valueDomain));
}

varying vec4 vColor;
uniform sampler2D tSprite;

void main() {
    float opacity = vColor.a;

    vec4 tex = texture2D( tSprite, gl_PointCoord );
    gl_FragColor = tex * vColor;
}
