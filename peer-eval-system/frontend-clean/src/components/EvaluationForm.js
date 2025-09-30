
import { useState } from 'react';
import {
  Container,
  Card,
  Button,
  Form,
  ProgressBar,
  Alert,
  Row,
  Col
} from 'react-bootstrap';

const mockTeammates = [
  { id: 1, name: "Ben Holt" },
  { id: 2, name: "Zack Mitchell" },
  { id: 3, name: "Ashley Gutierrez" }
];

const evaluationCriteria = [
  { key: 'communication', label: 'Communication' },
  { key: 'contribution', label: 'Contribution to Project' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'teamwork', label: 'Teamwork & Collaboration' }
];

function RatingInput({ label, value, onChange, name, error }) {
  return (
    <Form.Group className="mb-4 text-center">
      <Form.Label className="fw-semibold text-smu-blue">{label}</Form.Label>
      <div className="d-flex justify-content-center gap-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Form.Check
            key={rating}
            inline
            label={rating}
            name={name}
            type="radio"
            value={rating}
            checked={value === rating}
            onChange={(e) => onChange(parseInt(e.target.value))}
          />
        ))}
      </div>
      <Form.Text className="text-muted">1 = Needs Improvement, 5 = Excellent</Form.Text>
      {error && <div className="text-danger mt-1">{error}</div>}
    </Form.Group>
  );
}

export default function EvaluationForm() {
  const [currentTeammateIndex, setCurrentTeammateIndex] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    communication: null,
    contribution: null,
    reliability: null,
    teamwork: null,
    feedback: ''
  });

  const currentTeammate = mockTeammates[currentTeammateIndex];
  const progress = (evaluations.length / mockTeammates.length) * 100;

  const validateForm = () => {
    const newErrors = {};
    evaluationCriteria.forEach(({ key, label }) => {
      if (formData[key] === null) {
        newErrors[key] = `${label} rating is required`;
      }
    });
    if (formData.feedback.trim().length < 20) {
      newErrors.feedback = 'Feedback must be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const evaluation = {
      teammateId: currentTeammate.id,
      teammateName: currentTeammate.name,
      ...formData,
      submittedAt: new Date().toISOString()
    };

    setEvaluations([...evaluations, evaluation]);

    if (currentTeammateIndex < mockTeammates.length - 1) {
      setCurrentTeammateIndex(currentTeammateIndex + 1);
      resetForm();
    } else {
      setShowSuccess(true);
    }
  };

  const resetForm = () => {
    setFormData({
      communication: null,
      contribution: null,
      reliability: null,
      teamwork: null,
      feedback: ''
    });
    setErrors({});
  };

  if (showSuccess) {
    return (
      <Card className="text-center p-4 card-smu">
        <div className="display-4 mb-3">✅</div>
        <Card.Title>Evaluations Submitted Successfully!</Card.Title>
        <Card.Text>
          You have completed evaluations for all {mockTeammates.length} teammates.
        </Card.Text>
        <Button className="btn-smu" onClick={() => {
          setShowSuccess(false);
          setCurrentTeammateIndex(0);
          setEvaluations([]);
          resetForm();
        }}>
          Submit Another Set
        </Button>
      </Card>
    );
  }

  return (
    <Card className="card-smu">
      <Card.Header className="text-white text-center" style={{ backgroundColor: '#00205B' }}>
        <h4 className="mb-0">Peer Evaluation Form</h4>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between small text-muted mb-2">
            <span>Progress: {evaluations.length} of {mockTeammates.length} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar now={progress} className="bg-smu-gold" />
        </div>

        <Alert variant="info" className="text-center">
          <strong>Evaluating:</strong> {currentTeammate.name}
          <br />
          <small>Your responses are confidential. Please provide honest and constructive feedback.</small>
        </Alert>

        <Form onSubmit={handleSubmit}>
          {evaluationCriteria.map(({ key, label }) => (
            <RatingInput
              key={key}
              label={label}
              name={key}
              value={formData[key]}
              onChange={(value) => setFormData({ ...formData, [key]: value })}
              error={errors[key]}
            />
          ))}

          <Form.Group className="text-center">
            <Form.Label className="fw-semibold text-smu-blue">Written Feedback</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Provide specific examples of this teammate's contributions, strengths, and areas for improvement..."
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            />
            <div className="d-flex justify-content-between mt-1">
              <Form.Text className="text-muted">
                Minimum 20 characters ({formData.feedback.length}/20)
              </Form.Text>
              {errors.feedback && <div className="text-danger">{errors.feedback}</div>}
            </div>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              disabled={currentTeammateIndex === 0}
              onClick={() => {
                setCurrentTeammateIndex(currentTeammateIndex - 1);
                resetForm();
              }}
            >
              Previous
            </Button>
            <Button type="submit" className="btn-smu">
              {currentTeammateIndex < mockTeammates.length - 1 ? 'Next Teammate' : 'Submit All'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
