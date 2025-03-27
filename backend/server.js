import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jobPostRoutes from './routes/jobPostRoutes.js';
import ResumeRoutes from './routes/ResumeRoutes.js'; // Add this line

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ChaosCoders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/resumes', ResumeRoutes); // Add this line for resumes route

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});