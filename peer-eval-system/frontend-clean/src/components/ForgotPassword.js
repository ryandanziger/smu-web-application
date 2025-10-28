import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Color Palette (matching Login component) ---
const COLORS = {
  TAN_BACKGROUND: 'rgba(138,112,76,0.9)', // Main form background
  WHITE: 'white',
  NAVY_BUTTON: '#141b4d', // Dark navy for buttons
  PLACEHOLDER_TEXT: '#8a704c', // Tan color for placeholders
  TEXT_PRIMARY: '#2d3748',
  TEXT_SECONDARY: '#5C7094',
  ERROR_RED: '#C97C7C',
  SUCCESS_GREEN: '#4CAF50',
  BODY_BACKGROUND: 'white',
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(data.message);
      
      // In development, show the reset link for testing
      if (data.resetLink) {
        setSuccess(`${data.message} For testing: ${data.resetLink}`);
      }

    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const outerContainerStyle = {
    fontFamily: 'Georgia, serif', 
    backgroundColor: COLORS.BODY_BACKGROUND, 
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const forgotPasswordContainerStyle = {
    backgroundColor: COLORS.TAN_BACKGROUND,
    borderRadius: '25px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    fontSize: '40px',
    fontWeight: 'normal',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: '30px',
    fontFamily: 'Joan, serif',
    textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
  };

  const formGroupStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'normal',
    color: COLORS.WHITE,
    marginBottom: '8px',
    fontFamily: 'Joan, serif',
    textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '18px',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '200',
    fontStyle: 'italic',
    color: COLORS.PLACEHOLDER_TEXT,
    backgroundColor: COLORS.WHITE,
    boxSizing: 'border-box',
    height: '50px',
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: COLORS.NAVY_BUTTON,
    color: COLORS.WHITE,
    padding: '12px 20px',
    borderRadius: '16px',
    fontWeight: 'normal',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    fontFamily: 'Joan, serif',
    transition: 'background-color 0.2s',
    height: '60px',
    textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
  };

  const errorStyle = {
    backgroundColor: COLORS.ERROR_RED,
    color: COLORS.WHITE,
    padding: '12px 16px',
    fontSize: '14px',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Georgia, serif',
    borderRadius: '4px',
    marginBottom: '20px',
  };

  const successStyle = {
    backgroundColor: COLORS.SUCCESS_GREEN,
    color: COLORS.WHITE,
    padding: '12px 16px',
    fontSize: '14px',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Georgia, serif',
    borderRadius: '4px',
    marginBottom: '20px',
    wordBreak: 'break-all',
  };

  const linkStyle = {
    color: COLORS.WHITE,
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '18px',
    textAlign: 'center',
    display: 'block',
    marginTop: '20px',
    fontFamily: 'Joan, serif',
  };

  const descriptionStyle = {
    fontSize: '18px',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: '30px',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '200',
    lineHeight: '1.4',
  };

  return (
    <div style={outerContainerStyle}>
      <div style={forgotPasswordContainerStyle}>
        <h1 style={titleStyle}>Forgot Password</h1>
        
        <p style={descriptionStyle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="email">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...inputStyle,
                color: email ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: email ? 'normal' : 'italic',
              }}
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#0f1538')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = COLORS.NAVY_BUTTON)}
          >
            {isLoading ? 'Sending...' : 'SEND RESET LINK'}
          </button>
        </form>

        {/* Back to Login Link */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
          style={linkStyle}
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}
