import React from 'react';

function SliderInput({ label, id, min, max, value, onChange }) {
  return (
    <div className="form-group full-width">
      <label>{label}</label>
      <div className="slider-container">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="slider-value">{value}</span>
      </div>
    </div>
  );
}

export default SliderInput;
