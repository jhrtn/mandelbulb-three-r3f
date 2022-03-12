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

export const PointsWorker = () => {
  // borrowed from p5js as all code must be contained within worker
  const mapRange = (
    n: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ) => {
    const newval =
      ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

    if (start2 < stop2) {
      return constrain(newval, start2, stop2);
    } else {
      return constrain(newval, stop2, start2);
    }
  };

  // borrowed from p5js
  const constrain = (n: number, low: number, high: number) => {
    return Math.max(Math.min(n, high), low);
  };

  const toSpherical = (x: number, y: number, z: number): Spherical => {
    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.atan2(Math.sqrt(x * x + y * y), z);
    const phi = Math.atan2(y, x);
    return { r, theta, phi };
  };

  self.onmessage = (message) => {
    console.log('got message in worker', message);
    const data = message.data;

    if (data === 'GENERATE_POINTS') {
      console.log('generating points');
      const { pow, sin, cos } = Math;

      const posOffset = 1.0;

      const dim = 128;

      const points: number[] = [];

      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          let isEdge = false;
          for (let k = 0; k < dim; k++) {
            const x = mapRange(i, 0, dim, -posOffset, posOffset);
            const y = mapRange(j, 0, dim, -posOffset, posOffset);
            const z = mapRange(k, 0, dim, -posOffset, posOffset);

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

      console.log('points func ends');
      const result = new Float32Array(points);
      postMessage(result);
    }
  };
};

export const WorkerBuilder = (worker: () => void) => {
  const code = worker.toString();
  const blob = new Blob([`(${code})()`]);
  return new Worker(URL.createObjectURL(blob));
};
