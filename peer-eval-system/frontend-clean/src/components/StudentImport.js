import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';

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

export default function StudentImport() {
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/api/students?page=${currentPage}&limit=20&search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage]);

  // Fetch students on component mount and when search/page changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setUploadStatus('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    const formData = new FormData();
    formData.append('csvFile', csvFile);

    try {
      const response = await fetch(`${API_URL}/api/upload-students`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus(
          `Success! Imported ${data.successCount} students. ${data.duplicateCount} duplicates skipped.`
        );
        setCsvFile(null);
        document.getElementById('csvFile').value = '';
        fetchStudents(); // Refresh student list
      } else {
        setUploadStatus(`Error: ${data.message}`);
      }
    } catch (err) {
      setUploadStatus('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const leftPanelStyle = {
    flex: '1',
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
    color: COLORS.SECTION_TITLE_COLOR,
    marginBottom: '20px',
    fontFamily: 'Georgia, serif',
  };

  const uploadAreaStyle = {
    border: `2px dashed ${COLORS.TAN_BASE}`,
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#fafafa',
    marginBottom: '20px',
  };

  const fileInputStyle = {
    marginBottom: '20px',
    padding: '10px',
    border: `1px solid ${COLORS.TAN_BASE}`,
    borderRadius: '4px',
    width: '100%',
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
  };

  const statusStyle = {
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
  };

  const successStatusStyle = {
    ...statusStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  };

  const errorStatusStyle = {
    ...statusStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '10px',
    border: `1px solid ${COLORS.TAN_BASE}`,
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Georgia, serif',
    marginBottom: '20px',
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
    borderBottom: `1px solid ${COLORS.PROGRESS_GRAY}`,
    fontWeight: '600',
    color: COLORS.HEADER_TEXT,
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: `1px solid ${COLORS.PROGRESS_GRAY}`,
    color: COLORS.TEXT_PRIMARY,
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  };

  const pageButtonStyle = {
    padding: '8px 12px',
    border: `1px solid ${COLORS.TAN_BASE}`,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  };

  const activePageButtonStyle = {
    ...pageButtonStyle,
    backgroundColor: COLORS.TAN_SELECTED,
    color: COLORS.WHITE,
  };

  const continueButtonStyle = {
    ...buttonStyle,
    backgroundColor: COLORS.NAVY_BUTTON,
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const csvFormatStyle = {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginTop: '10px',
    border: '1px solid #e9ecef',
  };

  return (
    <div style={outerContainerStyle}>
      {/* Header Banner */}
      <div style={headerBannerStyle}>
        <div style={titleContainerStyle}>
          <h1 style={titleStyle}>Professor Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Left Panel - CSV Upload */}
        <div style={leftPanelStyle}>
          <h2 style={sectionTitleStyle}>Import Students from CSV</h2>
          
          <div style={uploadAreaStyle}>
            <p style={{ color: COLORS.TEXT_PRIMARY, marginBottom: '20px' }}>
              Upload a CSV file to import students into the system
            </p>
            
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              style={fileInputStyle}
            />
            
            <div style={csvFormatStyle}>
              <strong>Expected CSV Format:</strong><br />
              studentname<br />
              John Doe<br />
              Jane Smith<br />
              Bob Johnson
            </div>
            
            <button
              onClick={handleUpload}
              disabled={isUploading || !csvFile}
              style={{
                ...buttonStyle,
                opacity: isUploading || !csvFile ? 0.6 : 1,
                cursor: isUploading || !csvFile ? 'not-allowed' : 'pointer',
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>

          {uploadStatus && (
            <div style={
              uploadStatus.includes('Success') || uploadStatus.includes('Imported')
                ? successStatusStyle
                : errorStatusStyle
            }>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Right Panel - Student Search */}
        <div style={rightPanelStyle}>
          <h2 style={sectionTitleStyle}>Student Directory</h2>
          
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={searchInputStyle}
          />

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading students...
            </div>
          ) : (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Student ID</th>
                    <th style={thStyle}>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.studentid}>
                      <td style={tdStyle}>{student.studentid}</td>
                      <td style={tdStyle}>{student.studentname}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={paginationStyle}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      ...pageButtonStyle,
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={
                          currentPage === pageNum
                            ? activePageButtonStyle
                            : pageButtonStyle
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      ...pageButtonStyle,
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '20px' }}>
        <button
          onClick={() => navigate('/create-course')}
          style={{
            ...buttonStyle,
            backgroundColor: COLORS.NAVY_BUTTON,
          }}
        >
          Create New Course
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={continueButtonStyle}
        >
          View Analytics Dashboard →
        </button>
      </div>
    </div>
  );
}
