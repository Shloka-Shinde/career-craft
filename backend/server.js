import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { createClient } from '@supabase/supabase-js';

// 2. Load environment variables
dotenv.config();

// 3. Initialize Express app
const app = express();
const PORT = process.env.PORT || 5003;

// 4. Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// 5. Enhanced CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 6. Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. MongoDB Connection with enhanced options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ChaosCoders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    setTimeout(connectDB, 5000);
  }
};

// 8. Define Mongoose Schemas
const jobPostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [String],
  location: String,
  salary: Number,
  company: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  fullName: String,
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  },
  skills: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const candidateSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true
  },
  applicantId: {
    type: String,
    required: true
  },
  applicantEmail: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  applicantName: {
    type: String,
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'interview', 'hired', 'rejected'],
    default: 'new'
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 9. Create Mongoose Models
const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', jobPostSchema);
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);
const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

// 10. Authentication middleware
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// 11. Auth webhook handler
app.post('/auth-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['supabase-signature'];
  const rawBody = req.body.toString('utf8');

  try {
    const isValid = supabaseAdmin.auth.verifyWebhook(rawBody, sig);
    if (!isValid) return res.status(401).send('Invalid signature');

    const event = JSON.parse(rawBody);
    
    if (event.type === 'user.created') {
      await UserProfile.create({
        userId: event.user.id,
        email: event.user.email
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook processing failed');
  }
});

// 12. Protected endpoints
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.id })
      .populate('resume');
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 13. Resume management endpoint
app.post('/api/resumes', authenticateJWT, async (req, res) => {
  try {
    const newResume = await Resume.create({
      userId: req.user.id,
      content: req.body.content,
      skills: req.body.skills
    });

    await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { resume: newResume._id }
    );

    res.status(201).json(newResume);
  } catch (err) {
    console.error('Resume creation error:', err);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// 14. Job Post Routes (imported from external file)
import jobPostRoutes from './routes/jobPostRoutes.js';
app.use('/api/jobposts', jobPostRoutes);

// 15. Resume Routes (imported from external file)
import ResumeRoutes from './routes/ResumeRoutes.js';
app.use('/api/resumes', ResumeRoutes);

// 16. Candidates API Routes
// Get all candidates
app.get('/api/candidates', authenticateJWT, async (req, res) => {
  try {
    const { status, jobId } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (jobId) {
      query.jobId = jobId;
    }

    const candidates = await Candidate.find(query)
      .populate('jobId', 'title company')
      .populate('resumeId', 'skills')
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (err) {
    console.error('Failed to fetch candidates:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get single candidate
app.get('/api/candidates/:id', authenticateJWT, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId', 'title company')
      .populate('resumeId');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (err) {
    console.error('Failed to fetch candidate:', err);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Create new candidate (used when submitting application)
app.post('/api/candidates', authenticateJWT, async (req, res) => {
  try {
    const { jobId, resumeId, matchScore, notes } = req.body;

    // Get user profile
    const profile = await UserProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const newCandidate = await Candidate.create({
      jobId,
      applicantId: req.user.id,
      applicantEmail: profile.email,
      applicantName: profile.fullName || 'Applicant',
      resumeId,
      matchScore,
      notes,
      status: 'new'
    });

    res.status(201).json(newCandidate);
  } catch (err) {
    console.error('Failed to create candidate:', err);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Update candidate status/notes
app.patch('/api/candidates/:id', authenticateJWT, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        notes,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(updatedCandidate);
  } catch (err) {
    console.error('Failed to update candidate:', err);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
app.delete('/api/candidates/:id', authenticateJWT, async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!deletedCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('Failed to delete candidate:', err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// 17. Mailgun Email Service Configuration
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net'
});

// 18. Email Notification Service
const sendNotificationEmail = async (to, subject, template) => {
  try {
    const data = {
      from: process.env.EMAIL_FROM || 'Chaos Coders <no-reply@chaoscoders.com>',
      to,
      subject,
      html: template
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// 19. Job Application Endpoint (now creates candidate record)
app.post('/api/jobposts/:id/apply', authenticateJWT, async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id);
    if (!jobPost) {
      return res.status(404).json({ error: 'Job post not found' });
    }

    const userProfile = await UserProfile.findOne({ userId: req.user.id });
    if (!userProfile?.resume) {
      return res.status(400).json({ error: 'You need to upload a resume first' });
    }

    // Calculate match score
    const resume = await Resume.findById(userProfile.resume);
    const matchScore = calculateMatchScore(jobPost.requirements, resume.skills);

    // Create candidate record
    const candidate = await Candidate.create({
      jobId: jobPost._id,
      applicantId: req.user.id,
      applicantEmail: userProfile.email,
      applicantName: userProfile.fullName || 'Applicant',
      resumeId: userProfile.resume,
      matchScore,
      status: 'new'
    });

    // Send notification email to employer
    const employer = await UserProfile.findById(jobPost.postedBy);
    if (employer) {
      const emailTemplate = `
        <h1>New Job Application</h1>
        <p>You have a new applicant for your job posting: ${jobPost.title}</p>
        <p>Applicant: ${userProfile.fullName || 'Anonymous'}</p>
        <p>Contact email: ${userProfile.email}</p>
        <p>Match Score: ${matchScore}%</p>
        <p><a href="${process.env.DASHBOARD_URL}/candidates/${candidate._id}">View Candidate Profile</a></p>
      `;
      await sendNotificationEmail(employer.email, 'New Job Application', emailTemplate);
    }

    res.json({ 
      success: true,
      message: 'Application submitted successfully',
      candidate
    });
  } catch (err) {
    console.error('Job application error:', err);
    res.status(500).json({ error: 'Failed to process application' });
  }
});

// Helper function to calculate match score
const calculateMatchScore = (jobRequirements, resumeSkills) => {
  if (!jobRequirements || !resumeSkills) return 0;
  
  const jobReqSet = new Set(jobRequirements.map(skill => skill.toLowerCase().trim()));
  const resumeSkillSet = new Set(resumeSkills.map(skill => skill.toLowerCase().trim()));
  
  const intersection = [...jobReqSet].filter(skill => resumeSkillSet.has(skill));
  
  return jobReqSet.size > 0 ? Math.round((intersection.length / jobReqSet.size) * 100) : 0;
};

// 20. Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      supabase: 'connected' // Assuming Supabase connection is always active
    },
    timestamp: new Date().toISOString()
  });
});

// 21. Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 22. Start server function
const startServer = async () => {
  try {
    await connectDB();

    // Test connections
    const [supabaseTest, mongoTest] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').limit(1),
      UserProfile.findOne()
    ]);

    console.log('✅ Supabase connected:', supabaseTest.data ? 'OK' : 'Failed');
    console.log('✅ MongoDB connected:', mongoTest ? 'OK' : 'Failed');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📧 Email service: ${process.env.MAILGUN_API_KEY ? 'Enabled' : 'Disabled'}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize server:', err);
    process.exit(1);
  }
};

// 23. Start the application
startServer();

// 24. Export the app
export default app;