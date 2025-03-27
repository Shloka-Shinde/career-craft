import express from 'express';
import Resume from '../models/Resume.js'; // Ensure the model is correct

const router = express.Router();

// GET all resumes
router.get('/', async (req, res) => {
  try {
    // Retrieve all resumes from the database
    const resumes = await Resume.find();

    // Send the list of resumes as a JSON response
    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching resumes" });  // Internal server error if database operation fails
  }
});

// POST a new resume
router.post('/', async (req, res) => {
  // Destructure and extract resume data from the body of the request
  const { name, is_primary, template_id, resume_data } = req.body;

  // Validation for required fields can be added here if needed
  if (!name || !resume_data) {
    return res.status(400).json({ message: "Name and resume data are required" });
  }

  // Create a new resume instance with the request body data
  const newResume = new Resume({
    name,
    is_primary,
    template_id,
    resume_data,
  });

  try {
    // Save the new resume to the database
    await newResume.save();

    // Return the created resume as a response
    res.status(201).json(newResume);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error saving resume" });  // Bad request if saving the resume fails
  }
});

export default router;