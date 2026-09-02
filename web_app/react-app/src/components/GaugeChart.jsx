import React from 'react';

function GaugeChart({ value, isHighRisk }) {
  // Handle cases where value might be null, undefined, or NaN
  const safeValue = (value && !isNaN(value)) ? value : 0;
  const percentage = safeValue * 100;
  const rotation = (percentage / 100) * 180 - 90;
  const color = isHighRisk ? 'var(--danger)' : 'var(--success)';

  return (
    <div style={{ position: 'relative', width: '200px', height: '120px' }}>
      <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%' }}>
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.51} 251`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {/* Needle */}
        <g style={{
          transformOrigin: '100px 100px',
          transition: 'transform 0.6s ease',
          transform: `rotate(${rotation}deg)`
        }}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="var(--text-primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="8" fill="var(--accent-primary)" />
        </g>
      </svg>
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: color }}>
          {percentage.toFixed(0)}%
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {isHighRisk ? 'High Risk' : 'Low Risk'}
        </div>
      </div>
    </div>
  );
}

export default GaugeChart;
