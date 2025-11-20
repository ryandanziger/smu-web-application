import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  NAVY_BASE: '#5C7094',
  NAVY_SELECTED: '#4A5568',
  BROWN_TAN: '#8a704c',
};

export default function EvaluationAssignment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // Form state matching Figma design
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('25');
  const [assignToType, setAssignToType] = useState('groups'); // 'everyone' or 'groups'
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [availableFromDate, setAvailableFromDate] = useState('');
  const [availableFromTime, setAvailableFromTime] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [untilTime, setUntilTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourseInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`);
      const data = await response.json();
      if (response.ok) {
        setCourse(data.course);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    }
  }, [courseId]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/groups`);
      const data = await response.json();
      if (response.ok) {
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  }, [courseId]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/roster`);
      const data = await response.json();
      if (response.ok) {
        setStudents(data.roster || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, [courseId]);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/evaluation-assignments`);
      const data = await response.json();
      if (response.ok) {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  }, [courseId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCourseInfo(),
        fetchGroups(),
        fetchStudents(),
        fetchAssignments()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [courseId, fetchCourseInfo, fetchGroups, fetchStudents, fetchAssignments]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGroupDropdown && !event.target.closest('[data-dropdown]')) {
        setShowGroupDropdown(false);
      }
      if (showStudentDropdown && !event.target.closest('[data-dropdown]')) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGroupDropdown, showStudentDropdown]);

  // Handle "Everyone" selection
  const handleEveryoneToggle = () => {
    if (assignToType === 'everyone') {
      setAssignToType('groups');
      setSelectedGroups([]);
    } else {
      setAssignToType('everyone');
      setSelectedGroups([]);
      setSelectedStudents([]);
    }
  };

  // Handle group selection
  const handleGroupToggle = (group) => {
    setSelectedGroups(prev => {
      const isSelected = prev.find(g => g.groupid === group.groupid);
      const newGroups = isSelected 
        ? prev.filter(g => g.groupid !== group.groupid)
        : [...prev, group];
      console.log('Group toggled:', group.group_name, 'Selected groups:', newGroups.map(g => g.group_name));
      return newGroups;
    });
    setShowGroupDropdown(false);
  };

  // Handle student selection
  const handleStudentToggle = (student) => {
    if (selectedStudents.find(s => s.studentid === student.studentid)) {
      setSelectedStudents(prev => prev.filter(s => s.studentid !== student.studentid));
    } else {
      setSelectedStudents(prev => [...prev, student]);
    }
    setShowStudentDropdown(false);
  };

  // Remove selected group
  const removeGroup = (groupId) => {
    setSelectedGroups(prev => prev.filter(g => g.groupid !== groupId));
  };

  // Remove selected student
  const removeStudent = (studentId) => {
    setSelectedStudents(prev => prev.filter(s => s.studentid !== studentId));
  };

  // Filter groups/students based on search
  const filteredGroups = groups.filter(g => 
    g.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredStudents = students.filter(s => 
    s.studentname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle "Assign To" button - adds to pending assignments
  const handleAddToPending = () => {
    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    console.log('Add to pending - assignToType:', assignToType, 'selectedGroups:', selectedGroups.length);

    if (assignToType === 'everyone') {
      // Add assignment for all students in all groups
      if (groups.length === 0) {
        setError('No groups available. Please create groups first.');
        return;
      }
      const newAssignments = groups.map(group => ({
        groupId: group.groupid,
        groupName: group.group_name,
        evaluatorType: 'everyone',
        description,
        points: parseInt(points) || 0,
        dueDate: dueDate ? `${dueDate}T${dueTime || '23:59'}` : null,
        availableFrom: availableFromDate ? `${availableFromDate}T${availableFromTime || '00:00'}` : null,
        until: untilDate ? `${untilDate}T${untilTime || '23:59'}` : null,
      }));
      setPendingAssignments(prev => [...prev, ...newAssignments]);
      setSuccess(`Added ${newAssignments.length} assignment(s) for all students`);
    } else if (selectedGroups.length > 0) {
      // Add assignments for selected groups
      // If no students selected, we'll fetch students in each group when saving
      const evaluatorIds = selectedStudents.length > 0 
        ? selectedStudents.map(s => s.studentid)
        : null; // null means use students IN THE GROUP (not all course students)
      
      console.log('Creating assignments for groups:', {
        selectedGroups: selectedGroups.map(g => g.group_name),
        evaluatorIds,
        selectedStudentsCount: selectedStudents.length,
        note: evaluatorIds ? 'Using selected students' : 'Will use students in each group'
      });
      
      const newAssignments = selectedGroups.map(group => ({
        groupId: group.groupid,
        groupName: group.group_name,
        evaluatorType: 'group',
        evaluatorIds: evaluatorIds, // null means use group members
        description,
        points: parseInt(points) || 0,
        dueDate: dueDate ? `${dueDate}T${dueTime || '23:59'}` : null,
        availableFrom: availableFromDate ? `${availableFromDate}T${availableFromTime || '00:00'}` : null,
        until: untilDate ? `${untilDate}T${untilTime || '23:59'}` : null,
      }));
      setPendingAssignments(prev => [...prev, ...newAssignments]);
      setSuccess(`Added ${newAssignments.length} assignment(s)`);
    } else {
      setError('Please select at least one group or choose "Everyone"');
      return;
    }

    // Clear form
    setDescription('');
    setPoints('25');
    setAssignToType('groups');
    setSelectedGroups([]);
    setSelectedStudents([]);
    setDueDate('');
    setDueTime('');
    setAvailableFromDate('');
    setAvailableFromTime('');
    setUntilDate('');
    setUntilTime('');
    setSearchQuery('');
    setSuccess('Assignment added to pending list');
  };

  // Handle final "Save and Assign" - creates all pending assignments
  const handleSaveAndAssign = async () => {
    if (pendingAssignments.length === 0) {
      setError('No assignments to save. Please add assignments first.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let totalCreated = 0;
      const errors = [];

      for (const assignment of pendingAssignments) {
        try {
          let evaluatorStudentIds = [];
          
          if (assignment.evaluatorType === 'everyone') {
            // All students in the course evaluate this group
            evaluatorStudentIds = students.map(s => s.studentid);
            console.log(`[ASSIGNMENT] Everyone mode for ${assignment.groupName}: ${evaluatorStudentIds.length} students`);
          } else {
            // Use selected students, or students IN THE GROUP if none selected
            if (assignment.evaluatorIds && assignment.evaluatorIds.length > 0) {
              evaluatorStudentIds = assignment.evaluatorIds;
              console.log(`[ASSIGNMENT] Using ${evaluatorStudentIds.length} selected students for ${assignment.groupName}`);
            } else {
              // Fetch students in this specific group
              console.log(`[ASSIGNMENT] No students selected, fetching students in group ${assignment.groupName}...`);
              try {
                const groupStudentsResponse = await fetch(
                  `${API_URL}/api/courses/${courseId}/groups/${assignment.groupId}/students`
                );
                
                if (!groupStudentsResponse.ok) {
                  throw new Error(`Failed to fetch group students: ${groupStudentsResponse.status}`);
                }
                
                const groupStudentsData = await groupStudentsResponse.json();
                evaluatorStudentIds = (groupStudentsData.students || []).map(s => s.studentid);
                console.log(`[ASSIGNMENT] Found ${evaluatorStudentIds.length} students in group ${assignment.groupName}`);
              } catch (err) {
                console.error(`[ASSIGNMENT] Error fetching group students:`, err);
                errors.push(`${assignment.groupName}: Could not fetch students in group - ${err.message}`);
                continue;
              }
            }
          }

          if (!evaluatorStudentIds || evaluatorStudentIds.length === 0) {
            const errorMsg = `No evaluators for ${assignment.groupName}. Students array has ${students.length} students.`;
            console.error(`[ASSIGNMENT] ${errorMsg}`);
            errors.push(errorMsg);
            continue;
          }

          console.log(`[ASSIGNMENT] Creating assignment for ${assignment.groupName} with ${evaluatorStudentIds.length} evaluator(s):`, evaluatorStudentIds);

          // Combine date and time for due date
          let dueDateTime = null;
          if (assignment.dueDate) {
            try {
              const dateStr = assignment.dueDate.includes('T') 
                ? assignment.dueDate 
                : `${assignment.dueDate}T${assignment.dueDate.split('T')[1] || '23:59'}`;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                dueDateTime = date.toISOString();
              } else {
                throw new Error(`Invalid due date: ${assignment.dueDate}`);
              }
            } catch (err) {
              errors.push(`${assignment.groupName}: Invalid due date format`);
              continue;
            }
          } else {
            errors.push(`${assignment.groupName}: Due date is required`);
            continue;
          }

          // Format availableFrom and until dates
          let availableFromISO = null;
          if (assignment.availableFrom) {
            try {
              const dateStr = assignment.availableFrom.includes('T') 
                ? assignment.availableFrom 
                : `${assignment.availableFrom}T${assignment.availableFrom.split('T')[1] || '00:00'}`;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                availableFromISO = date.toISOString();
              }
            } catch (err) {
              console.warn(`Invalid availableFrom date for ${assignment.groupName}:`, err);
            }
          }

          let untilISO = null;
          if (assignment.until) {
            try {
              const dateStr = assignment.until.includes('T') 
                ? assignment.until 
                : `${assignment.until}T${assignment.until.split('T')[1] || '23:59'}`;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                untilISO = date.toISOString();
              }
            } catch (err) {
              console.warn(`Invalid until date for ${assignment.groupName}:`, err);
            }
          }

          const requestBody = {
            courseId: parseInt(courseId),
            groupId: assignment.groupId,
            evaluatorStudentIds: evaluatorStudentIds,
            dueDate: dueDateTime,
            assignmentName: assignment.description || `Peer Evaluation - ${assignment.groupName}`,
            points: assignment.points || 0,
            availableFrom: availableFromISO,
            until: untilISO,
          };

          console.log(`Creating assignment for ${assignment.groupName}:`, requestBody);

          const response = await fetch(`${API_URL}/api/evaluation-assignments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            // Server returned HTML (likely an error page)
            const text = await response.text();
            console.error(`Non-JSON response for ${assignment.groupName}:`, text.substring(0, 200));
            errors.push(`${assignment.groupName}: Server error (${response.status}). Check backend logs.`);
            continue;
          }
          
          if (response.ok) {
            totalCreated += data.assignments?.length || 0;
            if (data.errors && data.errors.length > 0) {
              console.warn(`Some errors for ${assignment.groupName}:`, data.errors);
              errors.push(`${assignment.groupName}: ${data.errors.join('; ')}`);
            }
          } else {
            const errorMsg = data.message || 'Failed';
            const errorDetails = data.errors ? ` (${data.errors.join('; ')})` : '';
            errors.push(`${assignment.groupName}: ${errorMsg}${errorDetails}`);
            console.error(`Failed to create assignment for ${assignment.groupName}:`, data);
          }
        } catch (err) {
          console.error(`Error creating assignment for ${assignment.groupName}:`, err);
          errors.push(`${assignment.groupName}: ${err.message}`);
        }
      }

      if (totalCreated > 0) {
        setSuccess(`Successfully created ${totalCreated} evaluation assignment(s)`);
        setPendingAssignments([]);
        fetchAssignments();
      } else {
        setError(`Failed to create assignments: ${errors.join('; ')}`);
      }
    } catch (err) {
      console.error('Error saving assignments:', err);
      setError('Failed to save assignments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/evaluation-assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuccess('Assignment deleted successfully');
        fetchAssignments();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment. Please try again.');
    }
  };

  const removePendingAssignment = (index) => {
    setPendingAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '';
    try {
      const date = new Date(`${dateString}T${timeString || '00:00'}`);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
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

  // Helper to format time for input (HH:MM)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    // Convert "23:59 PM" format to "23:59" if needed
    return timeString;
  };

  // Helper to get current date/time in local format for inputs
  const getLocalDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const containerStyle = {
    fontFamily: 'Georgia, serif',
    backgroundColor: COLORS.BODY_BACKGROUND,
    minHeight: '100vh',
  };

  const headerBannerStyle = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://www.kenan-flagler.unc.edu/wp-content/uploads/nmc-images/2019/10/singapore_skyline-width2000height772.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '50px 0 30px 0',
    position: 'relative',
  };

  const titleStyle = {
    fontSize: '48px',
    fontWeight: 'normal',
    color: COLORS.WHITE,
    textAlign: 'center',
    margin: 0,
    fontFamily: 'Georgia, serif',
  };

  const cardStyle = {
    backgroundColor: COLORS.WHITE,
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '900px',
    margin: '40px auto',
  };

  const formTitleStyle = {
    fontSize: '36px',
    fontWeight: 'normal',
    color: COLORS.BROWN_TAN,
    marginBottom: '30px',
    fontFamily: 'Georgia, serif',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  };

  const textareaStyle = {
    width: '100%',
    padding: '15px',
    borderRadius: '4px',
    border: `1px solid ${COLORS.TAN_BASE}`,
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    minHeight: '120px',
    resize: 'vertical',
    marginBottom: '20px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: `1px solid ${COLORS.TAN_BASE}`,
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    marginBottom: '10px',
  };

  const smallInputStyle = {
    ...inputStyle,
    width: '150px',
  };

  const assignToContainerStyle = {
    border: `2px solid ${COLORS.TAN_BASE}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#fafafa',
  };

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: '6px 12px',
    borderRadius: '20px',
    margin: '4px',
    fontSize: '14px',
  };

  const tagRemoveStyle = {
    marginLeft: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
  };

  const dropdownStyle = {
    position: 'relative',
    width: '100%',
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    border: `1px solid ${COLORS.TAN_BASE}`,
    borderRadius: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  const dropdownItemStyle = {
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: `1px solid ${COLORS.TAN_BASE}`,
  };

  const dropdownItemHoverStyle = {
    ...dropdownItemStyle,
    backgroundColor: '#f0f0f0',
  };

  const dateTimeRowStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end',
    marginBottom: '15px',
  };

  const dateTimeGroupStyle = {
    flex: 1,
  };

  const clearLinkStyle = {
    color: COLORS.NAVY_BASE,
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    marginLeft: '10px',
  };

  const assignToButtonStyle = {
    backgroundColor: COLORS.BROWN_TAN,
    color: COLORS.WHITE,
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    width: '100%',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const footerButtonStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: `1px solid ${COLORS.TAN_BASE}`,
  };

  const returnLinkStyle = {
    color: COLORS.NAVY_BASE,
    textDecoration: 'none',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '15px',
  };

  const cancelButtonStyle = {
    backgroundColor: COLORS.BROWN_TAN,
    color: COLORS.WHITE,
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  };

  const saveButtonStyle = {
    ...cancelButtonStyle,
    backgroundColor: COLORS.TAN_SELECTED,
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header Banner */}
      <div style={headerBannerStyle}>
        <h1 style={titleStyle}>{course?.course_name || 'Project Management'}</h1>
      </div>

      <div style={cardStyle}>
        <h2 style={formTitleStyle}>Assign Evaluations</h2>

        {error && (
          <div style={{ backgroundColor: '#fee', color: COLORS.ERROR_RED, padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#efe', color: COLORS.SUCCESS_GREEN, padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {success}
          </div>
        )}

        {/* Description Field */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add Description Here"
            style={textareaStyle}
          />
        </div>

        {/* Points Field */}
        <div>
          <label style={labelStyle}>Points</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            style={smallInputStyle}
            min="0"
          />
        </div>

        {/* Assign To Section */}
        <div style={assignToContainerStyle}>
          <label style={labelStyle}>Assign To</label>
          
          {/* Selected items as tags */}
          <div style={{ marginBottom: '10px', minHeight: '40px' }}>
            {assignToType === 'everyone' && (
              <div style={tagStyle}>
                Everyone
                <span style={tagRemoveStyle} onClick={handleEveryoneToggle}>×</span>
              </div>
            )}
            {selectedGroups.map(group => (
              <div key={group.groupid} style={tagStyle}>
                {group.group_name}
                <span style={tagRemoveStyle} onClick={() => removeGroup(group.groupid)}>×</span>
              </div>
            ))}
            {selectedStudents.map(student => (
              <div key={student.studentid} style={tagStyle}>
                {student.studentname}
                <span style={tagRemoveStyle} onClick={() => removeStudent(student.studentid)}>×</span>
              </div>
            ))}
          </div>

          {/* Selection interface */}
          <div style={dropdownStyle} data-dropdown onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setAssignToType('everyone');
                  setSelectedGroups([]);
                  setSelectedStudents([]);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: `1px solid ${COLORS.TAN_BASE}`,
                  backgroundColor: assignToType === 'everyone' ? COLORS.TAN_BASE : COLORS.WHITE,
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Everyone
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignToType('groups');
                  if (assignToType === 'everyone') {
                    setSelectedGroups([]);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: `1px solid ${COLORS.TAN_BASE}`,
                  backgroundColor: assignToType === 'groups' ? COLORS.TAN_BASE : COLORS.WHITE,
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Groups
              </button>
            </div>

            {assignToType === 'groups' && (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowGroupDropdown(true);
                  }}
                  onFocus={() => setShowGroupDropdown(true)}
                  placeholder="Start Typing To Search"
                  style={inputStyle}
                />
                {showGroupDropdown && filteredGroups.length > 0 && (
                  <div 
                    style={dropdownMenuStyle}
                    data-dropdown
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filteredGroups.map(group => (
                      <div
                        key={group.groupid}
                        style={selectedGroups.find(g => g.groupid === group.groupid) ? dropdownItemHoverStyle : dropdownItemStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupToggle(group);
                        }}
                      >
                        {group.group_name}
                        {selectedGroups.find(g => g.groupid === group.groupid) && ' ✓'}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Date and Time Fields */}
        <div style={assignToContainerStyle}>
          {/* Due Date */}
          <div style={dateTimeRowStyle}>
            <div style={dateTimeGroupStyle}>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={dateTimeGroupStyle}>
              <label style={labelStyle}>Time</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={inputStyle}
                />
                {dueTime && (
                  <span style={clearLinkStyle} onClick={() => setDueTime('')}>
                    Clear
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Available From */}
          <div style={dateTimeRowStyle}>
            <div style={dateTimeGroupStyle}>
              <label style={labelStyle}>Available From</label>
              <input
                type="date"
                value={availableFromDate}
                onChange={(e) => setAvailableFromDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={dateTimeGroupStyle}>
              <label style={labelStyle}>Time</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="time"
                  value={availableFromTime}
                  onChange={(e) => setAvailableFromTime(e.target.value)}
                  style={inputStyle}
                />
                {availableFromTime && (
                  <span style={clearLinkStyle} onClick={() => setAvailableFromTime('')}>
                    Clear
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Until */}
          <div style={dateTimeRowStyle}>
            <div style={dateTimeGroupStyle}>
              <label style={labelStyle}>Until</label>
              <input
                type="date"
                value={untilDate}
                onChange={(e) => setUntilDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={dateTimeGroupStyle}>
              <label style={labelStyle}>Time</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="time"
                  value={untilTime}
                  onChange={(e) => setUntilTime(e.target.value)}
                  style={inputStyle}
                />
                {untilTime && (
                  <span style={clearLinkStyle} onClick={() => setUntilTime('')}>
                    Clear
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* + Assign To Button */}
        <button
          type="button"
          onClick={handleAddToPending}
          style={assignToButtonStyle}
        >
          <span>+</span> Assign To
        </button>

        {/* Pending Assignments List */}
        {pendingAssignments.length > 0 && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>Pending Assignments ({pendingAssignments.length})</h3>
            {pendingAssignments.map((assignment, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                marginBottom: '10px', 
                backgroundColor: COLORS.WHITE, 
                borderRadius: '4px',
                border: `1px solid ${COLORS.TAN_BASE}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{assignment.groupName}</div>
                  <div style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
                    {assignment.evaluatorType === 'everyone' ? 'Everyone' : (assignment.evaluatorIds ? `${assignment.evaluatorIds.length} students` : 'All students')}
                    {assignment.dueDate && ` • Due: ${formatDateTime(assignment.dueDate.split('T')[0], assignment.dueDate.split('T')[1] || '')}`}
                  </div>
                </div>
                <button
                  onClick={() => removePendingAssignment(index)}
                  style={{
                    backgroundColor: COLORS.ERROR_RED,
                    color: COLORS.WHITE,
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer Buttons */}
        <div style={footerButtonStyle}>
          <a
            onClick={() => navigate(`/course-roster/${courseId}`)}
            style={returnLinkStyle}
          >
            ← Return
          </a>
          <div style={actionButtonsStyle}>
            <button
              type="button"
              onClick={() => {
                setPendingAssignments([]);
                setDescription('');
                setPoints('25');
                setAssignToType('groups');
                setSelectedGroups([]);
                setSelectedStudents([]);
                setDueDate('');
                setDueTime('');
                setAvailableFromDate('');
                setAvailableFromTime('');
                setUntilDate('');
                setUntilTime('');
              }}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndAssign}
              disabled={isSubmitting || pendingAssignments.length === 0}
              style={{
                ...saveButtonStyle,
                opacity: (isSubmitting || pendingAssignments.length === 0) ? 0.6 : 1,
                cursor: (isSubmitting || pendingAssignments.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save and Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
