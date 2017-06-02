uniform vec3 _color;
uniform float _opacity;
uniform float _radius;

varying vec3 vColor;
varying float vRadius;

void main() {
    vec3 color = vColor;
    // float opacity = _opacity * vOpacity;
    // float radius = vRadius;
    float radius = 1.0;

    vec2 uvc = (gl_PointCoord - 0.5) * 2.0; // actually is 2.0
    vec2 uvc2 = uvc * uvc;
    float r = 1.0 - sqrt(uvc2.x + uvc2.y) / radius;

    gl_FragColor = vec4(color, r);
}
