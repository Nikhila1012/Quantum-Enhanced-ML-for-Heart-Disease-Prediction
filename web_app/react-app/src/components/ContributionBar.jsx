import React from 'react';

function ContributionBar({ item }) {
  // Use normalized_percentage from backend (weighted proportional based on real SHAP values)
  // Fall back to percentage or old calculation if not available
  const width = item.normalized_percentage || item.percentage || Math.abs(item.contribution) * 100;
  const isRisk = item.contribution > 0;
  const fillClass = isRisk ? 'risk' : 'protective';
  const displayWidth = Math.max(width, 5);
  
  // Handle value display - show actual value with proper formatting
  let valueDisplay = 'N/A';
  if (item.value !== undefined && item.value !== null && item.value !== '') {
    // Format the value based on feature type
    const numericValue = parseFloat(item.value);
    if (!isNaN(numericValue)) {
      // Round to 2 decimal places for display
      valueDisplay = numericValue.toFixed(2);
    } else {
      valueDisplay = String(item.value);
    }
  }

  return (
    <div className="contribution-bar">
      <div className="contribution-header">
        <span className="contribution-name">{item.feature}</span>
        <span className="contribution-value">Value: {valueDisplay}</span>
      </div>
      <div className="contribution-track">
        <div className={`contribution-fill ${fillClass}`} style={{ width: `${displayWidth}%` }}>
          {/* Always show percentage, adjust font size for small bars */}
          <span style={{ 
            fontSize: width < 15 ? '10px' : '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: 'inherit'
          }}>
            {width.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default ContributionBar;
