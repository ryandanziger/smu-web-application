import React from 'react';

export default function SemiCircularGauge({ value, max = 100, threshold, label, color = '#FFD700' }) {
  const percentage = Math.min((value / max) * 100, 100);
  const thresholdPercentage = threshold ? (threshold / max) * 100 : null;
  
  // Calculate the angle for the arc (180 degrees for semi-circle)
  const angle = (percentage / 100) * 180;
  const thresholdAngle = thresholdPercentage ? (thresholdPercentage / 100) * 180 : null;
  
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // Create the arc path
  const createArc = (startAngle, endAngle) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle - 90) * (Math.PI / 180)),
      y: centerY + radius * Math.sin((startAngle - 90) * (Math.PI / 180))
    };
    const end = {
      x: centerX + radius * Math.cos((endAngle - 90) * (Math.PI / 180)),
      y: centerY + radius * Math.sin((endAngle - 90) * (Math.PI / 180))
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <svg width="200" height="130" style={{ overflow: 'visible' }}>
        {/* Background arc (gray) */}
        <path
          d={createArc(0, 180)}
          fill="none"
          stroke="#E1E1E1"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Filled arc (colored) */}
        {percentage > 0 && (
          <path
            d={createArc(0, angle)}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
          />
        )}
        
        {/* Threshold marker */}
        {thresholdAngle && thresholdAngle < 180 && (
          <>
            <line
              x1={centerX + (radius + 15) * Math.cos((thresholdAngle - 90) * (Math.PI / 180))}
              y1={centerY + (radius + 15) * Math.sin((thresholdAngle - 90) * (Math.PI / 180))}
              x2={centerX + (radius + 5) * Math.cos((thresholdAngle - 90) * (Math.PI / 180))}
              y2={centerY + (radius + 5) * Math.sin((thresholdAngle - 90) * (Math.PI / 180))}
              stroke="#666"
              strokeWidth="2"
            />
            <text
              x={centerX + (radius + 25) * Math.cos((thresholdAngle - 90) * (Math.PI / 180))}
              y={centerY + (radius + 25) * Math.sin((thresholdAngle - 90) * (Math.PI / 180))}
              fontSize="12"
              fill="#666"
              textAnchor="middle"
            >
              {threshold}
            </text>
          </>
        )}
      </svg>
      
      {/* Value display */}
      <div style={{ 
        fontSize: '40px', 
        fontWeight: 'bold', 
        color: '#333',
        marginTop: '-60px',
        marginBottom: '5px'
      }}>
        {value?.toFixed ? value.toFixed(2) : value}
      </div>
      
      {/* Label */}
      {label && (
        <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
          {label}
        </div>
      )}
    </div>
  );
}

