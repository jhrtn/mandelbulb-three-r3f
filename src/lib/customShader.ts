export const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vRandom;

uniform float uTime;
uniform vec3 uCol1;
uniform vec3 uCol2;
uniform vec3 uCol3;


void main() {
  vec3 col = uCol1;
  if (vRandom > 0.33 && vRandom < 0.66) col = uCol2;
  if (vRandom >= 0.66) col = uCol3;

  float alpha = 1.0 - smoothstep(-0.2, 0.3, length(gl_PointCoord - vec2(0.5)));


  gl_FragColor = vec4(col, alpha);
}`;

export const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vRandom;
uniform sampler2D texture1;
float PI = 3.14159;

attribute float sizeAttenuation;

void main() {
  vUv = uv;
  vRandom = sizeAttenuation;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0);
  gl_PointSize = (400.0 * sizeAttenuation + 20.0) * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;
