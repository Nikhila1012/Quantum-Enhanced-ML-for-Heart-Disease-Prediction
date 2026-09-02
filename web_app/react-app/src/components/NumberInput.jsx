import React from 'react';

function NumberInput({ label, id, min, max, step = 1, value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="number"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default NumberInput;
