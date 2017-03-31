uniform vec3 glowColor;
uniform float intensity;
uniform float power;
uniform float k;

varying vec3 vVertexNormal;
varying vec3 vVertexWorldPosition;
varying vec4 vFragColor;

void main() {
    vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;
    vec3 viewCameraToVertex = (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
    viewCameraToVertex = normalize(viewCameraToVertex);
    float opacity = pow(intensity + dot(vVertexNormal, viewCameraToVertex) * k, power);
    // float opacity = intensity - dot(vVertexNormal, viewCameraToVertex) * power;
    // opacity = pow(opacity, 3.0);

    gl_FragColor = vec4(glowColor, opacity);
}
