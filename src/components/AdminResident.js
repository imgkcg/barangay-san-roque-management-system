import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash } from 'lucide-react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../assets/avatar.png";
import '../style/Admin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { QRCodeCanvas } from 'qrcode.react';

const RESIDENTS_API_URL = 'http://localhost:5000/residents';
const AUTH_API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    firstName: '', middleInitial: '', surname: '', dateOfBirth: '', age: '', civilStatus: '', 
    gender: '', religion: '', contactNumber: '', houseNumber: '', street: '', purok: '', 
    householdId: '', householdHead: '', numberOfHouseholdMembers: '', 
    relationshipToHouseholdHead: '', occupation: '', employerWorkplace: '', 
    educationalAttainment: '', typeOfResidence: '', barangayIdNumber: '', 
    voterStatus: '', fourPsBeneficiary: '', pwdStatus: ''
  });
  
  const [residents, setResidents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [qrCodeData, setQrCodeData] = useState(null);
const [showQrModal, setShowQrModal] = useState(false);
const [selectedResident, setSelectedResident] = useState(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const handleViewDetails = (resident) => {
  setSelectedResident(resident);
  setShowDetailsModal(true);
};

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
          fetchResidents();
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

  const ActionButtons = () => (
    <div className="Rbtn-container">
      <button className="Rbtn" onClick={handleToggleModal}>
        <i className="fas fa-user-plus"></i> Add Resident
      </button>
      <button 
        className="Rbtn" 
        onClick={() => document.getElementById("upload-csv").click()}
      >
        <i className="fas fa-file-upload"></i> Upload CSV
      </button>
      <div className="export-dropdown">
        <button className="export-button">
          Export Report <i className="fas fa-caret-down"></i>
        </button>
        <div className="export-dropdown-content">
          <button onClick={() => handleExport('csv')}>Export as CSV</button>
          <button onClick={() => handleExport('json')}>Export as JSON</button>
        </div>
      </div>
      <input
        id="upload-csv"
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleUploadCSV}
      />
    </div>
  );
  const fetchResidents = async () => {
    try {
      const response = await axios.get(RESIDENTS_API_URL);
      const sortedResidents = response.data.sort((a, b) => a.id - b.id);
      setResidents(sortedResidents);
      setResidents(response.data);
      setFilteredResidents(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to fetch residents');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredResidents(residents);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredResidents(residents);
      return;
    }
  
    let filtered = residents;
  
    if (searchType === 'id') {
      filtered = residents.filter(resident => resident.id?.toString() === query);
    } else if (searchType === 'age') {
      filtered = residents.filter(resident => resident.age?.toString() === query);
    } else if (searchType === 'houseNumber') {
      filtered = residents.filter(resident => resident.houseNumber?.toString() === query);
    } else if (searchType === 'householdId') {
      filtered = residents.filter(resident => resident.householdId?.toString() === query);
    } else if (searchType === 'numberOfHouseholdMembers') {
      filtered = residents.filter(resident => resident.numberOfHouseholdMembers?.toString() === query);
    } else if (searchType === 'barangayIdNumber') {
      filtered = residents.filter(resident => resident.barangayIdNumber?.toString() === query);
    } else if (searchType === 'voterStatus') {
      filtered = residents.filter(resident => resident.voterStatus?.toLowerCase() === query);
    } else if (searchType === 'fourPsBeneficiary') {
      filtered = residents.filter(resident => resident.fourPsBeneficiary?.toLowerCase() === query);
    } else if (searchType === 'pwdStatus') {
      filtered = residents.filter(resident => resident.pwdStatus?.toLowerCase() === query);
    } else if (searchType === 'civilStatus') {
      filtered = residents.filter(resident => resident.civilStatus?.toLowerCase() === query);
    } else if (searchType === 'religion') {
      filtered = residents.filter(resident => resident.religion?.toLowerCase() === query);
    } else if (searchType === 'street') {
      filtered = residents.filter(resident => resident.street?.toLowerCase() === query);
    } else if (searchType === 'purok') {
      filtered = residents.filter(resident => resident.purok?.toLowerCase() === query);
    } else if (searchType === 'occupation') {
      filtered = residents.filter(resident => resident.occupation?.toLowerCase() === query);
    } else if (searchType === 'employerWorkplace') {
      filtered = residents.filter(resident => resident.employerWorkplace?.toLowerCase() === query);
    } else if (searchType === 'educationalAttainment') {
      filtered = residents.filter(resident => resident.educationalAttainment?.toLowerCase() === query);
    } else if (searchType === 'typeOfResidence') {
      filtered = residents.filter(resident => resident.typeOfResidence?.toLowerCase() === query);
    } else {
      // General search across all fields
      const queryWords = query.split(' ').filter((word) => word.trim() !== '');
      filtered = residents.filter((resident) =>
        queryWords.every((word) => {
          const regex = new RegExp(`\\b${word}\\b`, 'i');
          return (
            regex.test(resident.firstName?.toLowerCase() || '') ||
            regex.test(resident.middleInitial?.toLowerCase() || '') ||
            regex.test(resident.surname?.toLowerCase() || '') ||
            regex.test(resident.dateOfBirth?.toLowerCase() || '') ||
            regex.test(resident.age?.toString() || '') ||
            regex.test(resident.civilStatus?.toLowerCase() || '') ||
            regex.test(resident.gender?.toLowerCase() || '') ||
            regex.test(resident.religion?.toLowerCase() || '') ||
            regex.test(resident.contactNumber?.toString() || '') ||
            regex.test(resident.houseNumber?.toString() || '') ||
            regex.test(resident.street?.toLowerCase() || '') ||
            regex.test(resident.purok?.toLowerCase() || '') ||
            regex.test(resident.householdId?.toString() || '') ||
            regex.test(resident.householdHead?.toLowerCase() || '') ||
            regex.test(resident.numberOfHouseholdMembers?.toString() || '') ||
            regex.test(resident.relationshipToHouseholdHead?.toLowerCase() || '') ||
            regex.test(resident.occupation?.toLowerCase() || '') ||
            regex.test(resident.employerWorkplace?.toLowerCase() || '') ||
            regex.test(resident.educationalAttainment?.toLowerCase() || '') ||
            regex.test(resident.typeOfResidence?.toLowerCase() || '') ||
            regex.test(resident.barangayIdNumber?.toString() || '') ||
            regex.test(resident.voterStatus?.toLowerCase() || '') ||
            regex.test(resident.fourPsBeneficiary?.toLowerCase() || '') ||
            regex.test(resident.pwdStatus?.toLowerCase() || '')
          );
        })
      );
    }
  
    setFilteredResidents(filtered.sort((a, b) => a.id - b.id));
  
    if (filtered.length === 0) {
      toast.info('No matches found!');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(RESIDENTS_API_URL, formData);
      toast.success('Resident added successfully!');
      fetchResidents();
      setFormData({
        firstName: '', middleInitial: '', surname: '', dateOfBirth: '', age: '', 
        civilStatus: '', gender: '', religion: '', contactNumber: '', houseNumber: '', 
        street: '', purok: '', householdId: '', householdHead: '', 
        numberOfHouseholdMembers: '', relationshipToHouseholdHead: '', occupation: '', 
        employerWorkplace: '', educationalAttainment: '', typeOfResidence: '', 
        barangayIdNumber: '', voterStatus: '', fourPsBeneficiary: '', pwdStatus: ''
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding resident:', error);
      toast.error('Error adding resident!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${RESIDENTS_API_URL}/${formData._id}`, formData);
      toast.success('Resident updated successfully!');
      fetchResidents();
      setFormData({
        firstName: '', middleInitial: '', surname: '', dateOfBirth: '', age: '', 
        civilStatus: '', gender: '', religion: '', contactNumber: '', houseNumber: '', 
        street: '', purok: '', householdId: '', householdHead: '', 
        numberOfHouseholdMembers: '', relationshipToHouseholdHead: '', occupation: '', 
        employerWorkplace: '', educationalAttainment: '', typeOfResidence: '', 
        barangayIdNumber: '', voterStatus: '', fourPsBeneficiary: '', pwdStatus: ''
      });
      setIsEditing(false);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error updating resident:', error);
      toast.error('Error updating resident!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${RESIDENTS_API_URL}/${id}`);
      toast.success('Resident deleted!');
      fetchResidents();
    } catch (error) {
      console.error('Error deleting resident:', error);
      toast.error('Error deleting resident!');
    }
  };

  const handleEdit = (resident) => {
    setFormData(resident);
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleToggleModal = () => {
    setIsModalVisible(!isModalVisible);
    setIsEditing(false);
    setFormData({ id: '', firstName: '', middleInitial: '', surname: '', dateOfBirth: '', age: '', civilStatus: '', gender: '', religion: '', contactNumber: '', houseNumber: '', street: '', purok: '', householdId: '', householdHead: '', numberOfHouseholdMembers: '', relationshipToHouseholdHead: '', occupation: '', employerWorkplace: '', educationalAttainment: '', typeOfResidence: '', barangayIdNumber: '', voterStatus: '', fourPsBeneficiary: '', pwdStatus: '' });
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Prepare the data - keep existing IDs and convert numeric fields
            const residentsData = results.data.map(row => ({
              id: row.id || undefined, // Send undefined if no ID to let server handle it
              firstName: row.firstName,
              middleInitial: row.middleInitial,
              surname: row.surname,
              dateOfBirth: row.dateOfBirth,
              age: Number(row.age) || 0,
              civilStatus: row.civilStatus,
              gender: row.gender,
              religion: row.religion,
              contactNumber: row.contactNumber,
              houseNumber: row.houseNumber,
              street: row.street,
              purok: row.purok,
              householdId: row.householdId,
              householdHead: row.householdHead,
              numberOfHouseholdMembers: Number(row.numberOfHouseholdMembers) || 0,
              relationshipToHouseholdHead: row.relationshipToHouseholdHead,
              occupation: row.occupation,
              employerWorkplace: row.employerWorkplace,
              educationalAttainment: row.educationalAttainment,
              typeOfResidence: row.typeOfResidence,
              barangayIdNumber: row.barangayIdNumber,
              voterStatus: row.voterStatus,
              fourPsBeneficiary: row.fourPsBeneficiary,
              pwdStatus: row.pwdStatus
            }));
  
            const formData = new FormData();
            formData.append('file', file);
  
            const response = await axios.post(
              `${RESIDENTS_API_URL}/upload-csv`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
  
            toast.success(`CSV processed: ${response.data.savedCount} saved, ${response.data.skippedCount} skipped`);
            fetchResidents();
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast.error(error.response?.data?.message || 'Error processing CSV file!');
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast.error('Failed to parse CSV file!');
        },
      });
    }
  };
  const ExportButton = () => (
    <div className="export-dropdown">
      <button className="export-button">
        Export Report <i className="fas fa-caret-down"></i>
      </button>
      <div className="export-dropdown-content">
        <button onClick={() => handleExport('csv')}>Export as CSV</button>
        <button onClick={() => handleExport('json')}>Export as JSON</button>
      </div>
    </div>
  );

  const handleExport = (format) => {
    if (filteredResidents.length === 0) {
      toast.warning('No data to export!');
      return;
    }
  
    try {
      // Clean up the data before exporting
      const cleanedData = filteredResidents.map(resident => {
        const { _id, __v, ...cleanResident } = resident;
        return cleanResident;
      });
  
      if (format === 'json') {
        // Export as JSON
        const dataStr = JSON.stringify(cleanedData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `residents_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'csv') {
        // Export as CSV
        const csv = Papa.unparse(cleanedData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `residents_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success(`Exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data!');
    }
  };


const handleGenerateQR = (resident) => {

  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${resident.firstName} ${resident.middleInitial || ''} ${resident.surname}`,
    `N:${resident.surname};${resident.firstName};${resident.middleInitial || ''}`,
    `BDAY:${resident.dateOfBirth}`,
    `TEL:${resident.contactNumber}`,
    `ADR:;;${resident.houseNumber} ${resident.street}, Purok ${resident.purok}`,
    `NOTE:Barangay ID: ${resident.barangayIdNumber || 'N/A'}\\n` +
    `Household ID: ${resident.householdId}\\n` +
    `Voter: ${resident.voterStatus === "Registered" ? "Yes" : "No"}\\n` +
    `4Ps: ${resident.fourPsBeneficiary === "Yes" ? "Yes" : "No"}\\n` +
    `PWD: ${resident.pwdStatus === "Yes" ? "Yes" : "No"}`,
    'END:VCARD'
  ].join('\n');

  setQrCodeData(vCardData);
  setShowQrModal(true);
};

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      
    
      downloadLink.download = `resident-qr-${new Date().toISOString().slice(0,10)}.png`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
            <a href="#" className="sidebar-nav-item " onClick={() => navigate('/admin-dashboard')}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className="sidebar-nav-item active" onClick={() => navigate('/admin-resident')}>
              <i className="fas fa-users"></i> Residents
            </a>
            <a href="#" className="sidebar-nav-item" onClick={() => navigate('/certificate')}>
              <i className="fas fa-file-alt"></i> Certificate
            </a>
            <a href="#" className="sidebar-nav-item " onClick={() => navigate('/admin-user')}>
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
              <h1 className="resident-title">Resident Management</h1>
              <ActionButtons />
            </div>


            {/* Search and Actions */}
            <div className="resident-actions">
              <div className="search-container">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="search-type-selector"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                 <option value="all">All</option>
                <option value="id">ID</option>
                <option value="firstName">First Name</option>
                <option value="middleInitial">Middle Initial</option>
                <option value="surname">Surname</option>
                <option value="dateOfBirth">Date of Birth</option>
                <option value="age">Age</option>
                <option value="civilStatus">Civil Status</option>
                <option value="gender">Gender</option>
                <option value="religion">Religion</option>
                <option value="contactNumber">Contact No.</option>
                <option value="houseNumber">House No.</option>
                <option value="street">Street</option>
                <option value="purok">Purok</option>
                <option value="householdId">Household ID</option>
                <option value="householdHead">Household Head</option>
                <option value="numberOfHouseholdMembers">No. of Household Members</option>
                <option value="relationshipToHouseholdHead">Relationship to Household Head</option>
                <option value="occupation">Occupation</option>
                <option value="employerWorkplace">Employer/Workplace</option>
                <option value="educationalAttainment">Educational Attainment</option>
                <option value="typeOfResidence">Type of Residence</option>
                <option value="barangayIdNumber">Barangay ID Number</option>
                <option value="voterStatus">Voter Status</option>
                <option value="fourPsBeneficiary">4Ps Beneficiary</option>
                <option value="pwdStatus">PWD Status</option>
                </select>
                <button className="search-button" onClick={handleSearch}>Search</button>
                {searchQuery && <button className="clear-button" onClick={handleClearSearch}>Clear</button>}
                <button 
                className="show-button" 
                onClick={() => setShowActions(!showActions)}
              >
                {showActions ? "Hide Actions" : "Show Actions"}
              </button>
              </div>

            </div>

            {/* Resident Table */}
            <div className="resident-table-container">
              <table className="resident-table">
              <thead>
  <tr>
    <th>ID</th>
    <th>Name</th>
    <th>Age</th>
    <th>Gender</th>
    <th>Contact</th>
    <th>Address</th>
    <th>Household</th>
    {showActions && <th>Actions</th>}
  </tr>
</thead>
<tbody>
  {filteredResidents.map((resident) => (
    <tr key={resident._id}>
      <td>{resident.id}</td>
      <td>{`${resident.firstName} ${resident.middleInitial || ''} ${resident.surname}`}</td>
      <td>{resident.age}</td>
      <td>{resident.gender}</td>
      <td>{resident.contactNumber}</td>
      <td>{`${resident.houseNumber} ${resident.street}, Purok ${resident.purok}`}</td>
      <td>{resident.householdId}</td>
      {showActions && (
        <td>
          <div className="action-buttons">
            <button onClick={() => handleViewDetails(resident)}>
              <i className="fas fa-eye"></i>
            </button>
            <button onClick={() => handleEdit(resident)}>
              <Pencil size={16} />
            </button>
            <button onClick={() => handleDelete(resident.id)}>
              <Trash size={16} />
            </button>
            <button onClick={() => handleGenerateQR(resident)}>
              <i className="fas fa-qrcode"></i>
            </button>
          </div>
        </td>
      )}
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Resident Modal */}
      {isModalVisible && (
        <>
          <div className="modal-overlay active" onClick={handleToggleModal}></div>
          <div className="modal active">
            <button className="close-button" onClick={handleToggleModal}>×</button>
            <h2 className="modal-title">{isEditing ? 'Edit Resident' : 'Add New Resident'}</h2>
            <form className="form1" onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Resident ID:</label>
                  <input type="text" name="id" value={formData.id} onChange={handleChange} required disabled={isEditing} />
                </div>
                 <div className="form-group">
                  <label>Surname:</label>
                  <input type="text" name="surname" value={formData.surname} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Middle Initial:</label>
                  <input type="text" name="middleInitial" value={formData.middleInitial} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Age:</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Civil Status:</label>
                  <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gender:</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
              <div className="form-group">
                  <label>Religion:</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                              <div className="form-group">
                  <label>House Number:</label>
                  <input type="text" name="houseNumber" value={formData.houseNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Street:</label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Purok:</label>
                  <input type="text" name="purok" value={formData.purok} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
               
                <div className="form-group">
                  <label>Household ID:</label>
                  <input type="text" name="householdId" value={formData.householdId} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Household Head:</label>
                  <select name="householdHead" value={formData.householdHead} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Number of Household Members:</label>
                  <input type="number" name="numberOfHouseholdMembers" value={formData.numberOfHouseholdMembers} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Relationship to Household Head:</label>
                  <input type="text" name="relationshipToHouseholdHead" value={formData.relationshipToHouseholdHead} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Occupation:</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Employer/Workplace:</label>
                  <input type="text" name="employerWorkplace" value={formData.employerWorkplace} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">   
                <div className="form-group">
                  <label>Educational Attainment:</label>
                  <select name="educationalAttainment" value={formData.educationalAttainment} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="Vocational">Vocational</option>
                    <option value="College">College</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type of Residence:</label>
                  <select name="typeOfResidence" value={formData.typeOfResidence} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Owned">Owned</option>
                    <option value="Rented">Rented</option>
                    <option value="Informal Settler">Informal Settler</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Barangay ID Number:</label>
                  <input type="text" name="barangayIdNumber" value={formData.barangayIdNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Voter Status:</label>
                  <select name="voterStatus" value={formData.voterStatus} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Registered">Registered</option>
                    <option value="Not Registered">Not Registered</option>
                  </select>
                </div>
                
              </div>

              <div className="form-row">
              <div className="form-group">
                  <label>4Ps Beneficiary:</label>
                  <select name="fourPsBeneficiary" value={formData.fourPsBeneficiary} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>PWD Status:</label>
                  <select name="pwdStatus" value={formData.pwdStatus} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {isEditing ? "Update Resident" : "Add Resident"}
                </button>
              
              </div>
            </form>
          </div>
        </>
      )}

{showDetailsModal && selectedResident && (
  <>
    <div className="Rmodal-overlay active" onClick={() => setShowDetailsModal(false)}></div>
    <div className="Rmodal active details-modal">
      <button className="close-button" onClick={() => setShowDetailsModal(false)}>×</button>
      <h2 className="Rmodal-title">Resident Details</h2>
      
      <div className="resident-details-grid">
        <div className="detail-group">
          <h3>Personal Information</h3>
          <p><strong>ID:</strong> {selectedResident.id}</p>
          <p><strong>Name:</strong> {selectedResident.firstName} {selectedResident.middleInitial} {selectedResident.surname}</p>
          <p><strong>Date of Birth:</strong> {selectedResident.dateOfBirth}</p>
          <p><strong>Age:</strong> {selectedResident.age}</p>
          <p><strong>Civil Status:</strong> {selectedResident.civilStatus}</p>
          <p><strong>Gender:</strong> {selectedResident.gender}</p>
          <p><strong>Religion:</strong> {selectedResident.religion}</p>
          <p><strong>Contact Number:</strong> {selectedResident.contactNumber}</p>
        </div>
        
        <div className="detail-group">
          <h3>Address Information</h3>
          <p><strong>House Number:</strong> {selectedResident.houseNumber}</p>
          <p><strong>Street:</strong> {selectedResident.street}</p>
          <p><strong>Purok:</strong> {selectedResident.purok}</p>
          <p><strong>Type of Residence:</strong> {selectedResident.typeOfResidence}</p>
        </div>
        
        <div className="detail-group">
          <h3>Household Information</h3>
          <p><strong>Household ID:</strong> {selectedResident.householdId}</p>
          <p><strong>Household Head:</strong> {selectedResident.householdHead}</p>
          <p><strong>No. of Members:</strong> {selectedResident.numberOfHouseholdMembers}</p>
          <p><strong>Relationship to Head:</strong> {selectedResident.relationshipToHouseholdHead}</p>
        </div>
        
        <div className="detail-group">
          <h3>Employment & Education</h3>
          <p><strong>Occupation:</strong> {selectedResident.occupation}</p>
          <p><strong>Employer/Workplace:</strong> {selectedResident.employerWorkplace}</p>
          <p><strong>Educational Attainment:</strong> {selectedResident.educationalAttainment}</p>
        </div>
        
        <div className="detail-group">
          <h3>Government Records</h3>
          <p><strong>Barangay ID Number:</strong> {selectedResident.barangayIdNumber}</p>
          <p><strong>Voter Status:</strong> {selectedResident.voterStatus}</p>
          <p><strong>4Ps Beneficiary:</strong> {selectedResident.fourPsBeneficiary}</p>
          <p><strong>PWD Status:</strong> {selectedResident.pwdStatus}</p>
        </div>
      </div>
      
      <div className="modal-actions">
        <button onClick={() => {
          handleEdit(selectedResident);
          setShowDetailsModal(false);
        }} className="edit-button">
          <Pencil size={16} /> Edit Resident
        </button>
      </div>
    </div>
  </>
)}

{showQrModal && (
  <>
    <div className="Qmodal-overlay active" onClick={() => setShowQrModal(false)}></div>
    <div className="Qmodal active details-modal">
      <button className="close-button" onClick={() => setShowQrModal(false)}>×</button>
      <h2 className="Qmodal-title">Resident QR Code</h2>
      <div className="qr-code-container">
        {qrCodeData && (
          <>
            <div className="qr-code-display">
              <QRCodeCanvas
                id="qr-code-canvas"
                value={qrCodeData}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="qr-actions">
              <button onClick={handleDownloadQR} className="download-qr-button">
                <i className="fas fa-download"></i> Download QR
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  </>
)}
      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;