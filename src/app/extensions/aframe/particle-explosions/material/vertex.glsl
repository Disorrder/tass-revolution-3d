#define PACKED_COLOR_SIZE 256.0
#define PACKED_COLOR_DIVISOR 255.0

attribute vec4 params;
attribute vec4 color;
attribute float size;
attribute float radius;

varying vec3 vColor;
varying float vRadius;

vec3 unpackColor(in float hex) {
    vec3 c = vec3( 0.0 );

    float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );
    float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );
    float b = mod( hex, PACKED_COLOR_SIZE );

    c.r = r / PACKED_COLOR_DIVISOR;
    c.g = g / PACKED_COLOR_DIVISOR;
    c.b = b / PACKED_COLOR_DIVISOR;

    return c;
}

void main() {
    vColor = unpackColor(color.x);
    vRadius = radius;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * 300.0 / -mvPosition.z; // perspective size, 300px per unit
    gl_Position = projectionMatrix * mvPosition;
}
