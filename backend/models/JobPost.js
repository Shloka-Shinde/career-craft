import mongoose from 'mongoose';

const jobPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  salary: {
    type: Number
  },
  contactEmail: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  skills: {
    type: [String],  // Define skills as an array of strings
    default: [], // Set a default empty array if no skills are provided
    required: false // It's not required, so it can be left empty
  }
});

export default mongoose.model('JobPost', jobPostSchema);