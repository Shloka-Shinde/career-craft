import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// GET all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('jobId', 'title company')
      .populate('resumeId', 'name')
      .populate('applicantId', 'fullName email');
      
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching candidates" });
  }
});

// GET a specific candidate
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId', 'title company')
      .populate('resumeId')
      .populate('applicantId', 'fullName email');

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching candidate" });
  }
});
// In your POST route (/routes/candidateRoutes.js)
router.post('/', async (req, res) => {
    try {
      // This will automatically create the collection if it doesn't exist
      const candidate = new Candidate({
        jobId: req.body.jobId || new mongoose.Types.ObjectId(), // Sample required field
        applicantId: req.body.applicantId || 'sample-user-id',
        applicantEmail: req.body.applicantEmail || 'test@example.com',
        status: 'Applied'
      });
      
      await candidate.save(); // This creates the collection
      res.status(201).json(candidate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
// POST a new candidate
router.post('/', async (req, res) => {
  const { jobId, applicantId, applicantEmail, applicantName, resumeId } = req.body;

  if (!jobId || !applicantId || !applicantEmail || !applicantName) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  const newCandidate = new Candidate({
    jobId,
    applicantId,
    applicantEmail,
    applicantName,
    resumeId,
    status: 'applied'
  });

  try {
    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error saving candidate" });
  }
});

// PATCH update candidate status/notes
router.patch('/:id', async (req, res) => {
  const { status, notes, matchScore } = req.body;

  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        notes,
        matchScore,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(updatedCandidate);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating candidate" });
  }
});

export default router;