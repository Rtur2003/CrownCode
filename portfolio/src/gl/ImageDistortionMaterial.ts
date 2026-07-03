import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// A custom shader material that creates a liquid/RGB shift distortion on hover
export const ImageDistortionMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uHoverState: 0,
    uTime: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform float uHoverState;
    uniform float uTime;
    varying vec2 vUv;

    // Simple noise function for liquid effect
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      // Liquid distortion based on hover and time
      float dist = noise(uv * 10.0 + uTime) * 0.05 * uHoverState;
      
      // RGB Shift
      vec4 rTexture = texture2D(uTexture, uv + vec2(dist, 0.0));
      vec4 gTexture = texture2D(uTexture, uv);
      vec4 bTexture = texture2D(uTexture, uv - vec2(dist, 0.0));

      // Final color mixing
      vec4 finalColor = vec4(rTexture.r, gTexture.g, bTexture.b, 1.0);
      
      // Basic grayscale conversion for non-hovered state to make hover pop
      vec3 gray = vec3(dot(gTexture.rgb, vec3(0.299, 0.587, 0.114)));
      vec4 baseColor = vec4(gray, 1.0);

      gl_FragColor = mix(baseColor, finalColor, uHoverState);
    }
  `
);
