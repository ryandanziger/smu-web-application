import React, { useState, useEffect, useCallback } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; 

// --- Color Palette (matching Figma wireframes) ---
const COLORS = {
  TAN_BACKGROUND: 'rgba(138,112,76,0.9)', // Main form background
  WHITE: 'white',
  NAVY_BUTTON: '#141b4d', // Dark navy for buttons
  PLACEHOLDER_TEXT: '#8a704c', // Tan color for placeholders
  TEXT_PRIMARY: '#2d3748',
  TEXT_SECONDARY: '#5C7094',
  ERROR_RED: '#C97C7C',
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

const evaluationCriteria = [
  { key: 'criticalthink', label: 'Critical Thinking and Problem Solving', scaleType: 'default', colorType: 'tan', dbColumn: 'contribution_score' },
  { key: 'collaboration', label: 'Collaboration and Leadership', scaleType: 'default', colorType: 'navy', dbColumn: 'plan_mgmt_score' },
  { key: 'learning', label: 'Self-directedness and meta-learning', scaleType: 'default', colorType: 'tan', dbColumn: 'team_climate_score' },
  { key: 'communication', label: 'Communication', scaleType: 'default', colorType: 'navy', dbColumn: 'conflict_res_score' },
  { key: 'overall', label: 'Overall', scaleType: 'overall', colorType: 'tan', dbColumn: 'overall_rating' }
];

// --- Custom Components (UNCHANGED from previous version) ---
function RatingButton({ value, selected, onChange, name, ratingId, colorType }) { 
    // ... logic UNCHANGED
    const isTan = colorType === 'tan';
    const baseColor = isTan ? COLORS.TAN_BASE : COLORS.NAVY_BASE;
    const selectedColor = isTan ? COLORS.TAN_SELECTED : COLORS.NAVY_SELECTED;
  
    const style = {
      backgroundColor: selected ? selectedColor : COLORS.WHITE,
      color: selected ? COLORS.WHITE : COLORS.TEXT_PRIMARY,
      minWidth: '60px', 
      height: '54px',
      borderRadius: '16px',
      fontSize: '18px',
      fontWeight: 'normal',
      border: `2px solid ${selected ? selectedColor : baseColor}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Joan, serif',
    };
  
    return (
      <label htmlFor={ratingId} style={{ flexGrow: 1, margin: '0 4px' }}>
        <input
          id={ratingId}
          type="radio"
          name={name}
          value={value}
          checked={selected}
          onChange={(e) => onChange(parseInt(e.target.value))} 
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />
        <div style={style}>
          {value}
        </div>
      </label>
    );
}

function RatingInput({ label, value, onChange, name, error, scaleType = "default", colorType }) { 
    // ... logic UNCHANGED
    const scales = {
        default: {
          values: [0, 1, 2, 3, 4],
          keyText: "0= Never, 1= Sometimes, 2= Usually, 3= Regularly, 4= Always"
        },
        overall: {
          values: [0, 1, 2, 3, 4],
          keyText: "0= Poor, 1= Fair, 2= Good, 3= Very Good, 4= Excellent"
        }
      };
    
      const currentScale = scales[scaleType];
      
      const headerStyle = {
        fontSize: '28px', 
        fontWeight: 'normal',
        color: colorType === 'navy' ? COLORS.NAVY_BUTTON : COLORS.TAN_SELECTED, 
        fontFamily: 'Joan, serif',
        marginTop: '30px', 
        marginBottom: '15px', 
        paddingLeft: '20px', 
        paddingRight: '20px',
        textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      };
    
      const contentPaddingStyle = {
        paddingLeft: '20px', 
        paddingRight: '20px',
      }
    
      const questionTextStyle = {
        fontSize: '14px',
        fontWeight: '500',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: '10px',
        fontFamily: 'Georgia, serif',
      };
    
      const buttonsContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '5px',
        maxWidth: '350px', 
      };
        
      const errorStyle = {
        marginTop: '10px',
        backgroundColor: COLORS.ERROR_RED,
        color: COLORS.WHITE,
        padding: '8px 16px',
        fontSize: '14px',
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'Georgia, serif',
      };
    
      const keyTextStyle = {
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
        marginTop: '10px',
        display: 'block',
        fontFamily: 'Georgia, serif',
      };
    
      return (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={headerStyle}>{label}</h2>
          
          <div style={{...questionTextStyle, ...contentPaddingStyle}}>Rate on a scale of 0 to 4:</div>
          
          <div style={{...buttonsContainerStyle, ...contentPaddingStyle}}>
            {currentScale.values.map((rating) => {
              const ratingId = `${name}-${rating}`;
              return (
                <RatingButton
                  key={rating}
                  value={rating}
                  selected={value === rating}
                  onChange={(val) => onChange(val)}
                  name={name}
                  ratingId={ratingId}
                  colorType={colorType} 
                />
              );
            })}
          </div>
    
          <span style={{...keyTextStyle, ...contentPaddingStyle}}>{currentScale.keyText}</span>
          {error && <div style={{...errorStyle, ...contentPaddingStyle}}>{error}</div>}
        </div>
      );
}

// --- Main Component ---
export default function EvaluationForm() {
  // *** CRITICAL: Set the ID of the current user to exclude them from the list ***
  // Based on your data, let's assume the evaluator is Ryan Danziger (ID 3)
  const MOCK_EVALUATOR_ID = 3;
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }; 

  const [teammates, setTeammates] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [fetchError, setFetchError] = useState(null); 
    
  const [currentTeammateIndex, setCurrentTeammateIndex] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => {
    const initial = evaluationCriteria.reduce((acc, criteria) => {
      acc[criteria.key] = null;
      return acc;
    }, {});
    initial.feedback = '';
    return initial;
  });
  
  // Get the current teammate to evaluate from the fetched list
  const currentTeammate = teammates[currentTeammateIndex];

  
  // --- Fetch Teammates Data on Component Mount ---
  useEffect(() => {
    const fetchTeammates = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/teammates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter out the current evaluator using the mock ID
        const filteredData = data.filter(t => t.id !== MOCK_EVALUATOR_ID); 
        
        setTeammates(filteredData);
        if (filteredData.length === 0) {
            setFetchError("No teammates found to evaluate.");
        }
        
      } catch (error) {
        console.error("Failed to fetch teammates:", error);
        setFetchError(`Could not load teammates. Is the backend server running on port 3001? Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeammates();
  }, []); // Empty dependency array means run once on mount


  // --- Helper Functions (UNCHANGED) ---
  const resetForm = useCallback(() => {
    const initial = evaluationCriteria.reduce((acc, criteria) => {
        acc[criteria.key] = null;
        return acc;
      }, {});
      initial.feedback = '';
      setFormData(initial);
      setErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    evaluationCriteria.forEach(({ key, label }) => {
      if (formData[key] === null) {
        newErrors[key] = `Rating for "${label}" is required`;
      }
    });
    if (formData.feedback === null || formData.feedback.trim().length === 0) {
      newErrors.feedback = 'Written feedback is mandatory';
    } else if (formData.feedback.trim().length < 20) {
        newErrors.feedback = 'Feedback must be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);


  // --- Handle Submission (UNCHANGED logic, now using fetched currentTeammate) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !currentTeammate) return;

    const apiPayload = {
      teammateId: currentTeammate.id,
      evaluatorId: MOCK_EVALUATOR_ID, // Use the correct evaluator ID
      feedback: formData.feedback,
      
      contribution_score: formData.criticalthink, 
      plan_mgmt_score: formData.collaboration,
      team_climate_score: formData.learning,
      conflict_res_score: formData.communication,
      overall_rating: formData.overall
    };

    try {
        const response = await fetch('http://localhost:3001/api/submit-evaluation', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No detailed error message from server.' }));
            throw new Error(errorData.message || `HTTP Error! Status: ${response.status}`);
        }

        console.log("Evaluation successfully sent to API:", apiPayload);

        const evaluation = { ...apiPayload, teammateName: currentTeammate.name };
        setEvaluations([...evaluations, evaluation]);

        if (currentTeammateIndex < teammates.length - 1) { 
            setCurrentTeammateIndex(currentTeammateIndex + 1);
            resetForm();
        } else {
            setShowSuccess(true);
        }

    } catch (error) {
        console.error('Submission Error:', error);
        alert('Failed to submit evaluation. Check the console for details. Error: ' + error.message);
    }
  };


  // --- Loading/Error UI ---
  if (isLoading) {
    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
            <Spinner animation="border" variant="secondary" />
            <p style={{ marginTop: '10px', color: COLORS.TEXT_PRIMARY }}>Loading teammates from database...</p>
        </div>
    );
  }
  
  if (fetchError || teammates.length === 0) {
    return (
        <div style={{ padding: '50px', textAlign: 'center', color: COLORS.ERROR_RED, fontFamily: 'Georgia, serif' }}>
            <h2>Evaluation Unavailable</h2>
            <p>{fetchError || "No teammates available for peer evaluation."}</p>
        </div>
    );
  }


  // --- Success State (UNCHANGED) ---
  if (showSuccess) {
    const successContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        maxWidth: '500px',
        margin: '50px auto',
        backgroundColor: COLORS.WHITE,
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        borderTop: `4px solid ${COLORS.TAN_SELECTED}`,
        fontFamily: 'Georgia, serif',
      };
  
      const successButtonStyle = {
        backgroundColor: COLORS.TAN_SELECTED,
        color: COLORS.WHITE,
        padding: '10px 20px',
        borderRadius: '4px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        marginTop: '20px',
        fontFamily: 'Georgia, serif',
      };
  
      return (
        <div style={successContainerStyle}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Completed!</h2>
          <p style={{ color: COLORS.TEXT_PRIMARY, marginBottom: '24px' }}>
            Completed and submitted evaluations for all {teammates.length} peers.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowSuccess(false);
                setCurrentTeammateIndex(0);
                setEvaluations([]);
                resetForm();
              }}
              style={successButtonStyle}
            >
              START NEW EVALUATION
            </button>
            <button
              onClick={handleLogout}
              style={{
                ...successButtonStyle,
                backgroundColor: COLORS.ERROR_RED,
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#B56565'}
              onMouseOut={(e) => e.target.style.backgroundColor = COLORS.ERROR_RED}
            >
              LOGOUT
            </button>
          </div>
        </div>
      );
  }

  // --- Main Form Rendering (UNCHANGED) ---

  const outerContainerStyle = {
    fontFamily: 'Georgia, serif', 
    backgroundColor: COLORS.BODY_BACKGROUND, 
    minHeight: '100vh',
  }
  
  const mainContentAreaStyle = {
    width: '100%',
    backgroundColor: COLORS.WHITE, 
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
  }
  
  const evalTitleStyle = { 
    fontSize: '30px',
    fontWeight: 'normal',
    margin: 0,
    color: COLORS.WHITE,
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '5px',
  };

  const progressBarStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.HEADER_BAR_BG,
      padding: '10px 20px',
      borderBottom: `1px solid ${COLORS.PROGRESS_GRAY}`,
  }

  const teamInfoStyle = {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: COLORS.HEADER_TEXT,
      fontSize: '18px',
      fontWeight: '600',
      padding: '0 20px', 
  }

  const instructionBoxStyle = {
    padding: '20px', 
    marginBottom: '15px',
    fontSize: '14px',
    lineHeight: '1.4',
    color: COLORS.TEXT_PRIMARY,
  };

  const keyBoldTextStyle = {
    display: 'block',
    margin: '10px 0 0 0',
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    fontSize: '14px',
  };

  const submitButtonStyle = {
    backgroundColor: COLORS.NAVY_BUTTON,
    color: COLORS.WHITE,
    padding: '12px 20px',
    borderRadius: '16px',
    fontWeight: 'normal',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.2s',
    fontFamily: 'Joan, serif',
    fontSize: '24px',
    textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
  };
  
  const textareaStyle = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '16px',
    minHeight: '120px',
    fontSize: '18px',
    resize: 'vertical',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '200',
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
  };

  const footerTextStyle = {
    textAlign: 'center',
    fontSize: '12px',
    color: COLORS.TEXT_SECONDARY,
    marginTop: '20px',
    paddingBottom: '20px',
    padding: '20px',
  };


  return (
    <div style={outerContainerStyle}>
      {/* Header Banner - Full Width Image/Title */}
      <div style={headerBannerStyle}>
          <div style={titleContainerStyle}>
              <h1 style={evalTitleStyle}>Peer Evaluation</h1> 
          </div>
      </div>
      
      {/* Progress/Team Info Bar - Full Width Bar */}
      <div style={progressBarStyle}>
          <div style={teamInfoStyle}>
              {/* Left Side: Evaluating, Name, Underline */}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1}}>
                  <h2 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: 0,
                      color: COLORS.HEADER_TEXT,
                      position: 'relative',
                      display: 'inline-block',
                      paddingBottom: '5px',
                  }}>
                      {/* Dynamically display the current teammate's name */}
                      Evaluating: {currentTeammate.name}
                      <span style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: COLORS.UNDERLINE_BLUE,
                      }}></span>
                  </h2>
              </div>
              {/* Right Side: Project Management & Progress */}
              <div style={{display: 'flex', alignItems: 'flex-end', gap: '20px'}}>
                  <span style={{fontSize: '18px', color: COLORS.SUB_HEADER_TEXT, fontWeight: '600'}}>
                      Project Management
                  </span>
                  <span style={{fontSize: '14px', color: COLORS.TEXT_SECONDARY}}>
                      {/* Dynamically display progress: Completed / Total Peers */}
                      {evaluations.length}/{teammates.length} completed
                  </span>
              </div>
          </div>
      </div>


      {/* MAIN CONTENT AREA */}
      <div style={mainContentAreaStyle}>
          {/* Instructions (UNCHANGED) */}
          <div style={instructionBoxStyle}>
              <p style={{ margin: '20px 0 0 0' }}>
                  Teamwork is behaviors under control of the individual team members. In your experience, how often does your peer
                  demonstrate the following? Rate the frequency of the teamwork behavior for each of your group members by choosing the
                  corresponding number which may fall in the boxes provided.
              </p>
              <span style={keyBoldTextStyle}>
                  Key: 0= Never 1= Sometimes 2= Usually 3= Regularly 4= Always
              </span>
          </div>

          <Form onSubmit={handleSubmit}>
              {/* Rating Inputs (UNCHANGED) */}
              {evaluationCriteria.map(({ key, label, scaleType, colorType }) => (
                  <RatingInput
                      key={key}
                      label={label}
                      name={key}
                      value={formData[key]}
                      onChange={(value) => setFormData({ ...formData, [key]: value })}
                      error={errors[key]}
                      scaleType={scaleType}
                      colorType={colorType} 
                  />
              ))}
              
              {/* Written Feedback Section (UNCHANGED) */}
              <div style={{ marginBottom: '20px', marginTop: '30px', padding: '0 20px' }}>
                  <h2 style={{
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: COLORS.SECTION_TITLE_COLOR,
                      fontFamily: 'Georgia, serif',
                      marginBottom: '15px',
                  }}>Additional Comments</h2>
                  
                  <Form.Group>
                      <Form.Label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: COLORS.TEXT_PRIMARY, marginBottom: '10px', fontFamily: 'Georgia, serif' }}>
                          Provide specific examples of this teammate's contributions, strengths, and areas for improvement:
                      </Form.Label>
                      <Form.Control
                          as="textarea"
                          rows={4}
                          style={textareaStyle}
                          placeholder="Start typing here..."
                          value={formData.feedback}
                          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
                              Minimum 20 characters ({formData.feedback.length}/20)
                          </span>
                          {errors.feedback && <div style={{ color: COLORS.ERROR_RED, fontSize: '12px' }}>{errors.feedback}</div>}
                      </div>
                  </Form.Group>
              </div>

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', padding: '0 20px' }}>
                  <button
                      type="button"
                      style={{ ...submitButtonStyle, backgroundColor: COLORS.TEXT_PRIMARY }}
                      disabled={currentTeammateIndex === 0}
                      onClick={() => {
                          setCurrentTeammateIndex(currentTeammateIndex - 1);
                          resetForm();
                      }}
                  >
                      PREVIOUS
                  </button>
                  <button type="submit" style={submitButtonStyle}>
                      {currentTeammateIndex < teammates.length - 1 ? 'NEXT PEER' : 'SUBMIT ALL EVALUATIONS'}
                  </button>
              </div>

              {/* Footer Text (UNCHANGED) */}
              <p style={footerTextStyle}>
                  Mark up all peer evaluations. Click on each checkbox that matches the question and write a sentence representative. Also navigate back and forth and end it if they have done all the evaluations.
              </p>
          </Form>
      </div>
    </div>
  );
}