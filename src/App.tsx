/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { WorkerBuilder, PointsWorker } from './lib/points-worker';

import './App.css';

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

const randPoints: number[] = Array.from({ length: 20 }, (_, i) => i);

const Loader = () => {
  return (
    <div className="loader-outer">
      <div className="loader-inner">
        <p>generating points</p>
        {randPoints.map((point) => (
          <LoaderPoint key={point} index={point} />
        ))}
      </div>
    </div>
  );
};

const newPos = () => ({
  x: (Math.random() - 0.5) * 200,
  y: (Math.random() - 0.5) * 200,
});
const LoaderPoint = ({ index }: { index: number }) => {
  const [pos, setPos] = useState(() => newPos());
  const { x, y, opacity } = useSpring({
    x: pos.x,
    y: pos.y,
    opacity: Math.random(),
    from: { x: pos.y, y: pos.x, opacity: Math.random() },
    onRest: () => setPos(() => newPos()),
    config: config.molasses,
  });

  return (
    <animated.div
      className="loader-point"
      key={index}
      style={{
        x,
        y,
        opacity,
      }}
    />
  );
};
