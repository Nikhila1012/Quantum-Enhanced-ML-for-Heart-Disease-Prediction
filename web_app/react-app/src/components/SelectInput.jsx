import React from 'react';

function SelectInput({ label, id, value, onChange, options }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default SelectInput;
