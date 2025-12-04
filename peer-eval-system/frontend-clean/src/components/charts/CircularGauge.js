import React from 'react';

export default function CircularGauge({ value, max = 100, label, color = '#00AD5D' }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Calculate the circumference (full circle)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', width: '150px', height: '150px' }}>
        <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle (gray) */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth="20"
          />
          
          {/* Filled circle (colored) */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Value display in center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '30px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center'
        }}>
          {value?.toFixed ? value.toFixed(1) : value}%
        </div>
      </div>
      
      {/* Label */}
      {label && (
        <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
          {label}
        </div>
      )}
    </div>
  );
}

