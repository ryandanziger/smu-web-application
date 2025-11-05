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
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/professors`);
      const data = await response.json();
      
      if (response.ok) {
        setProfessors(data.professors || []);
        if (data.professors && data.professors.length === 0) {
          setError('No professors with courses found.');
        }
      } else {
        setError(data.message || 'Failed to load professors');
      }
    } catch (err) {
      console.error('Error fetching professors:', err);
      setError('Failed to load professors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async (professorId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/professors/${professorId}/courses`);
      const data = await response.json();
      
      if (response.ok) {
        setCourses(data.courses || []);
        if (data.courses && data.courses.length === 0) {
          setError('This professor has no courses.');
        } else {
          setError('');
        }
      } else {
        setError(data.message || 'Failed to load courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/groups`);
      const data = await response.json();
      
      if (response.ok) {
        setGroups(data.groups || []);
      } else {
        setError(data.message || 'Failed to load groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again.');
    }
  };

  const handleProfessorSelect = (professor) => {
    setSelectedProfessor(professor);
    setSelectedCourse(null);
    setSelectedGroup(null);
    setCourses([]);
    setGroups([]);
    // Use username as identifier (backend will look it up)
    fetchCourses(professor.username);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedGroup(null);
    setGroups([]);
    fetchGroups(course.courseid);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleStartEvaluation = () => {
    if (selectedCourse && selectedGroup) {
      navigate('/evaluation', {
        state: {
          courseId: selectedCourse.courseid,
          groupId: selectedGroup.groupid,
          courseName: selectedCourse.course_name,
          groupName: selectedGroup.group_name,
          professorName: selectedProfessor?.professorname
        }
      });
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

  if (isLoading && professors.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading professors...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Select Professor, Course, and Group</h1>
        
        {error && <div style={errorStyle}>{error}</div>}

        {/* Professor Selection */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>1. Select Professor</h2>
          {professors.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
              No professors available
            </div>
          ) : (
            professors.map((professor) => (
              <div
                key={professor.username}
                style={selectedProfessor?.username === professor.username ? selectedItemStyle : listItemStyle}
                onClick={() => handleProfessorSelect(professor)}
              >
                <div style={{ fontWeight: '600', fontSize: '18px' }}>
                  {professor.username}
                </div>
                {professor.email && (
                  <div style={{ color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>
                    {professor.email}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Course Selection */}
        {selectedProfessor && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>2. Select Course</h2>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                No courses available for this professor
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.courseid}
                  style={selectedCourse?.courseid === course.courseid ? selectedItemStyle : listItemStyle}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '5px' }}>
                    {course.course_name}
                  </div>
                  <div style={{ color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>
                    Semester: {course.semester}
                    {course.class_time && ` | Time: ${course.class_time}`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Group Selection */}
        {selectedCourse && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>3. Select Group</h2>
            {groups.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                No groups available for this course
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.groupid}
                  style={selectedGroup?.groupid === group.groupid ? selectedItemStyle : listItemStyle}
                  onClick={() => handleGroupSelect(group)}
                >
                  <div style={{ fontWeight: '600', fontSize: '18px' }}>
                    {group.group_name}
                  </div>
                  <div style={{ color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>
                    {group.student_count || 0} member(s)
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Start Evaluation Button */}
        {selectedCourse && selectedGroup && (
          <button
            onClick={handleStartEvaluation}
            style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0f1538'}
            onMouseOut={(e) => e.target.style.backgroundColor = COLORS.NAVY_BUTTON}
          >
            Start Evaluation
          </button>
        )}
      </div>
    </div>
  );
}

