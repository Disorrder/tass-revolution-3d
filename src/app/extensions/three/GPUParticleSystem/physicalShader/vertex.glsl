precision highp float;

uniform float uTime;
uniform float uScale;
// uniform sampler2D tNoise;

attribute vec4 particlePositionTime;
attribute vec3 particleVelocity;
attribute vec3 particleAcceleration;
attribute vec4 particleColor;
attribute float particleSize;
attribute float particleLifetime;

varying vec4 vColor;
float lifeLeft;

#define EASE_IN 0.3

void main() {
    vColor = particleColor;

    vec3 newPosition = vec3(particlePositionTime.xyz);
    float timeElapsed = uTime - particlePositionTime.w;
    float currentTime = timeElapsed / particleLifetime;
    lifeLeft = 1. - currentTime;

    float pointSize = 0.;

    if (currentTime > 0. && currentTime < 1.) {
        newPosition += (particleVelocity + particleAcceleration * timeElapsed) * timeElapsed;
        vColor.a *= lifeLeft;
        pointSize = uScale * particleSize * lifeLeft;
    } else {
        newPosition = position;
        lifeLeft = 0.;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

    // Determine perspective
    #ifdef HAS_PERSPECTIVE
        float perspective = float(PERSPECTIVE_DPU) / length( gl_Position.xyz );
    #else
        float perspective = 1.0;
    #endif

    if (currentTime < EASE_IN) { // appear easing
        perspective *= currentTime / EASE_IN;
        // vColor.a *= currentTime / EASE_IN;
    }

    gl_PointSize = perspective * pointSize;
    // gl_PointSize = 0;
}
