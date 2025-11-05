import React from 'react';

export default function DisclaimerBanner() {
  return (
    <div
      style={{
        backgroundColor: '#DC3545', // Red color
        color: 'white',
        padding: '15px 20px',
        textAlign: 'center',
        fontSize: 'clamp(14px, 2vw, 18px)',
        fontWeight: 'bold',
        width: '100%',
        position: 'relative',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        letterSpacing: '0.5px'
      }}
    >
      ⚠️ DISCLAIMER: This is an educational project and is not affiliated with or endorsed by Singapore Management University (SMU). This application is for demonstration purposes only.
    </div>
  );
}

