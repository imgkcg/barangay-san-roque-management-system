import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash } from 'lucide-react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../assets/avatar.png";
import '../style/Admin.css';


const RESIDENTS_API_URL = 'http://localhost:5000/residents';
const USERS_API_URL = 'http://localhost:5000/users';
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
  const [isVisualizationModalVisible, setIsVisualizationModalVisible] = useState(false);
  const [isResidentActionsVisible, setIsResidentActionsVisible] = useState(false);
  
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isUserDetailsModalVisible, setIsUserDetailsModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isUserEditModalVisible, setIsUserEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Check session on initial load
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

  const fetchResidents = async () => {
    try {
      const response = await axios.get(RESIDENTS_API_URL);
      setResidents(response.data);
      setFilteredResidents(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to fetch residents');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users!');
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

  const handleToggleActions = () => {
    setShowActions(!showActions);
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

  // Update CSV upload handler
  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Transform CSV data to match your resident schema
            const residentsData = results.data.map(row => ({
              firstName: row.firstName,
              middleInitial: row.middleInitial,
              surname: row.surname,
              dateOfBirth: row.dateOfBirth,
              age: Number(row.age),
              civilStatus: row.civilStatus,
              gender: row.gender,
              religion: row.religion,
              contactNumber: row.contactNumber,
              houseNumber: row.houseNumber,
              street: row.street,
              purok: row.purok,
              householdId: row.householdId,
              householdHead: row.householdHead,
              numberOfHouseholdMembers: Number(row.numberOfHouseholdMembers),
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

            // Use bulk upload endpoint if available, or send individually
            await axios.post(`${RESIDENTS_API_URL}/upload-csv`, residentsData);
            
            toast.success('CSV file uploaded and residents added successfully!');
            fetchResidents();
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast.error('Error processing CSV file!');
          }
        },
        error: () => {
          toast.error('Failed to parse CSV file!');
        },
      });
    }
  };

  const handleToggleVisualizationModal = () => {
    setIsVisualizationModalVisible(!isVisualizationModalVisible);
    setIsResidentActionsVisible(!isResidentActionsVisible); 
  };

  const genderData = [
    { name: 'Male', value: residents.filter(resident => resident.gender === 'Male').length },
    { name: 'Female', value: residents.filter(resident => resident.gender === 'Female').length },
  ];

  const ageData = residents.reduce((acc, resident) => {
    let ageGroup;
    if (resident.age <= 12) ageGroup = '0-12';
    else if (resident.age <= 17) ageGroup = '13-17';
    else if (resident.age <= 59) ageGroup = '18-59';
    else ageGroup = '60+';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageChartData = Object.keys(ageData).map(ageGroup => ({
    name: ageGroup,
    count: ageData[ageGroup],
  }));

  const educationData = residents.reduce((acc, resident) => {
    acc[resident.educationalAttainment] = (acc[resident.educationalAttainment] || 0) + 1;
    return acc;
  }, {});

  const educationChartData = Object.keys(educationData).map(education => ({
    name: education,
    count: educationData[education],
  }));

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserEditModalVisible(true);
  };

  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${USERS_API_URL}/${selectedUser._id}`, selectedUser);
      toast.success("User updated successfully!");
      fetchUsers();
      setIsUserEditModalVisible(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Error updating user!");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${USERS_API_URL}/${id}`);
      toast.success("User deleted!");
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Error deleting user!");
    }
  };

  return (
    <div>
      <div className="admin-info">
        <p className="welcome-admin">Welcome, Admin!</p>

        {showUserDetails && user && (
          <div className="user-details">
            <p><strong>Name:</strong> <span>{user.firstName} {user.lastName}</span></p>
            <p><strong>Email:</strong> <span>{user.email}</span></p>
            <p><strong>Age:</strong> <span>{user.age}</span></p>
            <p><strong>Address:</strong> <span>{user.address}</span></p>
            <p><strong>Gender:</strong> <span>{user.gender}</span></p>
            <p><strong>Phone Number:</strong> <span>{user.phoneNumber}</span></p>
            <p><strong>Role:</strong> <span>{user.role}</span></p>
          </div>
        )}

<div className="buttons-container">
        {/* Residents List Button */}
        <button
          className="toggle-button custom-font"
          onClick={handleToggleVisualizationModal}
        >
          {isVisualizationModalVisible ? "Hide Residents List" : "Residents List"}
        </button>

        {/* These buttons appear when "Residents List" is clicked */}
        {isResidentActionsVisible && (
          <>
            <button className="toggle-button custom-font" onClick={handleToggleModal}>
            ‎ ‎ ‎ ‎ + Add New Resident
            </button>
            <button className="update-button" onClick={handleToggleActions}>
              {showActions ? "‎ ‎ ‎ ‎ Hide Actions" : "   ‎ ‎ ‎ ‎ Update Resident"}
            </button>
          </>
        )}

        {/* Upload CSV File */}
        <button
          className="toggle-button custom-font"
          onClick={() => document.getElementById("upload-csv").click()}
        >
            Upload CSV File
          </button>

          <button
            className="toggle-button custom-font"
            onClick={() => {
              setIsUserDetailsModalVisible(!isUserDetailsModalVisible);
              if (!isUserDetailsModalVisible) {
                fetchUsers();
              }
            }}
          >
            {isUserDetailsModalVisible ? "Hide Users" : "Users"}
          </button>
          <input
            id="upload-csv"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleUploadCSV}
          />

          <button className="logout-button" onClick={handleLogout}>Log Out</button>
        </div>

        <div className="profile-section">
          {user && (
            <>
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              <button1 onClick={() => setShowUserDetails(!showUserDetails)}>
                <span>Hello, {user.firstName}!</span>
                <br />
                <small>Open Profile</small>
              </button1>
            </>
          )}
        </div>
      </div>

      <div className="title-container">
      </div>

      {isModalVisible && (
        <>
          <div className="modal-overlay active" onClick={handleToggleModal}></div>
          <div className="modal active">
            <button className="close-button" onClick={handleToggleModal}>×</button>
            <h2 className="modal-title">{isEditing ? 'Edit Resident' : 'Add New Resident'}</h2>

          <form className="form1" onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
            
          <div className="form2-group">
          <label>Resident ID:</label>
          <input type="text" name="id" value={formData.id} onChange={handleChange} required disabled={isEditing} />
          </div>
          <div className="form2-group">
          <label>First Name:</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form2-group">
          <label>Middle Initial:</label>
          <input type="text" name="middleInitial" value={formData.middleInitial} onChange={handleChange} />
          </div>
         
          <div className="form2-group">

          <label>Surname:</label>
          <input type="text" name="surname" value={formData.surname} onChange={handleChange} required />
          </div>
          
          <div className="form2-group">
          <label>Date of Birth:</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="form2-group">

          <label>Age:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
          </div>
     
          <div className="form2-group">

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
                    <div className="form2-group">

          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          </div>
                  
                    <div className="form2-group">

          <label>Religion:</label>
          <input type="text" name="religion" value={formData.religion} onChange={handleChange} required />
          </div>
          <div className="form3-group">

          <label>Contact Number:</label>
          <input type="number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
          </div>
          <div className="form3-group">

          <label>House Number:</label>
          <input type="text" name="houseNumber" value={formData.houseNumber} onChange={handleChange} required />
          </div>
          <div className="form2-group">

          <label>Street:</label>
          <input type="text" name="street" value={formData.street} onChange={handleChange} required />
          </div>
          <div className="form2-group">
          <label>Purok:</label>
          <input type="text" name="purok" value={formData.purok} onChange={handleChange} required />
          </div>
          <div className="form3-group">
          <label>Household ID:</label>
          <input type="text" name="householdId" value={formData.householdId} onChange={handleChange} required />
          </div>
          <div className="form3-group">
          <label>Household Head:</label>
          <select name="householdHead" value={formData.householdHead} onChange={handleChange} required>
            <option value="">Select Household Head Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
                    </div>
                    <div className="form4-group">
          <label>Number of Household Members:</label>
          <input type="number" name="numberOfHouseholdMembers" value={formData.numberOfHouseholdMembers} onChange={handleChange} required />
          </div>
          <div className="form4-group">
          <label>Relationship to Household Head:</label>
          <input type="text" name="relationshipToHouseholdHead" value={formData.relationshipToHouseholdHead} onChange={handleChange} required />
          </div>
          <div className="form2-group">
          <label>Occupation:</label>
          <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required />
          </div>
          <div className="form5-group">
          <label>Employer/ Workplace:</label>
          <input type="text" name="employerWorkplace" value={formData.employerWorkplace} onChange={handleChange} />
          </div>
          <div className="form5-group">
          <label>Educational Attainment:</label>
          <select name="educationalAttainment" value={formData.educationalAttainment} onChange={handleChange} required>
            <option value="">Select Educational Attainment</option>
            <option value="None">None</option>
            <option value="Elementary">Elementary</option>
          <option value="High School">High School</option>
          <option value="Vocational">Vocational</option>
          <option value="College">College</option>
          <option value="Postgraduate">Postgraduate</option>
          </select>
                    </div>
                    <div className="form5-group">
          <label>Type of Residence:</label>
          <select name="typeOfResidence" value={formData.typeOfResidence} onChange={handleChange} required>
            <option value="">Select Type of Residence</option>
            <option value="Owned">Owned</option>
            <option value="Rented">Rented</option>
            <option value="Informal Settler">Informal Settler</option>
          </select>
                    </div>
                    <div className="form5-group">
          <label>Barangay ID Number:</label>
          <input type="text" name="barangayIdNumber" value={formData.barangayIdNumber} onChange={handleChange} />
          </div>
<div className="form2-group">
  <label>Voter Status:</label>
  <select name="voterStatus" value={formData.voterStatus} onChange={handleChange} required>
    <option value="">Select Voter Status</option>
    <option value="Registered">Registered</option>
    <option value="Not Registered">Not Registered</option>
  </select>
</div>

<div className="form3-group">
  <label>4Ps Beneficiary:</label>
  <select name="fourPsBeneficiary" value={formData.fourPsBeneficiary} onChange={handleChange} required>
    <option value="">Select 4Ps Beneficiary Status</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

<div className="form2-group">
  <label>PWD Status:</label>
  <select name="pwdStatus" value={formData.pwdStatus} onChange={handleChange} required>
    <option value="">Select PWD Status</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

          <div className="button-container">
            <button type="submit">{isEditing ? "Update Resident" : "Add Resident"}</button>
              </div>
            </form>
          </div>
        </>
      )}

      {isVisualizationModalVisible && (
        <>
<div className="modalU-overlay active" onClick={() => setIsUserDetailsModalVisible(false)}></div>
          <div className="modalU active">

           
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
            </div>
            <table className="resident-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Middle Initial</th>
                  <th>Surname</th>
                  <th>Date of Birth</th>
                  <th>Age</th>
                  <th>Civil Status</th>
                  <th>Gender</th>
                  <th>Religion</th>
                  <th>Contact No.</th>
                  <th>House No.</th>
                  <th>Street</th>
                  <th>Purok</th>
                  <th>Household ID</th>
                  <th>Household Head</th>
                  <th>No. of Household Members</th>
                  <th>Relationship to Household Head</th>
                  <th>Occupation</th>
                  <th>Employer/ Workplace</th>
                  <th>Educational Attainment</th>
                  <th>Type of Residence</th>
                  <th>Barangay ID Number</th>
                  <th>Voter Status</th>
                  <th>4Ps Beneficiary</th>
                  <th>PWD Status</th>
                  {showActions && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
              {filteredResidents.map((resident) => (
            <tr key={resident._id}>
                    <td>{resident.id}</td>
                    <td>{resident.firstName}</td>
                    <td>{resident.middleInitial}</td>
                    <td>{resident.surname}</td>
                    <td>{resident.dateOfBirth}</td>
                    <td>{resident.age}</td>
                    <td>{resident.civilStatus}</td>
                    <td>{resident.gender}</td>
                    <td>{resident.religion}</td>
                    <td>{resident.contactNumber}</td>
                    <td>{resident.houseNumber}</td>
                    <td>{resident.street}</td>
                    <td>{resident.purok}</td>
                    <td>{resident.householdId}</td>
                    <td>{resident.householdHead}</td>
                    <td>{resident.numberOfHouseholdMembers}</td>
                    <td>{resident.relationshipToHouseholdHead}</td>
                    <td>{resident.occupation}</td>
                    <td>{resident.employerWorkplace}</td>
                    <td>{resident.educationalAttainment}</td>
                    <td>{resident.typeOfResidence}</td>
                    <td>{resident.barangayIdNumber}</td>
                    <td>{resident.voterStatus}</td>
                    <td>{resident.fourPsBeneficiary}</td>
                    <td>{resident.pwdStatus}</td>
                    {showActions && (
                      <td>
  <div className="action-buttons">
    <button onClick={() => handleEdit(resident)}>
      <Pencil size={12} color="black" />
    </button>
    <button onClick={() => handleDelete(resident.id)}>
      <Trash size={12} color="brown" />
    </button>
  </div>
</td>

                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isUserDetailsModalVisible && (
        <>
          <div className="modalU-overlay active" onClick={() => setIsUserDetailsModalVisible(false)}></div>
          <div className="modalU active">
            <button className="close-button" onClick={() => setIsUserDetailsModalVisible(false)}>×</button>
            <h2 className="modalU-title">User Details</h2>
            <div className="user-details-container">
              <table className="user-details-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Age</th>
                    <th>Address</th>
                    <th>Gender</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.age}</td>
                      <td>{user.address}</td>
                      <td>{user.gender}</td>
                      <td>{user.phoneNumber}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button className="buttonU" onClick={() => handleEditUser(user)}>
                          <Pencil size={16} color="black" />
                        </button>
                        <button className="buttonU" onClick={() => handleDeleteUser(user.id)}>
                          <Trash size={16} color="brown" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isUserEditModalVisible && (
        <>
          <div className="modal-overlay active" onClick={() => setIsUserEditModalVisible(false)}></div>
          <div className="modal active">
            <button className="close-button" onClick={() => setIsUserEditModalVisible(false)}>×</button>
            <h2 className="modal-title">Edit User</h2>
            <form className="form" onSubmit={handleUserEditSubmit}>
              <input type="text" name="username" placeholder="Username" value={selectedUser?.username || ''} onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })} required />
              <input type="text" name="firstName" placeholder="First Name" value={selectedUser?.firstName || ''} onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })} required />
              <input type="text" name="lastName" placeholder="Last Name" value={selectedUser?.lastName || ''} onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })} required />
              <input type="number" name="age" placeholder="Age" value={selectedUser?.age || ''} onChange={(e) => setSelectedUser({ ...selectedUser, age: e.target.value })} required />
              <input type="text" name="address" placeholder="Address" value={selectedUser?.address || ''} onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })} required />
              <input type="text" name="gender" placeholder="Gender" value={selectedUser?.gender || ''} onChange={(e) => setSelectedUser({ ...selectedUser, gender: e.target.value })} required />
              <input type="text" name="phoneNumber" placeholder="Phone Number" value={selectedUser?.phoneNumber || ''} onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })} required />
              <input type="email" name="email" placeholder="Email" value={selectedUser?.email || ''} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} required />
              <input type="text" name="role" placeholder="Role" value={selectedUser?.role || ''} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })} required />
              <div className="button-container">
                <button type="submit">Update User</button>
              </div>
            </form>
          </div>
        </>
      )}

      <div className="container">
        <div className="visualization-charts-container">
              {/* Total Population */}
              <div className="chart">
                <h3>Total Population</h3>
                <p>{residents.length} Residents</p>
              </div>


              {/* Senior Citizen & PWD Count */}
              <div className="chart">
                <h3>Senior Citizen & PWD Count</h3>
                <p>Senior Citizens (60+): {residents.filter(resident => resident.age >= 60).length}</p>
                <p>Persons with Disabilities: {residents.filter(resident => resident.pwdStatus === 'Yes').length}</p>
              </div>

              {/* Total Households */}
              <div className="chart">
                <h3>Total Households</h3>
                <p>{new Set(residents.map(resident => resident.householdId)).size} Households</p>
              </div>
                  

            {/* Average Household Size */}
            <div className="chart">
                            <h3>Average Household Size</h3>
                            <p>{(residents.length / new Set(residents.map(resident => resident.householdId)).size).toFixed(2)}</p>
                          </div> 





              {/* Employment Rate */}
              <div className="chart">
                <h3>Employment Rate</h3>
                <p>{((residents.filter(resident => resident.occupation !== 'Unemployed').length / residents.length) * 100).toFixed(2)}%</p>
              </div>

              
              {/* Population by Gender */}
              <div className="chart">
                <h3>Population by Gender</h3>
                <PieChart width={350} height={350}>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={130}
                    label
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#82ca9d' : '#A195F7'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              {/* Age Distribution */}
              <div className="chart">
                <h3>Age Distribution</h3>
                <BarChart width={300} height={350} data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#A195F7" />
                </BarChart>
              </div>

              {/* Educational Attainment Distribution */}
              <div className="chart">
                <h3>Educational Attainment Distribution</h3>
                <BarChart width={400} height={350} data={educationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#A195F7" />
                </BarChart>
              </div>
            </div>
          </div>

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;