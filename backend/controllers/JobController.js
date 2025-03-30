import express from 'express';
import mongoose from 'mongoose';
import JobApplication from '../models/JobApplication.js';
import JobPost from '../models/JobPost.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { jobId, resumeId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(jobId) || 
        !mongoose.Types.ObjectId.isValid(resumeId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid IDs provided' });
    }

    // Check if job exists
    const jobExists = await JobPost.exists({ _id: jobId }).session(session);
    if (!jobExists) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check for existing application
    const existingApp = await JobApplication.findOne({
      jobId,
      resumeId
    }).session(session);

    if (existingApp) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'Already applied to this job' });
    }

    // Create application
    const application = new JobApplication({
      jobId,
      resumeId,
      status: 'pending'
    });

    await application.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    await session.abortTransaction();
    
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate application' });
    }
    
    res.status(500).json({ 
      message: error.message || 'Application failed' 
    });
  } finally {
    session.endSession();
  }
});

// Get applications for a specific job
router.get('/job/:jobId', async (req, res) => {
  try {
    const applications = await JobApplication.find({
      jobId: req.params.jobId
    }).populate('resumeId', 'name skills experience');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications for a specific candidate
router.get('/candidate/:resumeId', async (req, res) => {
  try {
    const applications = await JobApplication.find({
      resumeId: req.params.resumeId
    }).populate('jobId', 'title company location');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;