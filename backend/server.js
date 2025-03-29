import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Route imports
import jobPostRoutes from './routes/jobPostRoutes.js';
import ResumeRoutes from './routes/ResumeRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Prevent payload size attacks
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection with enhanced options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ChaosCoders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // Attempt reconnection
    setTimeout(connectDB, 5000);
  }
};

// Define JobPost model with comprehensive validation
const jobPostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: { 
    type: String, 
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long']
  },
  company: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true
  },
  location: { 
    type: String, 
    required: [true, 'Job location is required'],
    trim: true
  },
  salary: { 
    type: Number, 
    min: [0, 'Salary cannot be negative'],
    default: null 
  },
  category: { 
    type: String, 
    required: [true, 'Job category is required'],
    trim: true
  },
  skills: { 
    type: [String], 
    default: [], 
    validate: {
      validator: function(v) {
        return v.every(skill => skill.trim().length > 0);
      },
      message: 'Skills cannot be empty strings'
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true 
  }
}, { 
  timestamps: true,  // Adds createdAt and updatedAt
  strict: true       // Disallow fields not in schema
});

const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', jobPostSchema);

// Routes
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/resumes', ResumeRoutes);

// Mailgun Setup with enhanced error handling
const setupMailgun = () => {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('❌ Mailgun API key or domain is missing!');
    return null;
  }

  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  });
};

const mg = setupMailgun();

// Email sending route with comprehensive error handling
app.post('/api/send-email', async (req, res) => {
  if (!mg) {
    return res.status(500).json({
      message: 'Email service not configured',
      success: false
    });
  }

  const { to, subject, body } = req.body;

  // Validate email input
  if (!to || !subject || !body) {
    return res.status(400).json({
      message: 'Missing required email fields',
      success: false
    });
  }

  try {
    const mailgunResult = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Job Matcher <${process.env.MAILGUN_SENDER}>`,
      to: [to],
      subject,
      text: body
    });

    res.status(200).json({
      message: 'Email sent successfully',
      success: true,
      provider: 'Mailgun',
      messageId: mailgunResult.id
    });
  } catch (error) {
    console.error('Mailgun email sending error:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error: error.response ? error.response.body : error.message,
      success: false
    });
  }
});

// Job post creation route with comprehensive validation
app.post('/api/jobposts', async (req, res) => {
  try {
    const jobPost = new JobPost({
      ...req.body,
      skills: req.body.skills || [],
      createdAt: new Date()
    });

    // Validate the job post before saving
    await jobPost.validate();
    await jobPost.save();

    res.status(201).json({
      message: 'Job post created successfully',
      jobPost
    });
  } catch (error) {
    console.error('Job Post Creation Error:', error);
    res.status(400).json({
      message: 'Failed to create job post',
      errors: error.errors ? Object.values(error.errors).map(err => err.message) : error.message
    });
  }
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server and connect to database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await Resume.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ 
      message: 'Server error fetching candidate', 
      error: error.message 
    });
  }
});
export default app;