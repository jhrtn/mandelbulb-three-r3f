/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import './App.css';

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

const createMandel = (): Promise<Float32Array> => {
  const { mapLinear } = THREE.MathUtils;
  const { pow, sin, cos } = Math;

  const posOffset = 1.0;

  const dim = 128;

  const points: number[] = [];

  const pointsPromise = new Promise<Float32Array>((resolve) => {
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

    resolve(new Float32Array(points));
  });

  return pointsPromise;
};

interface MandelBulbProps {
  mandel: Float32Array;
}

const Mandelbulb = ({ mandel }: MandelBulbProps) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const pointsRef = useRef<any>(null!); // eslint-disable-line @typescript-eslint/no-explicit-any

  const particleTexture = useTexture('textures/1.png');
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

const Scene = ({ points }: { points: Float32Array }) => {
  return (
    <Canvas
      // dpr={[1, 2]}
      orthographic
      camera={{ zoom: 140, position: [0, 0, 100] }}
    >
      <ambientLight />
      <OrbitControls
        makeDefault
        enableZoom={true}
        enablePan={false}
        minZoom={140}
        maxZoom={400}
      />
      <Suspense fallback={null}>
        {points && <Mandelbulb mandel={points} />}
      </Suspense>
      {/* <Stats /> */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          height={window.innerHeight}
          width={window.innerWidth}
        />
      </EffectComposer>
    </Canvas>
  );
};

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<Float32Array | null>();
  useEffect(() => {
    createMandel().then((result) => {
      setPoints(result);
      setLoading(false);
    });
  }, []);

  return (
    <>
      {/* {true && (
        <div className="loader-overylay">
          <p>generating mandelbulb points...</p>
        </div>
      )} */}
      <div className="grid-container">
        <div className="grid-row-text">
          <p>Mandelbulb Point Cloud // Three.js/R3F</p>
          <TextLink url="https://github.com/jhrtn/mandelbulb-three-r3f">
            {'< / >'}
          </TextLink>
        </div>
        <div className="grid-row-canvas">
          <div className="canvas-container">
            {points && <Scene points={points} />}
          </div>
        </div>
        <div className="grid-row-text">
          <TextLink url="https://thecodingtrain.com/CodingChallenges/168-mandelbulb.html">
            Ported from Daniel Shiffman&apos;s Processing code
          </TextLink>
          <TextLink url="https://hort.onl">by Joseph Horton</TextLink>
        </div>
      </div>
    </>
  );
}

export default App;

const TextLink = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactChild;
}) => (
  <a href={url} target="_blank" rel="noreferrer">
    {children}
  </a>
);
