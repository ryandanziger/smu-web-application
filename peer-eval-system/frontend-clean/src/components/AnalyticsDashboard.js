import React, { useState, useEffect, useMemo } from 'react';
import API_URL from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import SemiCircularGauge from './charts/SemiCircularGauge';
import CircularGauge from './charts/CircularGauge';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  // Chart configurations using useMemo for performance
  const chartConfigs = useMemo(() => {
    if (!analytics) return {};

    // Bar chart colors
    const barColors = [
      '#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6',
      '#E67E22', '#3498DB', '#2ECC71', '#E74C3C', '#F39C12', '#1ABC9C'
    ];

    return {
      // Assigned Peer Evals by Group
      assignmentsByGroup: {
        labels: analytics.assignmentsPerGroup?.map(g => g.groupName) || [],
        datasets: [{
          label: 'Assigned Peer Evals',
          data: analytics.assignmentsPerGroup?.map(g => g.assignmentCount) || [],
          backgroundColor: barColors.slice(0, analytics.assignmentsPerGroup?.length || 0),
          borderColor: barColors.slice(0, analytics.assignmentsPerGroup?.length || 0),
          borderWidth: 1,
        }]
      },

      // Number of Students by Group
      studentsByGroup: {
        labels: analytics.studentsPerGroup?.map(g => g.groupName) || [],
        datasets: [{
          label: 'Number of Students',
          data: analytics.studentsPerGroup?.map(g => g.studentCount) || [],
          backgroundColor: barColors.slice(0, analytics.studentsPerGroup?.length || 0),
          borderColor: barColors.slice(0, analytics.studentsPerGroup?.length || 0),
          borderWidth: 1,
        }]
      },

      // Average Score by Student (grouped bar chart)
      averageScoreByStudent: {
        labels: analytics.studentScores?.map(s => s.studentName).slice(0, 14) || [],
        datasets: analytics.studentScores && analytics.studentScores.length > 0 ? [
          {
            label: 'Contribution',
            data: analytics.studentScores.slice(0, 14).map(s => parseFloat(s.contributionScore) || 0),
            backgroundColor: '#4A90E2',
          },
          {
            label: 'Plan Management',
            data: analytics.studentScores.slice(0, 14).map(s => parseFloat(s.planMgmtScore) || 0),
            backgroundColor: '#50C878',
          },
          {
            label: 'Team Climate',
            data: analytics.studentScores.slice(0, 14).map(s => parseFloat(s.teamClimateScore) || 0),
            backgroundColor: '#FF6B6B',
          },
          {
            label: 'Conflict Resolution',
            data: analytics.studentScores.slice(0, 14).map(s => parseFloat(s.conflictResScore) || 0),
            backgroundColor: '#FFA500',
          },
          {
            label: 'Overall Rating',
            data: analytics.studentScores.slice(0, 14).map(s => parseFloat(s.overallRating) || 0),
            backgroundColor: '#FFD700',
          }
        ] : []
      },

      // Peer Evals Scheduled by Professor
      evalsByProfessor: {
        labels: analytics.evaluationsPerProfessor?.map(p => p.professorName) || [],
        datasets: [{
          label: 'Peer Evals Scheduled',
          data: analytics.evaluationsPerProfessor?.map(p => p.scheduledCount) || [],
          backgroundColor: barColors.slice(0, analytics.evaluationsPerProfessor?.length || 0),
          borderColor: barColors.slice(0, analytics.evaluationsPerProfessor?.length || 0),
          borderWidth: 1,
        }]
      },

      // Courses and Students by Professor (grouped)
      professorStats: {
        labels: analytics.professorStats?.map(p => p.professorName) || [],
        datasets: [
          {
            label: 'Number of Total Courses',
            data: analytics.professorStats?.map(p => p.courseCount) || [],
            backgroundColor: '#4A90E2',
            borderColor: '#4A90E2',
            borderWidth: 1,
          },
          {
            label: 'Number of Total Students',
            data: analytics.professorStats?.map(p => p.studentCount) || [],
            backgroundColor: '#50C878',
            borderColor: '#50C878',
            borderWidth: 1,
          }
        ]
      },

      // Peer Evals Scheduled per Semester (line chart)
      evalsBySemester: {
        labels: analytics.evaluationsPerSemester?.map(s => s.semester) || [],
        datasets: [
          {
            label: 'Target',
            data: analytics.evaluationsPerSemester?.map(s => s.scheduledCount) || [],
            borderColor: '#4A90E2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#4A90E2',
          },
          {
            label: 'Threshold',
            data: analytics.evaluationsPerSemester?.map(() => 100) || [],
            borderColor: '#999',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
          }
        ]
      }
    };
  }, [analytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        title: {
          display: true,
          text: 'Average Score',
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Peer Evals Scheduled',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Semester',
        },
      },
    },
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
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
    marginBottom: '15px',
    borderBottom: `1px solid ${COLORS.BORDER_COLOR}`,
    paddingBottom: '10px',
    textAlign: 'center',
  };

  const fullWidthWidgetStyle = {
    ...widgetCardStyle,
    gridColumn: '1 / -1',
    minHeight: '400px',
  };

  const chartContainerStyle = {
    height: '350px',
    position: 'relative',
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
          <h1 style={titleStyle}>Final Dashboard</h1>
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
        {/* Widget 1: Total Number of Peer Evaluations Submitted (Semi-circular gauge) */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Total Number of Peer Evaluations Submitted (Fall 2025)</div>
          <SemiCircularGauge
            value={analytics.totalEvaluations || 0}
            max={80}
            threshold={80}
            color="#FFD700"
          />
        </div>

        {/* Widget 2: Overall Average Peer Evaluation Score (Semi-circular gauge) */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Overall Average Peer Evaluation Score</div>
          <SemiCircularGauge
            value={parseFloat(analytics.overallAverageScore) || 0}
            max={4}
            threshold={3.20}
            color="#00AD5D"
          />
        </div>

        {/* Widget 3: Total Number of Imported Students (KPI) */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Total Number of Imported Students</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', padding: '40px 0', color: COLORS.TEXT_PRIMARY }}>
            {analytics.totalStudents || 0}
          </div>
        </div>

        {/* Widget 4: Percentage of Students who have Submitted (Circular gauge) */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Percentage of Students who have Submitted a Peer Evaluation</div>
          <CircularGauge
            value={analytics.submissionRate?.percentage || 0}
            max={100}
            color={analytics.submissionRate?.percentage >= 50 ? '#00AD5D' : '#FF6B6B'}
          />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '10px' }}>
            {analytics.submissionRate?.submitted || 0} of {analytics.submissionRate?.total || 0} students
          </div>
        </div>

        {/* Widget 5: Percentage of Scheduled Evals Completed (Circular gauge) */}
        <div style={widgetCardStyle}>
          <div style={widgetTitleStyle}>Percentage of Scheduled Peer Evals that have been Completed</div>
          <CircularGauge
            value={analytics.completionRate?.percentage || 0}
            max={100}
            color={analytics.completionRate?.percentage >= 50 ? '#00AD5D' : '#FF6B6B'}
          />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '10px' }}>
            {analytics.completionRate?.completed || 0} of {analytics.completionRate?.total || 0} assignments
          </div>
        </div>

        {/* Widget 6: Average Peer Evaluation Scores by Student (Bar Chart) */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Average Peer Evaluation Scores by Student</div>
          <div style={chartContainerStyle}>
            {chartConfigs.averageScoreByStudent?.datasets?.length > 0 ? (
              <Bar data={chartConfigs.averageScoreByStudent} options={chartOptions} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>
                No evaluation data available
              </div>
            )}
          </div>
        </div>

        {/* Widget 7: Number of Students Assigned to each Group (Bar Chart) */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Number of Students Assigned to each Group</div>
          <div style={chartContainerStyle}>
            {chartConfigs.studentsByGroup?.labels?.length > 0 ? (
              <Bar data={chartConfigs.studentsByGroup} options={chartOptions} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>
                No group data available
              </div>
            )}
          </div>
        </div>

        {/* Widget 8: Number of Students and Courses Taught by each Professor (Grouped Bar Chart) */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Number of Students and Courses Taught by each Professor</div>
          <div style={chartContainerStyle}>
            {chartConfigs.professorStats?.labels?.length > 0 ? (
              <Bar data={chartConfigs.professorStats} options={chartOptions} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>
                No professor data available
              </div>
            )}
          </div>
        </div>

        {/* Widget 9: Scheduled Peer Evaluations per Professor (Bar Chart) */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Scheduled Peer Evaluations per Professor</div>
          <div style={chartContainerStyle}>
            {chartConfigs.evalsByProfessor?.labels?.length > 0 ? (
              <Bar data={chartConfigs.evalsByProfessor} options={chartOptions} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>
                No scheduled evaluations available
              </div>
            )}
          </div>
        </div>

        {/* Widget 10: Total Peer Evaluation Assignments per Group (Bar Chart) */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Total Peer Evaluation Assignments per Group</div>
          <div style={chartContainerStyle}>
            {chartConfigs.assignmentsByGroup?.labels?.length > 0 ? (
              <Bar data={chartConfigs.assignmentsByGroup} options={chartOptions} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>
                No assignment data available
              </div>
            )}
          </div>
        </div>

        {/* Widget 11: Total Peer Evaluations Scheduled per Semester (Line Chart) */}
        <div style={fullWidthWidgetStyle}>
          <div style={widgetTitleStyle}>Total Peer Evaluations Scheduled per Semester</div>
          <div style={chartContainerStyle}>
            {chartConfigs.evalsBySemester?.labels?.length > 0 ? (
              <Line data={chartConfigs.evalsBySemester} options={lineChartOptions} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>
                No semester data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
