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
float lifeLeft = 0.;

void main() {
    vColor = particleColor;

    vec3 newPosition = vec3(particlePositionTime.xyz);
    float timeElapsed = uTime - particlePositionTime.w;
    float currentTime = timeElapsed / particleLifetime;

    float pointSize = 0.;

    if (currentTime > 0. && currentTime < 1.) {
        lifeLeft = 1. - currentTime;
        newPosition += (particleVelocity + particleAcceleration * timeElapsed) * timeElapsed;
        pointSize = uScale * particleSize;// * lifeLeft;
    } else {
        newPosition = position;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

    // Determine perspective
    #ifdef HAS_PERSPECTIVE
        float perspective = float(PERSPECTIVE_DPU) / length( gl_Position.xyz );
    #else
        float perspective = 1.0;
    #endif

    #ifdef EASE_IN
        float easeIn = 0.;
        if (currentTime < EASE_IN) { // appear easing
            easeIn = currentTime / EASE_IN;
            perspective *= easeIn;
        }
    #endif

    #ifdef EASE_OUT
        float easeOut = 0.;
        if (currentTime > EASE_OUT) { // disappear easing
            easeOut = lifeLeft / (1.0 - EASE_OUT);
            vColor.a *= easeOut;
            perspective *= easeOut;
        }
    #endif

    gl_PointSize = perspective * pointSize;
    // gl_PointSize = 0;
}
