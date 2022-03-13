import { useState } from 'react';

import { MandelbulbParams } from '../lib/points-worker';

interface OptionsProps {
  onSave: (m: MandelbulbParams) => void;
  isGenerating: boolean;
}

const Options = ({ onSave, isGenerating }: OptionsProps) => {
  const nPowerOptions = [2, 4, 6, 8, 12, 16, 32];
  const maxIterationsOptions = [10, 20, 32, 64, 128, 256];
  const dimOptions = [16, 24, 32, 64, 128, 160];
  const [value, setValue] = useState<MandelbulbParams>({
    nPower: 8,
    maxIterations: 80,
    dim: 64,
  });

  const handleOnSave = () => {
    console.log('call on save with values', value);
    onSave(value);
  };

  return (
    <div className="options-grid">
      <div className="item">
        <label>N Power</label>
        <select
          value={value.nPower}
          onChange={(e) =>
            setValue({ ...value, nPower: parseInt(e.target.value) })
          }
        >
          {nPowerOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="item">
        <label>Max Iterations</label>
        <select
          disabled={false}
          value={value.maxIterations}
          onChange={(e) =>
            setValue({ ...value, maxIterations: parseInt(e.target.value) })
          }
        >
          {maxIterationsOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="item">
        <label>Dimension</label>
        <select
          disabled={false}
          value={value.dim}
          onChange={(e) =>
            setValue({ ...value, dim: parseInt(e.target.value) })
          }
        >
          {dimOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <button
        disabled={isGenerating}
        onClick={handleOnSave}
        style={{ opacity: isGenerating ? 0.4 : 1.0 }}
      >
        update
      </button>
    </div>
  );
};

export default Options;
