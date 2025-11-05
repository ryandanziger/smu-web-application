import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- Color Palette (matching existing components) ---
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

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!user) {
      console.log('No user object available');
      return;
    }
    
    try {
      setIsLoading(true);
      // Debug: log user object
      console.log('Current user object:', user);
      console.log('User email:', user.email);
      console.log('User username:', user.username);
      
      // Use user email first (most reliable), then username
      const identifier = user.email || user.username || '';
      
      if (!identifier) {
        console.error('No user identifier available. User object:', JSON.stringify(user, null, 2));
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching courses for identifier:', identifier);
      
      const response = await fetch(
        `${API_URL}/api/professors/${encodeURIComponent(identifier)}/courses`
      );
      const data = await response.json();
      
      console.log('API response:', response.status, data);
      
      if (response.ok) {
        setCourses(data.courses || []);
        console.log('Successfully fetched courses:', data.courses);
      } else {
        console.error('Failed to fetch courses:', data.message);
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  // Refresh courses when navigating back to dashboard (e.g., after creating a course)
  useEffect(() => {
    if (location.state?.refresh && user) {
      fetchCourses();
      // Clear the refresh flag
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.refresh, user, fetchCourses]);

  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone and will remove all associated students, groups, and evaluations.`)) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      console.log(`[FRONTEND] Attempting to delete course ${courseId}: ${courseName}`);
      
      const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log(`[FRONTEND] Response content-type: ${contentType}`);
      console.log(`[FRONTEND] Response status: ${response.status}`);

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text to see what we got
        const text = await response.text();
        console.error(`[FRONTEND] Non-JSON response received:`, text.substring(0, 200));
        throw new Error(`Server returned non-JSON response (${response.status}). The DELETE endpoint may not be registered. Please restart the backend server.`);
      }

      console.log(`[FRONTEND] Delete response data:`, data);

      if (response.ok) {
        // Remove course from local state
        setCourses(prevCourses => prevCourses.filter(c => c.courseid !== courseId));
        console.log(`[FRONTEND] Course ${courseId} removed from UI successfully`);
      } else {
        const errorMsg = data.detail 
          ? `${data.message}: ${data.detail}` 
          : data.message || data.error || 'Unknown error';
        console.error(`[FRONTEND] Delete failed:`, errorMsg);
        alert(`Failed to delete course: ${errorMsg}`);
      }
    } catch (err) {
      console.error('[FRONTEND] Error deleting course:', err);
      alert(`Error deleting course: ${err.message}. Please check the console and ensure the backend server is running.`);
    } finally {
      setDeletingCourseId(null);
    }
  };

  const outerContainerStyle = {
    fontFamily: 'Georgia, serif',
    backgroundColor: COLORS.BODY_BACKGROUND,
    minHeight: '100vh',
  };

  const headerBannerStyle = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://www.kenan-flagler.unc.edu/wp-content/uploads/nmc-images/2019/10/singapore_skyline-width2000height772.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '50px 0 10px 0',
    position: 'relative',
  };

  const titleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 40px',
    width: '100%',
  };

  const titleStyle = {
    fontSize: '30px',
    fontWeight: 'normal',
    margin: 0,
    color: COLORS.WHITE,
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '5px',
  };

  const mainContentStyle = {
    display: 'flex',
    padding: '20px',
    gap: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
    flexDirection: 'column',
  };

  const coursesSectionStyle = {
    backgroundColor: COLORS.WHITE,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  };

  const chartsSectionStyle = {
    backgroundColor: COLORS.WHITE,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '20px',
    fontFamily: 'Georgia, serif',
  };

  const courseCardStyle = {
    border: `1px solid ${COLORS.TAN_BASE}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    transition: 'all 0.2s',
    backgroundColor: COLORS.WHITE,
    position: 'relative',
  };

  const courseCardContentStyle = {
    cursor: 'pointer',
  };

  const courseCardHoverStyle = {
    ...courseCardStyle,
    borderColor: COLORS.NAVY_BUTTON,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const courseNameStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '8px',
  };

  const courseInfoStyle = {
    fontSize: '14px',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: '4px',
  };

  const deleteButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: COLORS.ERROR_RED,
    color: COLORS.WHITE,
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: 'Georgia, serif',
    transition: 'background-color 0.2s',
  };

  const deleteButtonHoverStyle = {
    backgroundColor: '#a05a5a',
  };

  const buttonStyle = {
    backgroundColor: COLORS.NAVY_BUTTON,
    color: COLORS.WHITE,
    padding: '12px 24px',
    borderRadius: '4px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    transition: 'background-color 0.2s',
    marginBottom: '20px',
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
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

  const sectionTitleChartStyle = {
    fontSize: '28px',
    fontWeight: 'normal',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '15px',
    padding: '20px 20px 0 20px',
    fontFamily: 'Joan, serif',
  };

  return (
    <div style={outerContainerStyle}>
      {/* Header Banner */}
      <div style={headerBannerStyle}>
        <div style={titleContainerStyle}>
          <h1 style={titleStyle}>Classes</h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Courses Section */}
        <div style={coursesSectionStyle}>
          <div style={actionButtonsStyle}>
            <button
              onClick={() => navigate('/create-course')}
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0f1538'}
              onMouseOut={(e) => e.target.style.backgroundColor = COLORS.NAVY_BUTTON}
            >
              Create New Course
            </button>
          </div>

          <h2 style={sectionTitleStyle}>My Courses</h2>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: COLORS.TEXT_SECONDARY }}>
              <div>No courses found. Create your first course to get started.</div>
              <div style={{ marginTop: '10px', fontSize: '12px' }}>
                Check browser console for debugging information.
              </div>
            </div>
          ) : (
            <div>
              {courses.map((course) => (
                <div
                  key={course.courseid}
                  style={courseCardStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, courseCardHoverStyle);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, courseCardStyle);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.courseid, course.course_name);
                    }}
                    disabled={deletingCourseId === course.courseid}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => {
                      if (deletingCourseId !== course.courseid) {
                        e.target.style.backgroundColor = deleteButtonHoverStyle.backgroundColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deletingCourseId !== course.courseid) {
                        e.target.style.backgroundColor = deleteButtonStyle.backgroundColor;
                      }
                    }}
                    title="Delete course"
                  >
                    {deletingCourseId === course.courseid ? 'Deleting...' : '×'}
                  </button>
                  <div
                    style={courseCardContentStyle}
                    onClick={() => navigate(`/course-roster/${course.courseid}`)}
                  >
                    <div style={courseNameStyle}>{course.course_name}</div>
                    <div style={courseInfoStyle}>Semester: {course.semester}</div>
                    {course.class_time && (
                      <div style={courseInfoStyle}>Time: {course.class_time}</div>
                    )}
                    <div style={courseInfoStyle}>Students: {course.student_count || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div style={chartsSectionStyle}>
          <h2 style={sectionTitleStyle}>Analytics Dashboard</h2>
          
          <div style={{ padding: '0 20px 20px 20px', fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
            View comprehensive analytics and insights from peer evaluation data. 
            The dashboards below provide detailed visualizations of team performance, 
            evaluation trends, and individual contributions.
          </div>

          {/* Dashboard 1 */}
          <div style={iframeContainerStyle}>
            <h3 style={sectionTitleChartStyle}>Team Performance Overview</h3>
            <iframe 
              width="600" 
              height="450" 
              src="https://lookerstudio.google.com/embed/reporting/68aa6e38-0293-42df-a1df-426f144d2b94/page/p_gqsfcjbfxd" 
              frameBorder="0" 
              style={iframeStyle}
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              title="Team Performance Overview"
            />
          </div>

          {/* Dashboard 2 */}
          <div style={iframeContainerStyle}>
            <h3 style={sectionTitleChartStyle}>Evaluation Trends Analysis</h3>
            <iframe 
              width="600" 
              height="450" 
              src="https://lookerstudio.google.com/embed/reporting/68aa6e38-0293-42df-a1df-426f144d2b94/page/6iicF" 
              frameBorder="0" 
              style={iframeStyle}
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              title="Evaluation Trends Analysis"
            />
          </div>

          {/* Dashboard 3 */}
          <div style={iframeContainerStyle}>
            <h3 style={sectionTitleChartStyle}>Individual Contribution Metrics</h3>
            <iframe 
              width="600" 
              height="450" 
              src="https://lookerstudio.google.com/embed/reporting/68aa6e38-0293-42df-a1df-426f144d2b94/page/p_jha4bybfxd" 
              frameBorder="0" 
              style={iframeStyle}
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              title="Individual Contribution Metrics"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

