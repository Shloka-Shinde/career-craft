// models/JobPost.js
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
  
});

export default mongoose.model('JobPost', jobPostSchema);