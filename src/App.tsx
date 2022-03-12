/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  useRef,
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { fragmentShader, vertexShader } from './lib/customShader';
import {
  WorkerBuilder,
  PointsWorker,
  MandelbulbParams,
} from './lib/points-worker';

import './App.css';
import Options from './Components/Options';
import Loader from './Components/Loader';
import { Centered, TextLink } from './Components/Layout';

interface MandelBulbProps {
  mandel: Float32Array;
}

const Mandelbulb = ({ mandel }: MandelBulbProps) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const pointsRef = useRef<any>(null!); // eslint-disable-line @typescript-eslint/no-explicit-any
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const geoRef = useRef<any>(null!);

  useFrame((state) => {
    if (pointsRef.current)
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const shaderData = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0.0 },
        uCol1: { value: new THREE.Color(0xf6b6b6) },
        uCol2: { value: new THREE.Color(0xf5e076) },
        uCol3: { value: new THREE.Color(0xf4b04a) },
      },
      fragmentShader,
      vertexShader,
    }),
    []
  );

  const sizeAtt = useMemo(
    () =>
      Float32Array.from(
        Array.from({ length: mandel.length / 3 }, () => Math.random())
      ),
    []
  );

  const update = useCallback((el: THREE.BufferAttribute) => {
    el.set(sizeAtt);
    el.needsUpdate = true;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          array={mandel}
          count={mandel.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'sizeAttenuation']}
          count={sizeAtt.length}
          itemSize={1}
          array={sizeAtt}
          onUpdate={update}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        vertexColors
        blending={THREE.AdditiveBlending}
        transparent
        depthTest={false}
        depthWrite={false}
        args={[
          {
            uniforms: shaderData.uniforms,
            vertexShader: shaderData.vertexShader,
            fragmentShader: shaderData.fragmentShader,
          },
        ]}
      />
    </points>
  );
};

const Scene = ({ points }: { points: Float32Array }) => {
  return (
    <Canvas
      dpr={[1, 2]}
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
          intensity={0.1}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          height={window.innerHeight}
          width={window.innerWidth}
        />
      </EffectComposer>
    </Canvas>
  );
};

const workerInstance = WorkerBuilder(PointsWorker);

type AppState =
  | 'GENERATING'
  | 'UNSUPPORTED'
  | 'LOADED'
  | 'INITIALISING'
  | 'ERROR';

const initialState: MandelbulbParams = {
  nPower: 8,
  maxIterations: 80,
  dim: 64,
};

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState<AppState>('INITIALISING');
  const [points, setPoints] = useState<Float32Array | null>();

  useEffect(() => {
    workerInstance.onmessage = (message) => {
      if (typeof message.data == 'object') {
        setPoints(message.data);
        setStatus('LOADED');
      }

      if (typeof message.data == 'string') {
        if (message.data == 'ERROR') setStatus('ERROR');
      }
    };

    if (workerInstance) {
      setStatus('GENERATING');
      setTimeout(() => {
        regenerateMandelbulb(initialState);
      }, 100);
    } else {
      setStatus('UNSUPPORTED');
    }
  }, []);

  console.log(status);

  const regenerateMandelbulb = (d: MandelbulbParams) => {
    setStatus('GENERATING');
    workerInstance.postMessage({
      type: 'GENERATE_POINTS',
      data: d,
    });
  };

  return (
    <>
      <div className="grid-container">
        <div className="grid-row-text">
          <p>Mandelbulb Point Cloud // Three.js/R3F</p>
          <TextLink url="https://github.com/jhrtn/mandelbulb-three-r3f">
            {'< / >'}
          </TextLink>
        </div>

        <div className="grid-row-canvas">
          <div className="canvas-container">
            {status === 'LOADED' && points && <Scene points={points} />}
          </div>
        </div>

        <div className="grid-row-text">
          <Options
            onSave={regenerateMandelbulb}
            isGenerating={status == 'GENERATING'}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              flexDirection: 'column',
            }}
          >
            <TextLink url="https://thecodingtrain.com/CodingChallenges/168-mandelbulb.html">
              Ported from Daniel Shiffman&apos;s Processing code
            </TextLink>
            <TextLink url="https://hort.onl">by Joseph Horton</TextLink>
          </div>
        </div>
      </div>
      {status === 'GENERATING' && <Loader />}
      {status === 'UNSUPPORTED' && (
        <Centered>
          <p>Sorry, Web Workers are not supported in your browser</p>
        </Centered>
      )}
      {status === 'ERROR' && (
        <Centered>
          <p style={{ color: '#f78888' }}>
            There was an issue generating those points. Please try again.
          </p>
        </Centered>
      )}
    </>
  );
}

export default App;
