import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/api/verify-reset-token/${token}`);
        const data = await response.json();

        if (response.ok) {
          setTokenValid(true);
        } else {
          setError(data.message || 'Invalid or expired reset link');
          setTokenValid(false);
        }
      } catch (err) {
        setError('Failed to verify reset link');
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

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
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Password has been reset successfully! Redirecting to login...');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
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

  const resetPasswordContainerStyle = {
    backgroundColor: COLORS.TAN_BACKGROUND,
    borderRadius: '25px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
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

  const rowStyle = {
    display: 'flex',
    gap: '15px',
  };

  const halfWidthStyle = {
    flex: 1,
  };

  // Show loading while verifying token
  if (tokenValid === null) {
    return (
      <div style={outerContainerStyle}>
        <div style={resetPasswordContainerStyle}>
          <h1 style={titleStyle}>Reset Password</h1>
          <p style={descriptionStyle}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div style={outerContainerStyle}>
        <div style={resetPasswordContainerStyle}>
          <h1 style={titleStyle}>Reset Password</h1>
          {error && <div style={errorStyle}>{error}</div>}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}
            style={linkStyle}
          >
            Request New Reset Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={outerContainerStyle}>
      <div style={resetPasswordContainerStyle}>
        <h1 style={titleStyle}>Reset Password</h1>
        
        <p style={descriptionStyle}>
          Enter your new password below.
        </p>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Password Fields */}
          <div style={formGroupStyle}>
            <div style={rowStyle}>
              <div style={halfWidthStyle}>
                <label style={labelStyle} htmlFor="password">
                  New Password:
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
                  placeholder="New password (min 6 chars)"
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
                  placeholder="Confirm new password"
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
            {isLoading ? 'Resetting...' : 'RESET PASSWORD'}
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
