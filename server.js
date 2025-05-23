const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require("cors");
const bodyParser = require('body-parser');
const multer = require('multer'); // For handling file uploads
const csvParser = require('csv-parser'); // For parsing CSV files
const fs = require('fs'); // File system module
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const mongoose = require('mongoose'); // MongoDB ODM
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/barangay_management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  gender: { type: String },
  phoneNumber: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'viewer', enum: ['admin', 'moderator', 'viewer'] }
});

const sessionSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  age: { type: Number },
  address: { type: String },
  gender: { type: String },
  phoneNumber: { type: String },
  role: { type: String }
});

const residentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => uuidv4() },
  firstName: { type: String, required: true },
  middleInitial: { type: String, required: true },
  surname: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  age: { type: Number, required: true },
  civilStatus: { type: String, required: true },
  gender: { type: String, required: true },
  religion: { type: String, required: true },
  contactNumber: { type: String, required: true },
  houseNumber: { type: String, required: true },
  street: { type: String, required: true },
  purok: { type: String, required: true },
  householdId: { type: String, required: true },
  householdHead: { type: String, required: true },
  numberOfHouseholdMembers: { type: Number, required: true },
  relationshipToHouseholdHead: { type: String, required: true },
  occupation: { type: String, required: true },
  employerWorkplace: { type: String, required: true },
  educationalAttainment: { type: String, required: true },
  typeOfResidence: { type: String, required: true },
  barangayIdNumber: { type: String, required: true },
  voterStatus: { type: String, required: true },
  fourPsBeneficiary: { type: String, required: true },
  pwdStatus: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);
const Resident = mongoose.model('Resident', residentSchema);

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, firstName, lastName, age, address, gender, phoneNumber, email, password, role, registryCode } = req.body;

    // Validate role with registry code
    if (role === 'admin' && registryCode !== process.env.ADMIN_CODE) {
      return res.status(400).json({ message: 'Invalid admin registry code' });
    }
    if (role === 'moderator' && registryCode !== process.env.MODERATOR_CODE) {
      return res.status(400).json({ message: 'Invalid moderator registry code' });
    }
    if (role === 'viewer' && registryCode) {
      return res.status(400).json({ message: 'Registry code not required for viewer role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      firstName,
      lastName,
      age: Number(age),
      address,
      gender,
      phoneNumber,
      email,
      password: hashedPassword,
      role: role || 'viewer'
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Update user route
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username or email is being updated and if they're already in use
    if (updateData.username && updateData.username !== existingUser.username) {
      const usernameExists = await User.findOne({ 
        username: updateData.username, 
        _id: { $ne: id } 
      });
      if (usernameExists) return res.status(400).json({ message: 'Username already in use' });
    }
    
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Handle password hashing if needed
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});



// Route to Fetch All Users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Store user session in MongoDB
    const sessionData = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      address: user.address,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    // Update or create session
    await Session.findOneAndUpdate(
      { username: user.username },
      sessionData,
      { upsert: true, new: true }
    );

    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    res.json({ 
      user: sessionData,
      token 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/me', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Retrieve user session from MongoDB
    const session = await Session.findOne({ username });

    if (!session) {
      return res.status(404).json({ message: 'User not found or not logged in' });
    }

    res.json(session);

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    await Session.findOneAndDelete({ username }); // Remove session from MongoDB
    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
});






app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user to get username for session deletion
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    // Delete session if exists
    await Session.findOneAndDelete({ username: user.username });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// CRUD Operations for Residents


// Route to save resident data
app.post('/residents', async (req, res) => {
  console.log("Received Data:", req.body);

  const { id, firstName, middleInitial, surname, dateOfBirth, age, civilStatus, gender, religion, contactNumber, houseNumber, street, purok, householdId, householdHead, numberOfHouseholdMembers, relationshipToHouseholdHead, occupation, employerWorkplace, educationalAttainment, typeOfResidence, barangayIdNumber, voterStatus, fourPsBeneficiary, pwdStatus } = req.body;

  if (!firstName || !middleInitial || !surname || !dateOfBirth || !age || !civilStatus || !gender || !religion || !contactNumber || !houseNumber || !street || !purok || !householdId || !householdHead || !numberOfHouseholdMembers || !relationshipToHouseholdHead || !occupation || !employerWorkplace || !educationalAttainment || !typeOfResidence || !barangayIdNumber || !voterStatus || !fourPsBeneficiary || !pwdStatus) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if ID is provided and if it already exists
    if (id) {
      const existingResident = await Resident.findOne({ id });
      if (existingResident) {
        return res.status(400).json({ message: 'Resident with this ID already exists' });
      }
    }

    const newResident = new Resident({
      id: id || uuidv4(), // Use provided ID or generate new one
      firstName, 
      middleInitial, 
      surname, 
      dateOfBirth, 
      age, 
      civilStatus, 
      gender, 
      religion, 
      contactNumber, 
      houseNumber, 
      street, 
      purok, 
      householdId, 
      householdHead, 
      numberOfHouseholdMembers, 
      relationshipToHouseholdHead, 
      occupation, 
      employerWorkplace, 
      educationalAttainment, 
      typeOfResidence, 
      barangayIdNumber, 
      voterStatus, 
      fourPsBeneficiary, 
      pwdStatus
    });

    await newResident.save();

    res.status(201).json({ message: 'Resident saved successfully', id: newResident.id });
  } catch (error) {
    console.error('Error saving resident:', error);
    res.status(500).json({ message: 'Failed to save resident' });
  }
});

// Read all residents
app.get('/residents', async (req, res) => {
  try {
    const residents = await Resident.find({});
    res.json(residents);
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ message: 'Failed to fetch residents' });
  }
});

// Update resident
app.put('/residents/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const existingResident = await Resident.findById(id);
    if (!existingResident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    const updatedResident = await Resident.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    console.log("Updated Data:", updatedResident); // Debugging log

    res.status(200).json({ message: 'Resident updated successfully', resident: updatedResident });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
  }
});

app.delete('/residents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First try - using the custom ID field
    let deletedResident = await Resident.findOneAndDelete({ id });
    
    // If not found by custom ID, try by MongoDB _id
    if (!deletedResident) {
      deletedResident = await Resident.findByIdAndDelete(id);
    }
    
    if (!deletedResident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    res.status(200).json({ 
      message: 'Resident deleted successfully',
      deletedId: deletedResident.id || deletedResident._id
    });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({ 
      message: 'Failed to delete resident',
      error: error.message // Include error message for debugging
    });
  }
});

app.post('/residents/upload-csv', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const residents = [];
  let skippedCount = 0;
  let savedCount = 0;
  let errorCount = 0;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      residents.push(row);
    })
    .on('end', async () => {
      try {
        const results = [];
        
        for (const resident of residents) {
          try {
            // Convert numeric fields and handle empty values
            const processedResident = {
              id: resident.id || undefined, // Don't generate new ID if not provided
              firstName: resident.firstName,
              middleInitial: resident.middleInitial,
              surname: resident.surname,
              dateOfBirth: resident.dateOfBirth,
              age: Number(resident.age) || 0,
              civilStatus: resident.civilStatus,
              gender: resident.gender,
              religion: resident.religion,
              contactNumber: resident.contactNumber,
              houseNumber: resident.houseNumber,
              street: resident.street,
              purok: resident.purok,
              householdId: resident.householdId,
              householdHead: resident.householdHead,
              numberOfHouseholdMembers: Number(resident.numberOfHouseholdMembers) || 0,
              relationshipToHouseholdHead: resident.relationshipToHouseholdHead,
              occupation: resident.occupation,
              employerWorkplace: resident.employerWorkplace,
              educationalAttainment: resident.educationalAttainment,
              typeOfResidence: resident.typeOfResidence,
              barangayIdNumber: resident.barangayIdNumber,
              voterStatus: resident.voterStatus,
              fourPsBeneficiary: resident.fourPsBeneficiary,
              pwdStatus: resident.pwdStatus
            };

            // Check if resident with this ID already exists
            if (resident.id) {
              const existingResident = await Resident.findOne({ id: resident.id });
              if (existingResident) {
                skippedCount++;
                continue; // Skip existing residents
              }
            }

            const newResident = new Resident(processedResident);
            const savedResident = await newResident.save();
            results.push(savedResident);
            savedCount++;
          } catch (error) {
            console.error(`Error processing resident: ${error.message}`);
            errorCount++;
          }
        }

        fs.unlinkSync(filePath); // Remove the uploaded file after processing
        
        res.status(201).json({ 
          message: 'CSV file processed successfully',
          savedCount,
          skippedCount,
          errorCount,
          residents: results
        });
      } catch (error) {
        console.error('Error processing CSV file:', error);
        res.status(500).json({ message: 'Failed to process CSV file', error: error.message });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ message: 'Failed to read CSV file' });
    });
});

app.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    // Get user by username
    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add to your existing schemas
const certificateSchema = new mongoose.Schema({
  controlNumber: { type: String, required: true, unique: true },
  residentId: { type: String, required: true },
  certificateType: { 
    type: String, 
    required: true,
    enum: ['clearance', 'residency', 'indigency']
  },
  purpose: { type: String, required: true },
  issuedBy: { type: String, required: true },
  dateIssued: { type: Date, required: true, default: Date.now },
  orNumber: { type: String },
  orAmount: { type: Number },
  residentData: { type: Object } // Store resident data snapshot
});

const Certificate = mongoose.model('Certificate', certificateSchema);

// Generate a control number
function generateControlNumber(type) {
  const prefix = {
    'clearance': 'BC',
    'residency': 'CR',
    'indigency': 'CI'
  }[type] || 'CT';
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  return `${prefix}${year}${month}${randomNum}`;
}

// Certificate Routes
app.post('/certificates', async (req, res) => {
  try {
    const { residentId, certificateType, purpose, orNumber, orAmount, issuedBy } = req.body;
    
    // Get resident data
    const resident = await Resident.findOne({ id: residentId });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    // Generate control number
    const controlNumber = generateControlNumber(certificateType);
    
    // Create certificate
    const certificate = new Certificate({
      controlNumber,
      residentId,
      certificateType,
      purpose,
      issuedBy,
      orNumber,
      orAmount,
      residentData: resident.toObject()
    });
    
    await certificate.save();
    
    res.status(201).json(certificate);
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

app.get('/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find({})
      .sort({ dateIssued: -1 })
      .limit(100);
      
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
});

app.get('/certificates/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      $or: [
        { _id: req.params.id },
        { controlNumber: req.params.id }
      ]
    });
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ message: 'Failed to fetch certificate' });
  }
});

app.get('/certificates/resident/:residentId', async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      residentId: req.params.residentId 
    }).sort({ dateIssued: -1 });
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching resident certificates:', error);
    res.status(500).json({ message: 'Failed to fetch resident certificates' });
  }
});
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username or email is being updated and if they're already in use
    if (req.body.username && req.body.username !== existingUser.username) {
      const usernameExists = await User.findOne({ 
        username: req.body.username, 
        _id: { $ne: id } 
      });
      
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already in use' });
      }
    }
    
    if (req.body.email && req.body.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: req.body.email, 
        _id: { $ne: id } 
      });
      
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Handle password hashing if needed
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      // Remove password from update if not provided
      delete req.body.password;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});




app.get('/users/me', authenticate, async (req, res) => {
  try {
    // The authenticate middleware already attached the user to req.user
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/certificates/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const certificates = await Certificate.find({
      $or: [
        { controlNumber: { $regex: query, $options: 'i' } },
        { 'residentData.firstName': { $regex: query, $options: 'i' } },
        { 'residentData.surname': { $regex: query, $options: 'i' } },
        { 'residentData.houseNumber': { $regex: query, $options: 'i' } },
        { orNumber: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);
    
    res.json(certificates);
  } catch (error) {
    console.error('Error searching certificates:', error);
    res.status(500).json({ message: 'Failed to search certificates' });
  }
});

// Schema for Certificate Requests
const requestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: false
  },
  certificateType: {
    type: String,
    required: true,
    enum: ['clearance', 'residency', 'indigency']
  },
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  actionDate: {
    type: Date
  },
  actionBy: {
    type: String
  },
  remarks: {
    type: String
  }
});

// Create model from schema
const Request = mongoose.model('Request', requestSchema);

// Routes

// POST - Create a new certificate request
app.post('/requests', async (req, res) => {
  try {
    const { fullName, contactNumber, certificateType, purpose, status = 'pending' } = req.body;
    
    // Validation
    if (!fullName || !certificateType || !purpose) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create new request
    const newRequest = new Request({
      fullName,
      contactNumber,
      certificateType,
      purpose,
      status
    });

    // Save to database
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Certificate request submitted successfully',
      data: newRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit request',
      error: error.message
    });
  }
});

// GET - Get all certificate requests
app.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const requests = await Request.find(query).sort({ requestDate: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// GET - Get a specific certificate request by ID
app.get('/requests/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
});

// PUT - Update certificate request status
app.put('/requests/:id', async (req, res) => {
  try {
    const { status, remarks, actionBy } = req.body;
    
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        remarks,
        actionBy, 
        actionDate: Date.now() 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
});

// DELETE - Delete a certificate request
app.delete('/requests/:id', async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    
    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message
    });
  }
});

// Approve request
app.put('/requests/:id/approve', async (req, res) => {
  try {
    const requestId = req.params.id;

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      {
        status: 'approved',
        actionDate: Date.now(),
        actionBy: req.body.actionBy || 'System' // Optional: you can pass the approver's name
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
    });
  }
});

// Reject request
app.put('/requests/:id/reject', async (req, res) => {
  try {
    const requestId = req.params.id;

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      {
        status: 'rejected',
        actionDate: Date.now(),
        actionBy: req.body.actionBy || 'System'
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 