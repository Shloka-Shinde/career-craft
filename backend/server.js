// 1. Import required modules
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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    unique: true
  },
  fullName: String,
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  createdAt: {
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

// 9. Create Mongoose Models
const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', jobPostSchema);
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);
const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

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

// 16. Public health check endpoint (continued)app.get('/health', (req, res) => {
    app.get('/data', async (req, res) => {
        try {
            const data = await fetchData();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" });
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

// 19. Job Application Endpoint
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

// Send notification email to employer
const employer = await UserProfile.findById(jobPost.postedBy);
if (employer) {
  const emailTemplate = `
    <h1>New Job Application</h1>
    <p>You have a new applicant for your job posting: ${jobPost.title}</p>
    <p>Applicant: ${userProfile.fullName || 'Anonymous'}</p>
    <p>Contact email: ${userProfile.email}</p>
  `;
  await sendNotificationEmail(employer.email, 'New Job Application', emailTemplate);
}

res.json({ 
  success: true,
  message: 'Application submitted successfully'
});
} catch (err) {
console.error('Job application error:', err);
res.status(500).json({ error: 'Failed to process application' });
}
});

// 20. Error handling middleware
app.use((err, req, res, next) => {
console.error('Server error:', err);
res.status(500).json({ 
error: err.message || 'Internal server error',
...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
});

// 21. Start server function
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

// 22. Start the application
startServer();

// 23. Export the app
export default app;