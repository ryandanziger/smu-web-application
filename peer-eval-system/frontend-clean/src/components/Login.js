import React, { useState } from 'react';
import API_URL from '../config';
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
};

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Use the real user data from the API
      await login(data.user.role, data.user.username, data.user);
      
      // Navigate based on role
      if (data.user.role === 'student') {
        navigate('/evaluation-selection');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const outerContainerStyle = {
    fontFamily: 'Georgia, serif', 
    backgroundColor: COLORS.BODY_BACKGROUND, 
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const loginContainerStyle = {
    backgroundColor: COLORS.TAN_BACKGROUND,
    borderRadius: '25px',
    padding: '40px',
    width: '100%',
    maxWidth: '735px',
    position: 'relative',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    fontSize: 'clamp(28px, 6vw, 40px)',
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
    fontSize: 'clamp(18px, 5vw, 28px)',
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
    fontSize: 'clamp(16px, 4.5vw, 22px)',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '200',
    fontStyle: 'italic',
    color: COLORS.PLACEHOLDER_TEXT,
    backgroundColor: COLORS.WHITE,
    boxSizing: 'border-box',
    minHeight: '52px',
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
    fontSize: 'clamp(18px, 5.5vw, 32px)',
    fontFamily: 'Joan, serif',
    transition: 'background-color 0.2s',
    minHeight: '56px',
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

  const roleSelectorStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  };

  const roleButtonStyle = (isSelected) => ({
    flex: 1,
    padding: '10px 16px',
    backgroundColor: isSelected ? COLORS.NAVY_BUTTON : COLORS.WHITE,
    color: isSelected ? COLORS.WHITE : COLORS.PLACEHOLDER_TEXT,
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: 'normal',
    fontFamily: 'Joan, serif',
    transition: 'background-color 0.2s',
    height: '60px',
  });

  return (
    <div style={outerContainerStyle}>
      <div style={loginContainerStyle}>
        <h1 style={titleStyle}>SMU Peer Evaluation</h1>
        
        {error && <div style={errorStyle}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Login As:</label>
            <div style={roleSelectorStyle}>
              <button
                type="button"
                style={roleButtonStyle(formData.role === 'student')}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
              >
                Student
              </button>
              <button
                type="button"
                style={roleButtonStyle(formData.role === 'professor')}
                onClick={() => setFormData(prev => ({ ...prev, role: 'professor' }))}
              >
                Professor
              </button>
            </div>
          </div>

          {/* Username */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                color: formData.username ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: formData.username ? 'normal' : 'italic',
              }}
              placeholder="Enter Username"
              required
            />
          </div>

          {/* Password */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                color: formData.password ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: formData.password ? 'normal' : 'italic',
              }}
              placeholder="Enter Password"
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
            {isLoading ? 'Signing In...' : 'LOG IN'}
          </button>
        </form>

        {/* Signup Link */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
        }}>
          <p style={{ 
            fontSize: '18px', 
            color: COLORS.WHITE, 
            margin: '5px 0',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '200',
          }}>
            Don't have an account?
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.WHITE,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '20px',
              fontFamily: 'Joan, serif',
              fontWeight: 'normal',
              padding: 0,
            }}
          >
            Create Account
          </button>
          
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <button
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.WHITE,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '18px',
                fontFamily: 'Joan, serif',
                fontWeight: 'normal',
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
