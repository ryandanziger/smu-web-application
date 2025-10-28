import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Color Palette (matching Figma wireframes) ---
const COLORS = {
  TAN_BACKGROUND: 'rgba(138,112,76,0.9)', // Main form background
  WHITE: 'white',
  NAVY_BUTTON: '#141b4d', // Dark navy for buttons
  PLACEHOLDER_TEXT: '#8a704c', // Tan color for placeholders
  TEXT_PRIMARY: '#2d3748',
  TEXT_SECONDARY: '#5C7094',
  ERROR_RED: '#C97C7C',
  BODY_BACKGROUND: 'white',
  HEADER_TEXT: '#2d3748', 
  SUB_HEADER_TEXT: '#5C7094', 
  UNDERLINE_BLUE: '#5C7094', 
  HEADER_BAR_BG: '#e8e8e8', 
  TAN_BASE: '#C4B5A0',
  TAN_SELECTED: '#8B7355',
  NAVY_BASE: '#5C7094',
  NAVY_SELECTED: '#4A5568',
  SECTION_TITLE_COLOR: '#2d3748',
  PROGRESS_GRAY: '#ccc',
  NAVY_DARK: '#001f44',
};

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const outerContainerStyle = {
    fontFamily: 'Georgia, serif', 
    backgroundColor: COLORS.BODY_BACKGROUND, 
    minHeight: '100vh',
  };
  
  const mainContentAreaStyle = {
    width: '100%',
    backgroundColor: COLORS.WHITE, 
  };
  
  const headerBannerStyle = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://www.kenan-flagler.unc.edu/wp-content/uploads/nmc-images/2019/10/singapore_skyline-width2000height772.jpg")`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '50px 0 10px 0', 
    position: 'relative',
  };

  const topNavBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.NAVY_DARK,
    color: COLORS.WHITE,
    fontSize: '18px',
    fontWeight: 'bold',
  };

  const titleContainerStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '0 40px', 
    width: '100%',
  };
  
  const dashboardTitleStyle = { 
    fontSize: '30px',
    fontWeight: 'normal',
    margin: 0,
    color: COLORS.WHITE,
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '5px',
  };

  const instructionBoxStyle = {
    padding: '20px', 
    marginBottom: '15px',
    fontSize: '14px',
    lineHeight: '1.4',
    color: COLORS.TEXT_PRIMARY,
  };

  const dashboardContainerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const iframeContainerStyle = {
    marginBottom: '30px',
    backgroundColor: COLORS.WHITE,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  };

  const iframeStyle = {
    width: '100%',
    height: '450px',
    border: 'none',
    display: 'block',
  };

  const sectionTitleStyle = {
    fontSize: '28px',
    fontWeight: 'normal',
    color: COLORS.WHITE,
    marginBottom: '15px',
    padding: '20px 20px 0 20px',
    fontFamily: 'Joan, serif',
    textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
  };

  const navigationButtonStyle = {
    backgroundColor: COLORS.TAN_SELECTED,
    color: COLORS.WHITE,
    padding: '10px 20px',
    borderRadius: '4px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    margin: '20px',
    transition: 'background-color 0.2s',
    fontFamily: 'Georgia, serif',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div style={outerContainerStyle}>
      {/* TOP NAV BAR */}
      <div style={topNavBarStyle}>
        <span>SMU Peer Evaluation</span> 
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', alignItems: 'center'}}>
          <span>Home</span>
          <span>Account</span>
          <span style={{ fontSize: '18px' }}>Menu ☰</span>
        </div>
      </div>

      {/* Header Banner */}
      <div style={headerBannerStyle}>
        <div style={titleContainerStyle}>
          <h1 style={dashboardTitleStyle}>Analytics Dashboard</h1> 
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={mainContentAreaStyle}>
        {/* Instructions */}
        <div style={instructionBoxStyle}>
          <p style={{ margin: '20px 0 0 0' }}>
            View comprehensive analytics and insights from peer evaluation data. 
            The dashboards below provide detailed visualizations of team performance, 
            evaluation trends, and individual contributions.
          </p>
        </div>

        {/* Dashboard Container */}
        <div style={dashboardContainerStyle}>
          {/* Dashboard 1 */}
          <div style={iframeContainerStyle}>
            <h2 style={sectionTitleStyle}>Team Performance Overview</h2>
            <iframe 
              width="600" 
              height="450" 
              src="https://lookerstudio.google.com/embed/reporting/68aa6e38-0293-42df-a1df-426f144d2b94/page/p_gqsfcjbfxd" 
              frameBorder="0" 
              style={iframeStyle}
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>

          {/* Dashboard 2 */}
          <div style={iframeContainerStyle}>
            <h2 style={sectionTitleStyle}>Evaluation Trends Analysis</h2>
            <iframe 
              width="600" 
              height="450" 
              src="https://lookerstudio.google.com/embed/reporting/68aa6e38-0293-42df-a1df-426f144d2b94/page/6iicF" 
              frameBorder="0" 
              style={iframeStyle}
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>

          {/* Dashboard 3 */}
          <div style={iframeContainerStyle}>
            <h2 style={sectionTitleStyle}>Individual Contribution Metrics</h2>
            <iframe 
              width="600" 
              height="450" 
              src="https://lookerstudio.google.com/embed/reporting/68aa6e38-0293-42df-a1df-426f144d2b94/page/p_jha4bybfxd" 
              frameBorder="0" 
              style={iframeStyle}
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: COLORS.NAVY_BUTTON,
              color: COLORS.WHITE,
              padding: '12px 20px',
              borderRadius: '16px',
              fontWeight: 'normal',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              fontFamily: 'Joan, serif',
              transition: 'background-color 0.2s',
              textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0f1538'}
            onMouseOut={(e) => e.target.style.backgroundColor = COLORS.NAVY_BUTTON}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
