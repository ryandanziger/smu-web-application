import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config';

const COLORS = {
  TAN_BACKGROUND: 'rgba(138,112,76,0.9)',
  WHITE: 'white',
  NAVY_BUTTON: '#141b4d',
  PLACEHOLDER_TEXT: '#8a704c',
  TEXT_PRIMARY: '#2d3748',
  TEXT_SECONDARY: '#5C7094',
  ERROR_RED: '#C97C7C',
  SUCCESS_GREEN: '#4CAF50',
  BODY_BACKGROUND: 'white',
  HEADER_TEXT: '#2d3748',
  HEADER_BAR_BG: '#e8e8e8',
  TAN_BASE: '#C4B5A0',
  TAN_SELECTED: '#8B7355',
};

export default function EvaluationSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.email) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!user || !user.email) {
        setError('User email not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching assignments for student:', user.email);
      
      const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(user.email)}/evaluation-assignments`);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text.substring(0, 200));
            errorMessage = `Server error (${response.status}). Check backend logs.`;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
          errorMessage = `Server error (${response.status}). Check backend logs.`;
        }
        setError(`Failed to load assignments: ${errorMessage}`);
        return;
      }
      
      const data = await response.json();
      console.log('Assignments data:', data);
      
      setAssignments(data.assignments || []);
      if (data.assignments && data.assignments.length === 0) {
        setError('No evaluation assignments found. Your professor will assign evaluations when they are ready.');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError(`Cannot connect to backend. Please verify the API is accessible.`);
      } else {
        setError(`Failed to load assignments: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = () => {
    if (selectedAssignment) {
      navigate('/evaluation', {
        state: {
          courseId: selectedAssignment.courseid,
          groupId: selectedAssignment.groupid,
          courseName: selectedAssignment.course_name,
          groupName: selectedAssignment.group_name,
          professorName: selectedAssignment.professorname,
          assignmentId: selectedAssignment.assignmentid,
          dueDate: selectedAssignment.due_date
        }
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.SUCCESS_GREEN;
      case 'overdue':
        return COLORS.ERROR_RED;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const containerStyle = {
    fontFamily: 'Georgia, serif',
    backgroundColor: COLORS.BODY_BACKGROUND,
    minHeight: '100vh',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: COLORS.WHITE,
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '30px',
    textAlign: 'center',
  };

  const sectionStyle = {
    marginBottom: '30px',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '15px',
  };

  const listItemStyle = {
    padding: '15px',
    marginBottom: '10px',
    border: `2px solid ${COLORS.TAN_BASE}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: COLORS.WHITE,
  };

  const selectedItemStyle = {
    ...listItemStyle,
    borderColor: COLORS.NAVY_BUTTON,
    backgroundColor: '#f0f4ff',
  };

  const buttonStyle = {
    backgroundColor: COLORS.NAVY_BUTTON,
    color: COLORS.WHITE,
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontFamily: 'Georgia, serif',
    transition: 'background-color 0.2s',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: COLORS.TEXT_SECONDARY,
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  const errorStyle = {
    backgroundColor: '#fee',
    color: COLORS.ERROR_RED,
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading your evaluation assignments...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>My Evaluation Assignments</h1>
        
        {error && <div style={errorStyle}>{error}</div>}

        {assignments.length === 0 && !error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              No evaluation assignments found.
            </p>
            <p style={{ fontSize: '14px' }}>
              Your professor will assign evaluations when they are ready. Please check back later.
            </p>
          </div>
        ) : (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Assigned Evaluations</h2>
            {assignments.map((assignment) => (
              <div
                key={assignment.assignmentid}
                style={selectedAssignment?.assignmentid === assignment.assignmentid ? selectedItemStyle : {
                  ...listItemStyle,
                  borderLeft: `4px solid ${getStatusColor(assignment.status)}`,
                }}
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                  {assignment.assignment_name || 'Peer Evaluation'}
                </div>
                <div style={{ color: COLORS.TEXT_PRIMARY, fontSize: '16px', marginBottom: '5px' }}>
                  <strong>Course:</strong> {assignment.course_name} ({assignment.semester})
                </div>
                <div style={{ color: COLORS.TEXT_PRIMARY, fontSize: '16px', marginBottom: '5px' }}>
                  <strong>Group:</strong> {assignment.group_name}
                </div>
                <div style={{ color: COLORS.TEXT_PRIMARY, fontSize: '16px', marginBottom: '5px' }}>
                  <strong>Professor:</strong> {assignment.professorname}
                </div>
                <div style={{ color: COLORS.TEXT_PRIMARY, fontSize: '16px', marginBottom: '5px' }}>
                  <strong>Due Date:</strong> {formatDate(assignment.due_date)}
                </div>
                <div style={{ 
                  color: getStatusColor(assignment.status), 
                  fontSize: '16px',
                  fontWeight: '600',
                  marginTop: '8px'
                }}>
                  Status: {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  {assignment.completed_at && (
                    <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                      (Completed: {formatDate(assignment.completed_at)})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Evaluation Button */}
        {selectedAssignment && selectedAssignment.status !== 'completed' && (
          <button
            onClick={handleStartEvaluation}
            style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0f1538'}
            onMouseOut={(e) => e.target.style.backgroundColor = COLORS.NAVY_BUTTON}
          >
            {selectedAssignment.status === 'overdue' ? 'Start Evaluation (Overdue)' : 'Start Evaluation'}
          </button>
        )}

        {selectedAssignment && selectedAssignment.status === 'completed' && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#efe', 
            color: COLORS.SUCCESS_GREEN, 
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            ✓ This evaluation has been completed.
          </div>
        )}
      </div>
    </div>
  );
}

