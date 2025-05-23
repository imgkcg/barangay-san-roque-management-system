import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultAvatar from "../assets/avatar.png";
import '../style/Certificate.css';

const RESIDENTS_API_URL = 'http://localhost:5000/residents';
const CERTIFICATES_API_URL = 'http://localhost:5000/certificates';
const AUTH_API_URL = 'http://localhost:5000/api';
const REQUEST_API_URL = 'http://localhost:5000/requests';

function BarangayCertificates() {
  const [residents, setResidents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [certificateType, setCertificateType] = useState('clearance');
  const [purpose, setPurpose] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [residentCertificates, setResidentCertificates] = useState([]);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [formData, setFormData] = useState({
    issuedBy: '',
    dateIssued: new Date().toISOString().split('T')[0]
  });
 
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate('/');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const response = await axios.get(`${AUTH_API_URL}/me`, {
          params: { username: parsedUser.username }
        });

        if (response.data) {
          setUser(response.data);
          setFormData(prev => ({
            ...prev,
            issuedBy: `${response.data.firstName} ${response.data.lastName}`
          }));
          fetchResidents();
          fetchRecentCertificates();
        } else {
          localStorage.removeItem('user');
          navigate('/');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('user');
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);
  
// Current implementation
  // Fetch requests function
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${REQUEST_API_URL}`, {
        params: { status: 'pending' },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // or your auth method
        }
      });
  
      if (Array.isArray(response.data)) {
        setRequests(response.data);
      } else if (response.data && Array.isArray(response.data.requests)) {
        setRequests(response.data.requests); // if data is nested
      } else {
        console.error('Unexpected response format:', response.data);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch certificate requests');
      setRequests([]);
    }
  };
  useEffect(() => {
    if (user) {
      fetchRequests();
      const intervalId = setInterval(fetchRequests, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await axios.put(`${REQUEST_API_URL}/${requestId}/approve`);
      setRequests(requests.filter(req => req._id !== requestId));
      toast.success('Request approved and resident notified!');
      
      // Automatically select the resident and fill the form
      const approvedRequest = requests.find(req => req._id === requestId);
      if (approvedRequest) {
        const residentResponse = await axios.get(`${RESIDENTS_API_URL}/${approvedRequest.residentId}`);
        setSelectedResident(residentResponse.data);
        setCertificateType(approvedRequest.certificateType);
        setPurpose(approvedRequest.purpose);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`${REQUEST_API_URL}/${requestId}/reject`);
      setRequests(requests.filter(req => req._id !== requestId));
      toast.success('Request rejected and resident notified!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };
  

const requestManagementModal = (
  <div className="request-modal-overlay active">

    <div className="request-modal active" onClick={(e) => e.stopPropagation()}>
      <button className="request-close-button" onClick={() => setShowRequests(false)}>×</button>
      <h2>Pending Certificate Requests</h2>

      {requests.length > 0 ? (
        <div className="request-list">
          {requests.map(request => (
            <div key={request._id} className="request-card">
              <div className="request-info">
                <h4>
                  {request.firstName} {request.surname}
                  <span className={`request-type ${request.certificateType}`}>
                    {request.certificateType === 'clearance' && 'Barangay Clearance'}
                    {request.certificateType === 'residency' && 'Certificate of Residency'}
                    {request.certificateType === 'indigency' && 'Certificate of Indigency'}
                  </span>
                </h4>
                <div className="request-details-grid">
                  <div className="request-detail">
                    <strong>Full Name:</strong>
                    <span>{request.fullName}</span>
                  </div>
                  <div className="request-detail">
                    <strong>Contact Number:</strong>
                    <span>{request.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="request-detail">
                    <strong>Purpose:</strong>
                    <span>{request.purpose}</span>
                  </div>
                  <div className="request-detail">
                    <strong>Status:</strong>
                    <span className={`status-badge ${request.status}`}>{request.status}</span>
                  </div>
                  <div className="request-detail">
                    <strong>Requested:</strong>
                    <span>
                    {request.createdAt 
                      ? new Date(request.createdAt).toLocaleString()
                      : request.requestDate 
                        ? new Date(request.requestDate).toLocaleString()
                        : 'N/A'}
                  </span>

                  </div>
                </div>
              </div>
              <div className="request-actions">
                <button 
                  className="request-approve-button"
                  onClick={() => handleApproveRequest(request._id)}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                <button 
                  className="request-reject-button"
                  onClick={() => handleRejectRequest(request._id)}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="request-empty">No pending certificate requests.</p>
      )}
    </div>
  </div>
);


  const fetchResidents = async () => {
    try {
      const response = await axios.get(RESIDENTS_API_URL);
      setResidents(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to fetch residents');
    }
  };

  const fetchRecentCertificates = async () => {
    try {
      const response = await axios.get(CERTIFICATES_API_URL);
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to fetch recent certificates');
    }
  };

  const fetchResidentCertificates = async (residentId) => {
    try {
      const response = await axios.get(`${CERTIFICATES_API_URL}/resident/${residentId}`);
      setResidentCertificates(response.data);
    } catch (error) {
      console.error('Error fetching resident certificates:', error);
      toast.error('Failed to fetch resident certificate history');
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await axios.post(`${AUTH_API_URL}/logout`, { username: user.username });
      }
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout properly');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      fetchResidents();
      return;
    }

    const filtered = residents.filter(resident => 
      resident.id?.toString().includes(query) ||
      `${resident.firstName} ${resident.middleInitial || ''} ${resident.surname}`.toLowerCase().includes(query) ||
      resident.houseNumber?.toString().includes(query) ||
      resident.street?.toLowerCase().includes(query) ||
      resident.purok?.toLowerCase().includes(query)
    );

    setResidents(filtered);

    if (filtered.length === 0) {
      toast.info('No matches found!');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchResidents();
  };

  const handleGenerateCertificate = async () => {
    if (!selectedResident) {
      toast.error('Please select a resident first');
      return;
    }

    if (!purpose) {
      toast.error('Please specify the purpose');
      return;
    }

    try {
      const data = {
        residentId: selectedResident.id,
        certificateType,
        purpose,
        issuedBy: formData.issuedBy
      };

      const response = await axios.post(CERTIFICATES_API_URL, data);
      setCertificateData(response.data);
      fetchRecentCertificates();
      fetchResidentCertificates(selectedResident.id);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    }
  };

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    const certificateContent = certificateTemplates[certificateType].content(
      certificateData.residentData, 
      certificateData
    );
    
    printWindow.document.open();
    printWindow.document.write(certificateContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const handleViewHistory = (resident) => { 
    setSelectedResident(resident);
    fetchResidentCertificates(resident.id);
    setShowHistory(true);
  };


    const certificateTemplates = {
      clearance: {
        title: "BARANGAY CLEARANCE",
        content: (resident, data) => `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Barangay Clearance</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                min-height: 297mm;
              }
              .certificate-page {
                width: 210mm;
                min-height: 297mm;
                padding: 20mm;
                box-sizing: border-box;
                position: relative;
                border: none;
              }
              .certificate-header {
                text-align: center;
                margin-bottom: 15mm;
              }
              .barangay-seal {
                width: 50mm;
                height: 50mm;
                margin: 0 auto 5mm;
                border: 1px solid #000;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              h2 {
                margin: 5mm 0;
                font-size: 16pt;
                text-decoration: underline;
              }
              .certificate-body {
                line-height: 1.5;
                font-size: 12pt;
                text-align: justify;
              }
              .indent {
                text-indent: 12.5mm;
                margin: 5mm 0;
              }
              .certificate-footer {
                margin-top: 20mm;
                display: flex;
                justify-content: space-between;
                align-items: flex-start; /* Align from the top */
              }
              
              .signature-block {
                text-align: center;
                width: 70mm;
                display: flex;
                flex-direction: column;
                height: 100%;
              }
              
              .signature-line {
                border-top: 1px solid #000;
                width: 50mm;
                margin: 2mm auto; /* Reduced margin for tighter spacing */
              }
    
              .official-name, 
              .resident-name {
                text-decoration: none;
                margin: 0;
                height: 10mm; /* Fixed height for alignment */
                display: flex;
                align-items: flex-end;
                justify-content: center;
              }
              
              .signature-title {
                margin-top: 1mm;
              }
              
              .control-number {
                text-align: right;
                margin-bottom: 10mm;
              }
            </style>
          </head>
          <body>
            <div class="certificate-page">
              <div class="control-number">Control No: ${data.controlNumber || 'N/A'}</div>
              <div class="certificate-header">
                <div class="barangay-seal">
                  <div class="seal-placeholder">BARANGAY SEAL</div>
                </div>
                <h2>BARANGAY CLEARANCE</h2>
              </div>
              
              <div class="certificate-body">
                <p>TO WHOM IT MAY CONCERN:</p>
                
                <p class="indent">This is to certify that <strong>${resident.firstName} ${resident.middleInitial || ''} ${resident.surname}</strong>, 
                of legal age, ${resident.civilStatus}, and a resident of ${resident.houseNumber} ${resident.street}, 
                Purok ${resident.purok}, Barangay San Roque, City of Iligan, Lanao Del Norte, is known to me to be a person of good moral character 
                and a law-abiding citizen of this barangay.</p>
                
                <p class="indent">This certification is issued upon the request of the above-named person for <strong>${data.purpose || 'whatever legal purpose it may serve'}</strong>.</p>
                
                <p class="indent">Issued this <strong>${new Date(data.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> 
                at Barangay San Roque, City of Iligan, Lanao Del Norte.</p>
              </div>
              
              <div class="certificate-footer">
                <div class="signature-block">
                  <p class="official-name">${data.issuedBy || 'Barangay Official'}</p>
                  <div class="signature-line"></div>
                  <p class="signature-title">Barangay Official</p>
                </div>
                
                <div class="signature-block">
                  <p class="resident-name">${resident.firstName} ${resident.surname}</p>
                  <div class="signature-line"></div>
                  <p class="signature-title">Resident's Signature</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      },
    residency: {
      title: "CERTIFICATE OF RESIDENCY",
      content: (resident, data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Certificate of Residency</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              min-height: 297mm;
            }
            .certificate-page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              box-sizing: border-box;
              position: relative;
              border: none;
            }
            .certificate-header {
              text-align: center;
              margin-bottom: 15mm;
            }
            .barangay-seal {
              width: 50mm;
              height: 50mm;
              margin: 0 auto 5mm;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            h2 {
              margin: 5mm 0;
              font-size: 16pt;
              text-decoration: underline;
            }
            .certificate-body {
              line-height: 1.5;
              font-size: 12pt;
              text-align: justify;
            }
            .indent {
              text-indent: 12.5mm;
              margin: 5mm 0;
            }
            .certificate-footer {
              margin-top: 20mm;
              display: flex;
              justify-content: space-between;
            }
            .signature-block {
              text-align: center;
              width: 70mm;
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            
            .signature-line {
              border-top: 1px solid #000;
              width: 50mm;
              margin: 2mm auto; /* Reduced margin for tighter spacing */
            }
  
            .official-name, 
            .resident-name {
              text-decoration: none;
              margin: 0;
              height: 10mm; /* Fixed height for alignment */
              display: flex;
              align-items: flex-end;
              justify-content: center;
            }
            
            .signature-title {
              margin-top: 1mm;
            }
            .control-number {
              text-align: right;
              margin-bottom: 10mm;
            }
          </style>
        </head>
        <body>
          <div class="certificate-page">
            <div class="control-number">Control No: ${data.controlNumber || 'N/A'}</div>
            <div class="certificate-header">
              <div class="barangay-seal">
                <div class="seal-placeholder">BARANGAY SEAL</div>
              </div>
              <h2>CERTIFICATE OF RESIDENCY</h2>
            </div>
            
            <div class="certificate-body">
              <p>TO WHOM IT MAY CONCERN:</p>
              
              <p class="indent">This is to certify that <strong>${resident.firstName} ${resident.middleInitial || ''} ${resident.surname}</strong>, 
              ${resident.age} years old, ${resident.civilStatus}, is a bona fide resident of ${resident.houseNumber} ${resident.street}, 
              Purok ${resident.purok}, Barangay San Roque, City of Iligan, Lanao Del Norte.</p>
              
              <p class="indent">This certification is issued upon the request of the above-named person for <strong>${data.purpose || 'whatever legal purpose it may serve'}</strong>.</p>
              
              <p class="indent">Issued this <strong>${new Date(data.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> 
              at Barangay San Roque, City of Iligan, Lanao Del Norte.</p>
            </div>
            
            <div class="certificate-footer">
                <div class="signature-block">
                  <p class="official-name">${data.issuedBy || 'Barangay Official'}</p>
                  <div class="signature-line"></div>
                  <p class="signature-title">Barangay Official</p>
                </div>
                
                <div class="signature-block">
                  <p class="resident-name">${resident.firstName} ${resident.surname}</p>
                  <div class="signature-line"></div>
                  <p class="signature-title">Resident's Signature</p>
                </div>
            </div>
          </div>
        </body>
        </html>
      `
    },
    indigency: {
      title: "CERTIFICATE OF INDIGENCY",
      content: (resident, data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Certificate of Indigency</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;

              display: flex;
              justify-content: center;
              min-height: 297mm;
            }
            .certificate-page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              box-sizing: border-box;
              position: relative;
              border: none;
            }
            .certificate-header {
              text-align: center;
              margin-bottom: 15mm;
            }
            .barangay-seal {
              width: 50mm;
              height: 50mm;
              margin: 0 auto 5mm;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            h2 {
              margin: 5mm 0;
              font-size: 16pt;
              text-decoration: underline;
            }
            .certificate-body {
              line-height: 1.5;
              font-size: 12pt;
              text-align: justify;
            }
            .indent {
              text-indent: 12.5mm;
              margin: 5mm 0;
            }
            .certificate-footer {
              margin-top: 20mm;
              display: flex;
              justify-content: space-between;
            }
            .signature-block {
              text-align: center;
              width: 70mm;
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            
            .signature-line {
              border-top: 1px solid #000;
              width: 50mm;
              margin: 2mm auto; /* Reduced margin for tighter spacing */
            }
  
            .official-name, 
            .resident-name {
              text-decoration: none;
              margin: 0;
              height: 10mm; /* Fixed height for alignment */
              display: flex;
              align-items: flex-end;
              justify-content: center;
            }
            
            .signature-title {
              margin-top: 1mm;
            }
            .control-number {
              text-align: right;
              margin-bottom: 10mm;
            }
          </style>
        </head>
        <body>
          <div class="certificate-page">
            <div class="control-number">Control No: ${data.controlNumber || 'N/A'}</div>
            <div class="certificate-header">
              <div class="barangay-seal">
                <div class="seal-placeholder">BARANGAY SEAL</div>
              </div>
              <h2>CERTIFICATE OF INDIGENCY</h2>
            </div>
            
            <div class="certificate-body">
              <p>TO WHOM IT MAY CONCERN:</p>
              
              <p class="indent">This is to certify that <strong>${resident.firstName} ${resident.middleInitial || ''} ${resident.surname}</strong>, 
              ${resident.age} years old, ${resident.civilStatus}, and a resident of ${resident.houseNumber} ${resident.street}, 
              Purok ${resident.purok}, Barangay San Roque, City of Iligan, Lanao Del Norte, belongs to an indigent family in this barangay.</p>
              
              <p class="indent">This certification is issued upon the request of the above-named person for <strong>${data.purpose || 'whatever legal purpose it may serve'}</strong> 
              particularly to avail of government services and assistance.</p>
              
              <p class="indent">Issued this <strong>${new Date(data.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> 
              at Barangay San Roque, City of Iligan, Lanao Del Norte.</p>
            </div>
            
            <div class="certificate-footer">
            <div class="signature-block">
              <p class="official-name">${data.issuedBy || 'Barangay Official'}</p>
              <div class="signature-line"></div>
              <p class="signature-title">Barangay Official</p>
            </div>
            
            <div class="signature-block">
              <p class="resident-name">${resident.firstName} ${resident.surname}</p>
              <div class="signature-line"></div>
              <p class="signature-title">Resident's Signature</p>
            </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };


  return (
    <div className="dashboard-container">
    <div className="header">
    <div className="header-logo">
      <h1>Barangay San Roque Management System</h1>
    </div>
    <nav className="all-main-nav">
      <ul>
        <li className="brgy-active"><a href="">Management</a></li>
        <li ><a href="/home">Home</a></li>
        <li><a href="/admin-req">Request Certificate</a></li>
      </ul>
    </nav>
    </div>

      {showRequests && requestManagementModal}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div 
            className="sidebar-profile clickable" 
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
            <div className="sidebar-profile-text">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p>Administrator</p>
            </div>
          </div>
          
          
          <div className="sidebar-menu">
            <a href="#" className="sidebar-nav-item" onClick={() => navigate('/admin-dashboard')}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className="sidebar-nav-item" onClick={() => navigate('/admin-resident')}>
              <i className="fas fa-users"></i> Residents
            </a>
            <a href="#" className="sidebar-nav-item active" onClick={() => navigate('/certificate')}>
              <i className="fas fa-file-alt"></i> Certificate
            </a>
            <a href="#" className="sidebar-nav-item" onClick={() => setShowRequests(true)}>
        <i className="fas fa-inbox"></i> Certificate Requests
        {requests.length > 0 && (
          <span className="notification-badge">{requests.length}</span>
        )}
      </a>
            <a href="#" className="sidebar-nav-item" onClick={() => navigate('/admin-user')}>
              <i className="fas fa-user-friends"></i> Users
            </a>
            <a href="#" className="sidebar-nav-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>

        

        {/* Main content */}
        <div className="resident-content">
          <div className="resident-overview-container">
            <div className="resident-title-section">
              <h1 className="resident-title">Barangay Certificates</h1>
            </div>

            {/* Search and Certificate Selection */}
            <div className="certificate-controls">
              <div className="search-container">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search residents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-button" onClick={handleSearch}>
                  <i className="fas fa-search"></i> Search
                </button>
                {searchQuery && (
                  <button className="clear-button" onClick={handleClearSearch}>
                    <i className="fas fa-times"></i> Clear
                  </button>
                )}
              </div>

              <div className="certificate-type-selector">
                <label>Certificate Type:</label>
                <select 
                  value={certificateType} 
                  onChange={(e) => setCertificateType(e.target.value)}
                >
                  <option value="clearance">Barangay Clearance</option>
                  <option value="residency">Certificate of Residency</option>
                  <option value="indigency">Certificate of Indigency</option>
                </select>
              </div>
            </div>

            {/* Resident Selection and Form */}
            <div className="certificate-form-container">
              <div className="resident-selection">
                <h3>Select Resident</h3>
                <div className="resident-list">
                  {residents.map(resident => (
                    <div 
                      key={resident.id} 
                      className={`resident-card ${selectedResident?.id === resident.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedResident(resident);
                        fetchResidentCertificates(resident.id);
                      }}
                    >
                      <div className="resident-info">
                        <span className="resident-id">ID: {resident.id}</span>
                        <h4>{resident.firstName} {resident.middleInitial || ''} {resident.surname}</h4>
                        <p>{resident.houseNumber} {resident.street}, Purok {resident.purok}</p>
                      </div>
                      <button 
                        className="view-history-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewHistory(resident);
                        }}
                      >
                        <i className="fas fa-history"></i> History
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="certificate-details-form">
                <h3>Certificate Details</h3>
                
                {selectedResident && (
                  <div className="selected-resident-info">
                    <h4>{selectedResident.firstName} {selectedResident.middleInitial || ''} {selectedResident.surname}</h4>
                    <p>ID: {selectedResident.id}</p>
                    <p>{selectedResident.houseNumber} {selectedResident.street}, Purok {selectedResident.purok}</p>
                  </div>
                )}
                
                <div className="form-group">
                  <label>Purpose:</label>
                  <input 
                    type="text" 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="State the purpose of this certificate"
                    required
                  />
                </div>


                <div className="form-row">
                  <div className="form-group">
                    <label>Date Issued:</label>
                    <input 
                      type="date" 
                      value={formData.dateIssued}
                      onChange={(e) => setFormData({...formData, dateIssued: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Issued By:</label>
                    <input 
                      type="text" 
                      value={formData.issuedBy}
                      onChange={(e) => setFormData({...formData, issuedBy: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button 
                  className="generate-button"
                  onClick={handleGenerateCertificate}
                  disabled={!selectedResident || !purpose}
                >
                  <i className="fas fa-file-certificate"></i> Generate Certificate
                </button>
              </div>
            </div>

            {/* Certificate Preview */}
            {certificateData && (
              <div className="certificate-preview-container">
                <div className="certificate-preview-actions">
                  <h3>Certificate Preview - {certificateTemplates[certificateType].title}</h3>
                  <div>
                    <button className="print-button" onClick={handlePrintCertificate}>
                      <i className="fas fa-print"></i> Print
                    </button>
                    <button 
                      className="new-certificate-button" 
                      onClick={() => setCertificateData(null)}
                    >
                      <i className="fas fa-plus"></i> New Certificate
                    </button>
                  </div>
                </div>

                <div 
                  className="certificate-preview"
                  dangerouslySetInnerHTML={{
                    __html: certificateTemplates[certificateType].content(
                      certificateData.residentData, 
                      certificateData
                    )
                  }}
                />
              </div>
            )}
           

            {/* Certificate History Modal */}
            {showHistory && selectedResident && (
              <div className="hmodal-overlay active" onClick={() => setShowHistory(false)}>
                <div className="hmodal active" onClick={(e) => e.stopPropagation()}>
                  <button className="close-button" onClick={() => setShowHistory(false)}>×</button>
                  <h2>Certificate History for {selectedResident.firstName} {selectedResident.surname}</h2>
                  
                  <div className="certificate-history-list">
                    {residentCertificates.length > 0 ? (
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Control No.</th>
                            <th>Type</th>
                            <th>Date Issued</th>
                            <th>Purpose</th>
                          
                          </tr>
                        </thead>
                        <tbody>
                          {residentCertificates.map(cert => (
                            <tr key={cert._id}>
                              <td>{cert.controlNumber}</td>
                              <td>
                                {cert.certificateType === 'clearance' && 'Barangay Clearance'}
                                {cert.certificateType === 'residency' && 'Certificate of Residency'}
                                {cert.certificateType === 'indigency' && 'Certificate of Indigency'}
                              </td>
                              <td>{new Date(cert.dateIssued).toLocaleDateString()}</td>
                              <td>{cert.purpose}</td>
                           
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No certificate history found for this resident.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Certificates Section */}
            {!certificateData && (
              <div className="recent-certificates">
                <h3>Recently Issued Certificates</h3>
                {certificates.length > 0 ? (
                  <table className="certificates-table">
                    <thead>
                      <tr>
                        <th>Control No.</th>
                        <th>Resident Name</th>
                        <th>Type</th>
                        <th>Date Issued</th>
                        <th>Issued By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map(cert => (
                        <tr key={cert._id}>
                          <td>{cert.controlNumber}</td>
                          <td>
                            {cert.residentData?.firstName} {cert.residentData?.surname}
                          </td>
                          <td>
                            {cert.certificateType === 'clearance' && 'Barangay Clearance'}
                            {cert.certificateType === 'residency' && 'Certificate of Residency'}
                            {cert.certificateType === 'indigency' && 'Certificate of Indigency'}
                          </td>
                          <td>{new Date(cert.dateIssued).toLocaleDateString()}</td>
                          <td>{cert.issuedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No recent certificates found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default BarangayCertificates;