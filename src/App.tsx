/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture, OrbitControls, Stats } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import './App.css';

const particleTextures = [
  'textures/1.png',
  'textures/2.png',
  'textures/3.png',
  'textures/4.png',
  'textures/5.png',
  'textures/6.png',
  'textures/7.png',
  'textures/8.png',
  'textures/9.png',
  'textures/10.png',
  'textures/11.png',
  'textures/12.png',
  'textures/13.png',
];

interface Spherical {
  r: number;
  theta: number;
  phi: number;
}

interface Coord {
  x: number;
  y: number;
  z: number;
}

const toSpherical = (x: number, y: number, z: number): Spherical => {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.atan2(Math.sqrt(x * x + y * y), z);
  const phi = Math.atan2(y, x);
  return { r, theta, phi };
};

const createMandel = () => {
  console.log('recalculating...');
  // z = z^n + c <- triplex number

  const { mapLinear } = THREE.MathUtils;
  const { pow, sin, cos } = Math;

  const posOffset = 1.0;

  const dim = 128;

  const points: number[] = [];
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let isEdge = false;
      for (let k = 0; k < dim; k++) {
        const x = mapLinear(i, 0, dim, -posOffset, posOffset);
        const y = mapLinear(j, 0, dim, -posOffset, posOffset);
        const z = mapLinear(k, 0, dim, -posOffset, posOffset);

        const zeta: Coord = { x: 0.0, y: 0.0, z: 0.0 };

        const n = 8;
        const maxIterations = 20;
        let iteration = 0;

        while (true) {
          const { r, theta, phi } = toSpherical(zeta.x, zeta.y, zeta.z);

          const newx = pow(r, n) * sin(theta * n) * cos(phi * n);
          const newy = pow(r, n) * sin(theta * n) * sin(phi * n);
          const newz = pow(r, n) * cos(theta * n);

          zeta.x = newx + x;
          zeta.y = newy + y;
          zeta.z = newz + z;

          // console.log(zeta);

          iteration++;

          if (r > 2) {
            if (isEdge) {
              isEdge = false;
            }
            break;
          }

          if (iteration > maxIterations) {
            if (!isEdge) {
              isEdge = true;
              points.push(zeta.x, zeta.y, zeta.z);
            }
            break;
          }
        }
      }
    }
  }

  return new Float32Array(points);
};

interface MandelBulbProps {
  mandel: Float32Array;
  needsUpdate: boolean;
}

const Mandelbulb = ({ mandel, needsUpdate }: MandelBulbProps) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const pointsRef = useRef<any>(null!); // eslint-disable-line @typescript-eslint/no-explicit-any

  const particleTexture = useTexture(particleTextures[0]);

  useFrame(() => {
    if (pointsRef.current && needsUpdate) {
      console.log('do something...');
      needsUpdate = false;
    }
  });

  console.log('re-render');

  useFrame((state) => {
    if (pointsRef.current)
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          array={mandel}
          count={mandel.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={6}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={false}
        map={particleTexture}
        alphaMap={particleTexture}
      />
    </points>
  );
};

function App() {
  const mandelPoints = useMemo(() => createMandel(), []);

  const state = useRef({
    points: mandelPoints,
    needsUpdate: false,
  });

  return (
    <div className="container">
      <Canvas
        style={{ height: '100vh' }}
        // dpr={[1, 2]}
        orthographic
        camera={{ zoom: 140, position: [0, 0, 100] }}
      >
        <color attach="background" args={[0x1f1d24]} />
        <ambientLight />

        <OrbitControls
          makeDefault
          enableZoom={true}
          enablePan={false}
          minZoom={140}
          maxZoom={400}
        />
        <Suspense fallback={null}>
          <Mandelbulb
            mandel={state.current.points}
            needsUpdate={state.current.needsUpdate}
          />
        </Suspense>
        <Stats />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            height={800}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
