import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash, Eye, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/incidents';

function IncidentManagement() {
  const [incidentData, setIncidentData] = useState({
    id: '',
    reporterName: '',
    reporterContact: '',
    reporterAddress: '',
    incidentType: '',
    description: '',
    location: '',
    dateReported: new Date().toISOString().substr(0, 10),
    status: 'Pending',
    assignedTo: '',
    priority: 'Medium',
    resolutionDetails: '',
    resolutionDate: '',
    attachments: []
  });

  const [incidents, setIncidents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [staff, setStaff] = useState([]);

  // Incident types specific to barangay needs
  const incidentTypes = [
    'Noise Complaint',
    'Domestic Dispute',
    'Property Dispute',
    'Vandalism',
    'Public Disturbance',
    'Road/Infrastructure Issue',
    'Garbage Collection',
    'Flooding',
    'Electrical/Utility Problem',
    'Suspicious Activity',
    'Animal Control',
    'Business Regulation Violation',
    'Water Supply Issue',
    'Sanitation Concern',
    'Other'
  ];

  useEffect(() => {
    fetchIncidents();
    fetchStaff();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, searchQuery, filterStatus, filterType, filterPriority]);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(API_URL);
      // Sort by date reported (newest first) and then by priority
      const sortedIncidents = response.data.sort((a, b) => {
        if (new Date(b.dateReported) - new Date(a.dateReported) === 0) {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.dateReported) - new Date(a.dateReported);
      });
      setIncidents(sortedIncidents);
      setFilteredIncidents(sortedIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Error fetching incidents!');
    }
  };

  const fetchStaff = async () => {
    try {
      // Assuming you have a staff or users endpoint
      const response = await axios.get('http://localhost:5000/users');
      // Filter only users with staff role or create a dedicated staff endpoint
      const staffMembers = response.data.filter(user => user.role === 'staff' || user.role === 'admin');
      setStaff(staffMembers);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error fetching staff members!');
    }
  };

  const handleChange = (e) => {
    setIncidentData({ ...incidentData, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.reporterName?.toLowerCase().includes(query) ||
        incident.description?.toLowerCase().includes(query) ||
        incident.location?.toLowerCase().includes(query) ||
        incident.incidentType?.toLowerCase().includes(query) ||
        incident.id?.toString().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(incident => incident.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(incident => incident.incidentType === filterType);
    }

    // Apply priority filter
    if (filterPriority !== 'All') {
      filtered = filtered.filter(incident => incident.priority === filterPriority);
    }

    setFilteredIncidents(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterType('All');
    setFilterPriority('All');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate a unique ID if not provided
      const newIncidentData = { 
        ...incidentData,
        id: incidentData.id || Date.now().toString()
      };
      
      await axios.post(API_URL, newIncidentData);
      toast.success('Incident reported successfully!');
      fetchIncidents();
      resetIncidentForm();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding incident:', error);
      toast.error('Error reporting incident!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${incidentData.id}`, incidentData);
      toast.success('Incident updated successfully!');
      fetchIncidents();
      resetIncidentForm();
      setIsModalVisible(false);
      setIsEditing(false);
      setIsViewMode(false);
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Error updating incident!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident report?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Incident deleted successfully!');
        fetchIncidents();
      } catch (error) {
        console.error('Error deleting incident:', error);
        toast.error('Error deleting incident!');
      }
    }
  };

  const handleEdit = (incident) => {
    setIncidentData(incident);
    setIsEditing(true);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  const handleView = (incident) => {
    setIncidentData(incident);
    setIsViewMode(true);
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const resetIncidentForm = () => {
    setIncidentData({
      id: '',
      reporterName: '',
      reporterContact: '',
      reporterAddress: '',
      incidentType: '',
      description: '',
      location: '',
      dateReported: new Date().toISOString().substr(0, 10),
      status: 'Pending',
      assignedTo: '',
      priority: 'Medium',
      resolutionDetails: '',
      resolutionDate: '',
      attachments: []
    });
  };

  const handleToggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setIsEditing(false);
      setIsViewMode(false);
      resetIncidentForm();
    }
  };

  const getDaysOpen = (dateReported) => {
    const reported = new Date(dateReported);
    const today = new Date();
    const diffTime = Math.abs(today - reported);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-badge pending';
      case 'In Progress':
        return 'status-badge in-progress';
      case 'Resolved':
        return 'status-badge resolved';
      case 'Cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-badge high';
      case 'Medium':
        return 'priority-badge medium';
      case 'Low':
        return 'priority-badge low';
      default:
        return 'priority-badge';
    }
  };

  return (
    <div className="incident-management-container">
      <h2 className="section-title">Incident & Complaint Management</h2>
      
      <div className="incident-controls">
        <button 
          className="add-incident-btn"
          onClick={handleToggleModal}
        >
          + Report New Incident/Complaint
        </button>

        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter size={16} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-dropdown">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              {incidentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-dropdown">
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <button 
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="incidents-grid">
        <div className="incident-totals">
          <div className="incident-stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{incidents.length}</span>
          </div>
          <div className="incident-stat">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{incidents.filter(i => i.status === 'Pending').length}</span>
          </div>
          <div className="incident-stat">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{incidents.filter(i => i.status === 'In Progress').length}</span>
          </div>
          <div className="incident-stat">
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{incidents.filter(i => i.status === 'Resolved').length}</span>
          </div>
          <div className="incident-stat">
            <span className="stat-label">High Priority</span>
            <span className="stat-value high-priority">{incidents.filter(i => i.priority === 'High' && i.status !== 'Resolved').length}</span>
          </div>
        </div>

        <div className="incident-table-container">
          <table className="incident-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Date Reported</th>
                <th>Days Open</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>{incident.id}</td>
                    <td>{incident.incidentType}</td>
                    <td>{incident.reporterName}</td>
                    <td>{incident.location}</td>
                    <td>{new Date(incident.dateReported).toLocaleDateString()}</td>
                    <td>{getDaysOpen(incident.dateReported)}</td>
                    <td>
                      <span className={getPriorityBadgeClass(incident.priority)}>
                        {incident.priority}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(incident.status)}>
                        {incident.status}
                      </span>
                    </td>
                    <td>{incident.assignedTo || 'Unassigned'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn" onClick={() => handleView(incident)}>
                          <Eye size={16} />
                        </button>
                        <button className="edit-btn" onClick={() => handleEdit(incident)}>
                          <Pencil size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(incident.id)}>
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-incidents">
                    No incidents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalVisible && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={handleToggleModal}></div>
          <div className="incident-modal">
            <button className="close-modal" onClick={handleToggleModal}>×</button>
            <h3>{isViewMode ? 'Incident Details' : (isEditing ? 'Edit Incident' : 'Report New Incident/Complaint')}</h3>
            
            <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className="incident-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reporterName">Reporter Name:</label>
                  <input 
                    type="text" 
                    id="reporterName" 
                    name="reporterName" 
                    value={incidentData.reporterName} 
                    onChange={handleChange} 
                    disabled={isViewMode}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reporterContact">Contact Number:</label>
                  <input 
                    type="text" 
                    id="reporterContact" 
                    name="reporterContact" 
                    value={incidentData.reporterContact} 
                    onChange={handleChange} 
                    disabled={isViewMode}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reporterAddress">Address:</label>
                <input 
                  type="text" 
                  id="reporterAddress" 
                  name="reporterAddress" 
                  value={incidentData.reporterAddress} 
                  onChange={handleChange} 
                  disabled={isViewMode}
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="incidentType">Incident Type:</label>
                  <select 
                    id="incidentType" 
                    name="incidentType" 
                    value={incidentData.incidentType} 
                    onChange={handleChange} 
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Select Incident Type</option>
                    {incidentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dateReported">Date Reported:</label>
                  <input 
                    type="date" 
                    id="dateReported" 
                    name="dateReported" 
                    value={incidentData.dateReported} 
                    onChange={handleChange} 
                    disabled={isViewMode}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Incident Location:</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={incidentData.location} 
                  onChange={handleChange} 
                  disabled={isViewMode}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={incidentData.description} 
                  onChange={handleChange} 
                  disabled={isViewMode}
                  rows="4" 
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority:</label>
                  <select 
                    id="priority" 
                    name="priority" 
                    value={incidentData.priority} 
                    onChange={handleChange} 
                    disabled={isViewMode}
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <select 
                    id="status" 
                    name="status" 
                    value={incidentData.status} 
                    onChange={handleChange} 
                    disabled={isViewMode}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To:</label>
                <select 
                  id="assignedTo" 
                  name="assignedTo" 
                  value={incidentData.assignedTo} 
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="">Unassigned</option>
                  {staff.map(member => (
                    <option key={member.id} value={`${member.firstName} ${member.lastName}`}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              {(isEditing || isViewMode) && (
                <>
                  <div className="form-group">
                    <label htmlFor="resolutionDetails">Resolution Details:</label>
                    <textarea 
                      id="resolutionDetails" 
                      name="resolutionDetails" 
                      value={incidentData.resolutionDetails} 
                      onChange={handleChange} 
                      disabled={isViewMode}
                      rows="3" 
                    />
                  </div>
                  
                  {incidentData.status === 'Resolved' && (
                    <div className="form-group">
                      <label htmlFor="resolutionDate">Resolution Date:</label>
                      <input 
                        type="date" 
                        id="resolutionDate" 
                        name="resolutionDate" 
                        value={incidentData.resolutionDate} 
                        onChange={handleChange} 
                        disabled={isViewMode}
                      />
                    </div>
                  )}
                </>
              )}
              
              {!isViewMode && (
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {isEditing ? 'Update Incident' : 'Submit Report'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleToggleModal}>
                    Cancel
                  </button>
                </div>
              )}
              
              {isViewMode && (
                <div className="form-actions">
                  <button type="button" className="edit-btn" onClick={() => {
                    setIsViewMode(false);
                    setIsEditing(true);
                  }}>
                    Edit
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleToggleModal}>
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default IncidentManagement;