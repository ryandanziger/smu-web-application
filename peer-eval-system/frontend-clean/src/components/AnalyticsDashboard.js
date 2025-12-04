import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  WHITE: 'white',
  NAVY_BUTTON: '#141b4d',
  TEXT_PRIMARY: '#2d3748',
  TEXT_SECONDARY: '#5C7094',
  ERROR_RED: '#C97C7C',
  SUCCESS_GREEN: '#4CAF50',
  BODY_BACKGROUND: '#f2f2f2',
  HEADER_TEXT: '#2d3748',
  CARD_BACKGROUND: '#fff',
  BORDER_COLOR: '#D9D9D9',
};

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'professor') {
      navigate('/dashboard');
      return;
    }

    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/analytics/dashboard`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
      
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const outerContainerStyle = {
    fontFamily: 'Arial, Verdana, sans-serif',
    backgroundColor: COLORS.BODY_BACKGROUND,
    minHeight: '100vh',
    padding: '20px',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '10px',
  };

  const dashboardGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1440px',
    margin: '0 auto',
  };

  const widgetCardStyle = {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: '6px',
    padding: '20px',
    boxShadow: '0px 0px 8px 0 rgba(0,0,0,0.2)',
    border: `1px solid ${COLORS.BORDER_COLOR}`,
  };

  const widgetTitleStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '10px',
    borderBottom: `1px solid ${COLORS.BORDER_COLOR}`,
    paddingBottom: '10px',
  };

  const widgetDescStyle = {
    fontSize: '12px',
    color: '#808081',
    marginBottom: '15px',
  };

  const kpiValueStyle = {
    fontSize: '40px',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: '5px',
  };

  const kpiLabelStyle = {
    fontSize: '15px',
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  };

  const thStyle = {
    backgroundColor: '#F3F3F3',
    padding: '8px',
    textAlign: 'left',
    borderBottom: '1px solid #E1E1E1',
    fontWeight: 'bold',
  };

  const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #E1E1E1',
  };

  const fullWidthWidgetStyle = {
    ...widgetCardStyle,
    gridColumn: '1 / -1',
  };

  if (isLoading) {
    return (
      <div style={outerContainerStyle}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={outerContainerStyle}>
        <div style={{ textAlign: 'center', padding: '50px', color: COLORS.ERROR_RED }}>
          Error loading analytics: {error}
          <button
            onClick={fetchAnalytics}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: COLORS.NAVY_BUTTON,
              color: COLORS.WHITE,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div style={outerContainerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1440px', margin: '0 auto 20px' }}>
          <h1 style={titleStyle}>Analytics Dashboard</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: COLORS.NAVY_BUTTON,
              color: COLORS.WHITE,
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ← Back to Classes
          </button>
        </div>
      </div>

      <div style={dashboardGridStyle}>
        {/* Widget 1: Total Number of Peer Evaluations Submitted */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Total Number of Peer Evaluations Submitted</div>
          <div style={kpiValueStyle}>{analytics.totalEvaluations || 0}</div>
          <div style={widgetDescStyle}>Fall 2025</div>
        </div>

        {/* Widget 2: Overall Average Peer Evaluation Score */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Overall Average Peer Evaluation Score</div>
          <div style={kpiValueStyle}>
            {analytics.overallAverageScore || 'N/A'}
          </div>
          <div style={widgetDescStyle}>Average of all submitted evaluations</div>
        </div>

        {/* Widget 3: Total Number of Imported Students */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Total Number of Imported Students</div>
          <div style={kpiValueStyle}>{analytics.totalStudents || 0}</div>
          <div style={widgetDescStyle}>All students in system</div>
        </div>

        {/* Widget 4: Percentage of Students who have Submitted */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Percentage of Students who have Submitted a Peer Evaluation</div>
          <div style={kpiValueStyle}>
            {analytics.submissionRate.percentage.toFixed(1)}%
          </div>
          <div style={widgetDescStyle}>
            {analytics.submissionRate.submitted} of {analytics.submissionRate.total} students
          </div>
        </div>

        {/* Widget 5: Percentage of Scheduled Evals Completed */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Percentage of Scheduled Peer Evals that have been Completed</div>
          <div style={kpiValueStyle}>
            {analytics.completionRate.percentage.toFixed(1)}%
          </div>
          <div style={widgetDescStyle}>
            {analytics.completionRate.completed} of {analytics.completionRate.total} assignments
          </div>
        </div>

        {/* Widget 6: Average Peer Evaluation Scores by Student */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Average Peer Evaluation Scores by Student</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Student Name</th>
                  <th style={thStyle}>Average Score</th>
                  <th style={thStyle}>Number of Evaluations</th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentScores && analytics.studentScores.length > 0 ? (
                  analytics.studentScores.map((student, index) => (
                    <tr key={student.studentId || index}>
                      <td style={tdStyle}>{student.studentName}</td>
                      <td style={tdStyle}>{student.averageScore}</td>
                      <td style={tdStyle}>{student.evaluationCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                      No evaluation data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 7: Number of Students Assigned to each Group */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Number of Students Assigned to each Group</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Group Name</th>
                  <th style={thStyle}>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentsPerGroup && analytics.studentsPerGroup.length > 0 ? (
                  analytics.studentsPerGroup.map((group, index) => (
                    <tr key={group.groupId || index}>
                      <td style={tdStyle}>{group.courseName || 'N/A'}</td>
                      <td style={tdStyle}>{group.groupName}</td>
                      <td style={tdStyle}>{group.studentCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                      No group data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 8: Number of Students and Courses Taught by each Professor */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Number of Students and Courses Taught by each Professor</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Professor Name</th>
                  <th style={thStyle}>Number of Courses</th>
                  <th style={thStyle}>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                {analytics.professorStats && analytics.professorStats.length > 0 ? (
                  analytics.professorStats.map((prof, index) => (
                    <tr key={prof.professorId || index}>
                      <td style={tdStyle}>{prof.professorName}</td>
                      <td style={tdStyle}>{prof.courseCount}</td>
                      <td style={tdStyle}>{prof.studentCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                      No professor data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 9: Scheduled Peer Evaluations per Professor */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Scheduled Peer Evaluations per Professor</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Professor Name</th>
                  <th style={thStyle}>Number of Scheduled Evaluations</th>
                </tr>
              </thead>
              <tbody>
                {analytics.evaluationsPerProfessor && analytics.evaluationsPerProfessor.length > 0 ? (
                  analytics.evaluationsPerProfessor
                    .filter(p => p.scheduledCount > 0)
                    .map((prof, index) => (
                      <tr key={prof.professorId || index}>
                        <td style={tdStyle}>{prof.professorName}</td>
                        <td style={tdStyle}>{prof.scheduledCount}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ ...tdStyle, textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                      No scheduled evaluations available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 10: Total Peer Evaluation Assignments per Group */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Total Peer Evaluation Assignments per Group</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Group Name</th>
                  <th style={thStyle}>Number of Assignments</th>
                </tr>
              </thead>
              <tbody>
                {analytics.assignmentsPerGroup && analytics.assignmentsPerGroup.length > 0 ? (
                  analytics.assignmentsPerGroup.map((group, index) => (
                    <tr key={group.groupId || index}>
                      <td style={tdStyle}>{group.courseName || 'N/A'}</td>
                      <td style={tdStyle}>{group.groupName}</td>
                      <td style={tdStyle}>{group.assignmentCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                      No assignment data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 11: Total Peer Evaluations Scheduled per Semester */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Total Peer Evaluations Scheduled per Semester</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Semester</th>
                  <th style={thStyle}>Number of Scheduled Evaluations</th>
                </tr>
              </thead>
              <tbody>
                {analytics.evaluationsPerSemester && analytics.evaluationsPerSemester.length > 0 ? (
                  analytics.evaluationsPerSemester.map((semester, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>{semester.semester}</td>
                      <td style={tdStyle}>{semester.scheduledCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ ...tdStyle, textAlign: 'center', color: COLORS.TEXT_SECONDARY }}>
                      No semester data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

