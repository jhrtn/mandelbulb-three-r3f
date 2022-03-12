import { useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

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
  opacity: Math.random(),
  scale: Math.random() + 0.4,
});

const LoaderPoint = ({ index }: { index: number }) => {
  const i = useRef(0);
  const positions = Array.from({ length: 8 }, () => newPos());
  const pos = useRef(newPos());
  const { x, y, opacity, scale } = useSpring({
    from: {
      x: pos.current.y,
      y: pos.current.x,
      opacity: Math.random(),
      scale: Math.random() + 0.2,
    },
    to: async (next) => {
      while (1) {
        if (i.current == positions.length) i.current = 0;
        else i.current++;
        await next(positions[i.current]);
      }
    },

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
        scale,
      }}
    />
  );
};

export default Loader;
