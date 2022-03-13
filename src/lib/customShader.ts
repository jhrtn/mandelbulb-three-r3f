export const fragmentShader = `
precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;
varying float vRandom;
varying float vDistance;

uniform float uTime;
uniform vec3 uCol1;
uniform vec3 uCol2;
uniform vec3 uCol3;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  // set the colour based on distance from center
  vec3 col = mix(uCol1, uCol2, vDistance) * 1.2;
  
  float alpha = 1.0 - smoothstep(-0.2, 0.3, length(gl_PointCoord - vec2(0.5)));

  gl_FragColor = vec4(col, alpha * vDistance);
}`;

export const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vRandom;
varying float vDistance;
uniform sampler2D texture1;
float PI = 3.14159;
uniform float uTime;

attribute float sizeAttenuation;



void main() {
  vUv = uv;
  vRandom = sizeAttenuation;
  
  vDistance = distance(vec3(0.0), position);
  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0);
  gl_PointSize = (1200.0) * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  
  
}
`;
