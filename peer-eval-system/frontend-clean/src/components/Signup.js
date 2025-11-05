import React, { useState } from 'react';
import API_URL from '../config';
import { useAuth } from '../contexts/AuthContext';
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

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Auto-login after successful signup
      setTimeout(async () => {
        try {
          const loginResponse = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            await login(formData.role, formData.username, loginData.user);
            
            // Navigate based on role
            if (formData.role === 'student') {
              navigate('/evaluation');
            } else {
              navigate('/student-import');
            }
          } else {
            navigate('/login');
          }
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
          navigate('/login');
        }
      }, 2000);

    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
    padding: '20px',
  };

  const signupContainerStyle = {
    backgroundColor: COLORS.TAN_BACKGROUND,
    borderRadius: '25px',
    padding: '40px',
    width: '100%',
    maxWidth: '800px',
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
    fontSize: 'clamp(16px, 4.5vw, 22px)',
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
    fontSize: 'clamp(15px, 4vw, 18px)',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '200',
    fontStyle: 'italic',
    color: COLORS.PLACEHOLDER_TEXT,
    backgroundColor: COLORS.WHITE,
    boxSizing: 'border-box',
    minHeight: '48px',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
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
    fontSize: 'clamp(18px, 5vw, 24px)',
    fontFamily: 'Joan, serif',
    transition: 'background-color 0.2s',
    minHeight: '52px',
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
    fontSize: '20px',
    fontWeight: 'normal',
    fontFamily: 'Joan, serif',
    transition: 'background-color 0.2s',
    height: '50px',
  });

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

  const rowStyle = {
    display: 'flex',
    gap: '15px',
  };

  const halfWidthStyle = {
    flex: 1,
  };

  return (
    <div style={outerContainerStyle}>
      <div style={signupContainerStyle}>
        <h1 style={titleStyle}>Create Account</h1>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Account Type:</label>
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

          {/* Name Fields */}
          <div style={formGroupStyle}>
            <div style={rowStyle}>
              <div style={halfWidthStyle}>
                <label style={labelStyle} htmlFor="firstName">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    color: formData.firstName ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                    fontStyle: formData.firstName ? 'normal' : 'italic',
                  }}
                  placeholder="First Name"
                />
              </div>
              <div style={halfWidthStyle}>
                <label style={labelStyle} htmlFor="lastName">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    color: formData.lastName ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                    fontStyle: formData.lastName ? 'normal' : 'italic',
                  }}
                  placeholder="Last Name"
                />
              </div>
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
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                color: formData.email ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: formData.email ? 'normal' : 'italic',
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Fields */}
          <div style={formGroupStyle}>
            <div style={rowStyle}>
              <div style={halfWidthStyle}>
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
                  placeholder="Password (min 6 chars)"
                  required
                />
              </div>
              <div style={halfWidthStyle}>
                <label style={labelStyle} htmlFor="confirmPassword">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    color: formData.confirmPassword ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                    fontStyle: formData.confirmPassword ? 'normal' : 'italic',
                  }}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#0f1538')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = COLORS.NAVY_BUTTON)}
          >
            {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Link to Login */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
          style={linkStyle}
        >
          Already have an account? Sign in here
        </a>
      </div>
    </div>
  );
}
