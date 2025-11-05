import React, { useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  TAN_BACKGROUND: 'rgba(138,112,76,0.9)',
  WHITE: 'white',
  NAVY_BUTTON: '#141b4d',
  PLACEHOLDER_TEXT: '#8a704c',
  TEXT_PRIMARY: '#2d3748',
  ERROR_RED: '#C97C7C',
  SUCCESS_GREEN: '#4CAF50',
  BODY_BACKGROUND: 'white',
};

export default function CourseCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: '',
    semester: '',
    classTime: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.courseName || !formData.semester) {
      setError('Course name and semester are required');
      setIsLoading(false);
      return;
    }

    try {
      // Get professor ID from user
      // Note: This assumes the user.id maps to professorid
      // You may need to adjust this based on your user/professor relationship
      const response = await fetch(`${API_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName: formData.courseName,
          semester: formData.semester,
          classTime: formData.classTime || null,
          userEmail: user.email,
          userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      setSuccess('Course created successfully!');
      
      // Redirect to dashboard after 1.5 seconds to see the new course
      setTimeout(() => {
        navigate('/dashboard', { state: { refresh: true } });
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to create course. Please try again.');
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

  const containerStyle = {
    backgroundColor: COLORS.TAN_BACKGROUND,
    borderRadius: '25px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
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
    marginBottom: '20px',
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

  return (
    <div style={outerContainerStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Create New Course</h1>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle} htmlFor="courseName">
              Course Name:
            </label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                color: formData.courseName ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: formData.courseName ? 'normal' : 'italic',
              }}
              placeholder="e.g., Project Management"
              required
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="semester">
              Semester:
            </label>
            <input
              type="text"
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                color: formData.semester ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: formData.semester ? 'normal' : 'italic',
              }}
              placeholder="e.g., F24, S25"
              required
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="classTime">
              Class Time (Optional):
            </label>
            <input
              type="time"
              id="classTime"
              name="classTime"
              value={formData.classTime}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                color: formData.classTime ? COLORS.TEXT_PRIMARY : COLORS.PLACEHOLDER_TEXT,
                fontStyle: formData.classTime ? 'normal' : 'italic',
              }}
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#0f1538')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = COLORS.NAVY_BUTTON)}
          >
            {isLoading ? 'Creating...' : 'CREATE COURSE'}
          </button>
        </form>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            ...buttonStyle,
            backgroundColor: COLORS.TEXT_PRIMARY,
            marginTop: '15px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1a202c'}
          onMouseOut={(e) => e.target.style.backgroundColor = COLORS.TEXT_PRIMARY}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

