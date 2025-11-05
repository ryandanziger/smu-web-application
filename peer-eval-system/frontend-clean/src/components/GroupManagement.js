import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import { useNavigate, useParams } from 'react-router-dom';

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

export default function GroupManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [roster, setRoster] = useState([]);
  const [filteredRoster, setFilteredRoster] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [courseInfo, setCourseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchCourseInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`);
      const data = await response.json();
      if (response.ok) {
        setCourseInfo(data.course);
      }
    } catch (err) {
      console.error('Error fetching course info:', err);
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

  const fetchRoster = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/courses/${courseId}/roster`);
      const data = await response.json();
      if (response.ok) {
        setRoster(data.roster || []);
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const filterRoster = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredRoster(roster);
      return;
    }
    const filtered = roster.filter(student =>
      student.studentname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoster(filtered);
  }, [searchTerm, roster]);

  useEffect(() => {
    fetchCourseInfo();
    fetchGroups();
    fetchRoster();
  }, [fetchCourseInfo, fetchGroups, fetchRoster]);

  useEffect(() => {
    filterRoster();
  }, [filterRoster]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a group name' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: newGroupName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Group created successfully' });
        setNewGroupName('');
        setShowAddGroup(false);
        fetchGroups();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create group' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error creating group' });
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudentsToGroup = async () => {
    if (!selectedGroup) {
      setMessage({ type: 'error', text: 'Please select a group' });
      return;
    }

    if (selectedStudents.length === 0) {
      setMessage({ type: 'error', text: 'No student selected to add to Group' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/groups/${selectedGroup}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Successfully added ${selectedStudents.length} student(s) to group` });
        setSelectedStudents([]);
        fetchGroups(); // Refresh group counts
        fetchRoster(); // Refresh roster
        fetchGroupMembers(selectedGroup); // Refresh group members list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add students to group' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error adding students to group' });
    }
  };

  const getGroupStudentCount = (groupId) => {
    const group = groups.find(g => g.groupid === groupId);
    return group ? parseInt(group.student_count) || 0 : 0;
  };

  const fetchGroupMembers = useCallback(async (groupId) => {
    if (!groupId) {
      setGroupMembers([]);
      return;
    }

    try {
      setIsLoadingMembers(true);
      const response = await fetch(`${API_URL}/api/courses/${courseId}/groups/${groupId}/students`);
      const data = await response.json();
      
      if (response.ok) {
        setGroupMembers(data.students || []);
      } else {
        setGroupMembers([]);
      }
    } catch (err) {
      console.error('Error fetching group members:', err);
      setGroupMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [courseId]);

  const handleSelectGroup = (groupId, groupName) => {
    setSelectedGroup(groupId);
    setSelectedGroupName(groupName);
    setSelectedStudents([]); // Clear selected students when switching groups
    fetchGroupMembers(groupId);
  };

  const handleRemoveStudentFromGroup = async (studentId, studentName) => {
    if (!selectedGroup) return;

    if (!window.confirm(`Remove ${studentName} from this group?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/courses/${courseId}/groups/${selectedGroup}/students/${studentId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `${studentName} removed from group` });
        // Refresh group members and groups list
        fetchGroupMembers(selectedGroup);
        fetchGroups();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to remove student' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error removing student from group' });
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
  };

  const leftPanelStyle = {
    flex: '0 0 300px',
    backgroundColor: COLORS.WHITE,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
  };

  const middlePanelStyle = {
    flex: '0 0 400px',
    backgroundColor: COLORS.WHITE,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const rightPanelStyle = {
    flex: '1',
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

  const buttonStyle = {
    backgroundColor: COLORS.TAN_SELECTED,
    color: COLORS.WHITE,
    padding: '12px 24px',
    borderRadius: '4px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    transition: 'background-color 0.2s',
    width: '100%',
    marginBottom: '10px',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: COLORS.NAVY_BUTTON,
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${COLORS.TAN_BASE}`,
    borderRadius: '4px',
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    marginBottom: '20px',
    boxSizing: 'border-box',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
  };

  const thStyle = {
    backgroundColor: COLORS.HEADER_BAR_BG,
    padding: '12px',
    textAlign: 'left',
    borderBottom: `1px solid #ccc`,
    fontWeight: '600',
    color: COLORS.HEADER_TEXT,
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: `1px solid #ccc`,
    color: COLORS.TEXT_PRIMARY,
  };

  const groupItemStyle = {
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: selectedGroup ? '#f0f0f0' : COLORS.WHITE,
    border: `2px solid ${selectedGroup ? COLORS.NAVY_BUTTON : COLORS.TAN_BASE}`,
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const studentRowStyle = (isSelected) => ({
    ...tdStyle,
    backgroundColor: isSelected ? '#e3f2fd' : COLORS.WHITE,
    cursor: 'pointer',
  });

  const messageStyle = {
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
  };

  const successMessageStyle = {
    ...messageStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  };

  const errorMessageStyle = {
    ...messageStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  };

  return (
    <div style={outerContainerStyle}>
      {/* Header Banner */}
      <div style={headerBannerStyle}>
        <div style={titleContainerStyle}>
          <h1 style={titleStyle}>{courseInfo?.course_name || 'Manage Groups'}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Left Panel - Navigation and Groups */}
        <div style={leftPanelStyle}>
          <button
            onClick={() => navigate(`/course-roster/${courseId}`)}
            style={buttonStyle}
          >
            Return
          </button>
          <button
            onClick={() => navigate(`/course-roster/${courseId}`)}
            style={buttonStyle}
          >
            Import Roster
          </button>
          <button
            onClick={() => navigate(`/manage-groups/${courseId}`)}
            style={activeButtonStyle}
          >
            Manage Groups
          </button>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{...sectionTitleStyle, fontSize: '18px'}}>Groups</h3>
            {groups.map((group) => (
              <div
                key={group.groupid}
                style={{
                  ...groupItemStyle,
                  backgroundColor: selectedGroup === group.groupid ? '#f0f0f0' : COLORS.WHITE,
                  border: `2px solid ${selectedGroup === group.groupid ? COLORS.NAVY_BUTTON : COLORS.TAN_BASE}`,
                }}
                onClick={() => handleSelectGroup(group.groupid, group.group_name)}
              >
                <span>{group.group_name}</span>
                <span style={{ color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>
                  ({getGroupStudentCount(group.groupid)})
                </span>
              </div>
            ))}
            
            {showAddGroup ? (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    border: `1px solid ${COLORS.TAN_BASE}`,
                    borderRadius: '4px',
                  }}
                />
                <button
                  onClick={handleCreateGroup}
                  style={{...buttonStyle, marginBottom: '5px'}}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                  }}
                  style={{...buttonStyle, backgroundColor: COLORS.TEXT_PRIMARY}}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddGroup(true)}
                style={{...buttonStyle, marginTop: '10px'}}
              >
                Add Group
              </button>
            )}
          </div>
        </div>

        {/* Middle Panel - Search and Student List */}
        <div style={middlePanelStyle}>
          <h2 style={sectionTitleStyle}>Roster</h2>
          
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading students...
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((student) => {
                  const isSelected = selectedStudents.includes(student.studentid);
                  return (
                    <tr
                      key={student.studentid}
                      onClick={() => handleToggleStudent(student.studentid)}
                      style={studentRowStyle(isSelected)}
                    >
                      <td>{student.studentname}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Panel - Group Members and Add Students */}
        <div style={rightPanelStyle}>
          <h2 style={sectionTitleStyle}>
            {selectedGroup ? selectedGroupName : 'Group Management'}
          </h2>
          
          {message.text && (
            <div style={message.type === 'success' ? successMessageStyle : errorMessageStyle}>
              {message.text}
            </div>
          )}

          {!selectedGroup && (
            <div style={{ padding: '20px', color: COLORS.TEXT_SECONDARY, textAlign: 'center' }}>
              Please select a group from the left panel to view and manage its members
            </div>
          )}

          {selectedGroup && (
            <>
              {/* Current Group Members Section */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{...sectionTitleStyle, fontSize: '18px', marginBottom: '15px'}}>
                  Current Members ({groupMembers.length})
                </h3>
                
                {isLoadingMembers ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    Loading members...
                  </div>
                ) : groupMembers.length === 0 ? (
                  <div style={{ padding: '20px', color: COLORS.TEXT_SECONDARY, textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    No students in this group yet
                  </div>
                ) : (
                  <div>
                    {groupMembers.map((student) => (
                      <div
                        key={student.studentid}
                        style={{
                          padding: '12px',
                          marginBottom: '8px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{student.studentname}</span>
                        <button
                          onClick={() => handleRemoveStudentFromGroup(student.studentid, student.studentname)}
                          style={{
                            backgroundColor: COLORS.ERROR_RED,
                            color: COLORS.WHITE,
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            fontFamily: 'Georgia, serif',
                          }}
                          title="Remove from group"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Students Section */}
              <div style={{ borderTop: `2px solid ${COLORS.TAN_BASE}`, paddingTop: '20px' }}>
                <h3 style={{...sectionTitleStyle, fontSize: '18px', marginBottom: '15px'}}>
                  Add Students to Group
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <strong>Selected: {selectedStudents.length} student(s)</strong>
                </div>

                {selectedStudents.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    {selectedStudents.map(studentId => {
                      const student = roster.find(s => s.studentid === studentId);
                      // Check if student is already in the group
                      const alreadyInGroup = groupMembers.some(m => m.studentid === studentId);
                      
                      return student ? (
                        <div
                          key={studentId}
                          style={{
                            padding: '8px',
                            marginBottom: '5px',
                            backgroundColor: alreadyInGroup ? '#fff3cd' : '#e3f2fd',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>
                            {student.studentname}
                            {alreadyInGroup && (
                              <span style={{ color: COLORS.TEXT_SECONDARY, fontSize: '12px', marginLeft: '8px' }}>
                                (already in group)
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => handleToggleStudent(studentId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: COLORS.ERROR_RED,
                              cursor: 'pointer',
                              fontSize: '18px',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                <button
                  onClick={handleAddStudentsToGroup}
                  disabled={selectedStudents.length === 0}
                  style={{
                    ...buttonStyle,
                    opacity: selectedStudents.length === 0 ? 0.6 : 1,
                    cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Add Selected Students
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

