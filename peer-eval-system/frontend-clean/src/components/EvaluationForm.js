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
  { key: 'criticalthink', label: 'Critical Thinking and Problem Solving', scaleType: 'default'},
  { key: 'collaboration', label: 'Collaboration and Leadership', scaleType: 'default' },
  { key: 'learning', label: 'Self-directedness and meta-learning', scaleType: 'default' },
  { key: 'communication', label: 'Communication', scaleType: 'default' },
  { key: 'overall', label: 'Overall', scaleType: 'overall'}
];

function RatingInput({ label, value, onChange, name, error, scaleType = "default" }) {
  const scales = {
    default: {
      values: [0, 1, 2, 3, 4],
      description: "0= Never, 1= Sometimes, 2= Usually, 3= Regularly, 4= Always"
    },
    overall: {
      values: [0, 1, 2, 3, 4],
      description: "0= Poor, 1= Fair, 2= Good, 3= Very Good, 4= Excellent"
    }
  }; 

  const currentScale = scales[scaleType];
  const groupNameId = `${name}-rating-group`;

  return (
    <Form.Group className="mb-4 text-center">
      <Form.Label className="fw-semibold text-smu-blue" htmlFor={groupNameId}>{label}</Form.Label>
      <div className="d-flex justify-content-center gap-2" role="radiogroup" aria-labelledby={groupNameId}>
        {currentScale.values.map((rating) => {
          const ratingId = `${name}-${rating}`;
          return (
            <label
              key={rating}
              className="rating-button"
              htmlFor={ratingId}
            >
              <input
                id={ratingId}
                type="radio"
                name={name}
                value={rating}
                checked={value === rating}
                onChange={(e) => onChange(parseInt(e.target.value))}
                // The d-none class is REMOVED to allow the input to be clicked/focused.
                // The visual hiding is now done via CSS rules on the input[type="radio"].
              />
              {/* This span wraps the number and receives the visual styling from CSS selectors */}
              <span className="rating-number-wrapper">
                <span className="rating-number">{rating}</span>
              </span>
            </label>
          );
        })}
      </div>
      <Form.Text className="text-muted d-block mt-2">{currentScale.description}</Form.Text>
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
    criticalthink: null,
    collaboration: null,
    learning: null,
    communication: null,
    overall: null,
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
      criticalthink: null,
      collaboration: null,
      learning: null,
      communication: null,
      overall: null,
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
        <small> <strong> In your experience, how often does your peer demonstrate the following? 
          Rate the frequency of the teamwork behavior for each of your group members 
          by writing the corresponding number (see key) in the boxes provided. </strong></small>
      </Alert>

      <Form onSubmit={handleSubmit}>
        {evaluationCriteria.map(({ key, label, scaleType }) => (
          <RatingInput
            key={key}
            label={label}
            name={key}
            value={formData[key]}
            onChange={(value) => setFormData({ ...formData, [key]: value })}
            error={errors[key]}
            scaleType={scaleType}
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