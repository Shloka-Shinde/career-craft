// routes/jobPostRoutes.js
import express from 'express';
import JobPost from '../models/JobPost.js'; // Adjust path as needed

const router = express.Router();

// Create a new job post
router.post('/', async (req, res) => {
  try {
    const jobPost = new JobPost(req.body);
    await jobPost.save();
    res.status(201).json(jobPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all job posts
router.get('/', async (req, res) => {
  try {
    const jobPosts = await JobPost.find();
    res.json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;