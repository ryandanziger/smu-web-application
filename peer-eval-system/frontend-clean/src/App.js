import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Your custom SMU styles
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import ForgotPassword from './components/ForgotPassword.js';
import ResetPassword from './components/ResetPassword.js';
import EvaluationForm from './components/EvaluationForm.js';
import EvaluationSelection from './components/EvaluationSelection.js';
import ProfessorDashboard from './components/ProfessorDashboard.js';
import CourseCreation from './components/CourseCreation.js';
import CourseRoster from './components/CourseRoster.js';
import GroupManagement from './components/GroupManagement.js';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Georgia, serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Main App Content
function AppContent() {
  const { user, logout } = useAuth();

  return (
    <>
      {/* SMU Navbar */}
      <Navbar expand="lg" style={{ backgroundColor: '#00205B' }} variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            SMU Peer Evaluation
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="smu-navbar" />
          <Navbar.Collapse id="smu-navbar">
            <Nav className="ms-auto">
              {user?.role === 'student' && (
                <Nav.Link as={Link} to="/evaluation-selection" className="text-light">Evaluation</Nav.Link>
              )}
              {user?.role === 'professor' && (
                <>
                  <Nav.Link as={Link} to="/dashboard" className="text-light">Classes</Nav.Link>
                  <Nav.Link as={Link} to="/create-course" className="text-light">Create Course</Nav.Link>
                </>
              )}
              <Nav.Link onClick={logout} className="text-light" style={{ cursor: 'pointer' }}>
                Logout ({user?.role})
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/evaluation-selection" element={
          <ProtectedRoute allowedRoles={['student']}>
            <EvaluationSelection />
          </ProtectedRoute>
        } />
        <Route path="/evaluation" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Container className="py-5">
              <Row className="justify-content-center">
                <Col md={10} lg={8}>
                  <EvaluationForm />
                </Col>
              </Row>
            </Container>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['professor']}>
            <ProfessorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/create-course" element={
          <ProtectedRoute allowedRoles={['professor']}>
            <CourseCreation />
          </ProtectedRoute>
        } />
        <Route path="/course-roster/:courseId" element={
          <ProtectedRoute allowedRoles={['professor']}>
            <CourseRoster />
          </ProtectedRoute>
        } />
        <Route path="/manage-groups/:courseId" element={
          <ProtectedRoute allowedRoles={['professor']}>
            <GroupManagement />
          </ProtectedRoute>
        } />
      </Routes>

      {/* Footer */}
      <footer className="text-center py-4 mt-5" style={{ backgroundColor: '#F5F5F5' }}>
        <p className="mb-0 text-muted">
          &copy; {new Date().getFullYear()} Demo. For Educational Project.
        </p>
      </footer>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
