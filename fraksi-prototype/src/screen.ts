import * as THREE from "three";

export function buildProjectionScreen(): THREE.Group {
  const group = new THREE.Group();
  group.name = "projection-screen";

  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(9.4, 5.7),
    new THREE.MeshBasicMaterial({
      color: 0x33291f
    })
  );

  frame.position.z = -0.08;
  group.add(frame);

  const screenMaterial = new THREE.ShaderMaterial({
    uniforms: {
      warmColor: {
        value: new THREE.Color(0xfff1c7)
      },
      edgeColor: {
        value: new THREE.Color(0xc9a46f)
      }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 warmColor;
      uniform vec3 edgeColor;
      varying vec2 vUv;

      float random(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 centered = vUv - 0.5;
        float radius = length(centered * vec2(1.0, 1.25));
        float vignette = smoothstep(0.78, 0.12, radius);

        float paper = random(floor(vUv * vec2(720.0, 420.0))) * 0.028;
        float glow = 0.78 + vignette * 0.32;

        vec3 color = mix(edgeColor, warmColor, glow);
        color += paper;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 5.3),
    screenMaterial
  );

  screen.position.z = 0;
  group.add(screen);

  return group;
}
