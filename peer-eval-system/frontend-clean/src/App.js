import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Your custom SMU styles
import EvaluationForm from './components/EvaluationForm.js'; // Adjust path if needed
import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';

function App() {
  return (
    <>
      {/* SMU Navbar */}
      <Navbar expand="lg" style={{ backgroundColor: '#00205B' }} variant="dark">
        <Container>
          <Navbar.Brand href="#" className="fw-bold">
         SMU Peer Evaluation
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="smu-navbar" />
          <Navbar.Collapse id="smu-navbar">
            <Nav className="ms-auto">
              <Nav.Link href="#" className="text-light">Home</Nav.Link>
              <Nav.Link href="#" className="text-light">Account</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <EvaluationForm />
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="text-center py-4 mt-5" style={{ backgroundColor: '#F5F5F5' }}>
        <p className="mb-0 text-muted">
          &copy; {new Date().getFullYear()} Demo. For Educational Project.
        </p>
      </footer>
    </>
  );
}

export default App;
