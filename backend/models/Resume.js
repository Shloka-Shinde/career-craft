import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Untitled Resume',
    trim: true
  },
  is_primary: {
    type: Boolean,
    default: false
  },
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  resume_data: {
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      title: { type: String, default: '' },
      summary: { type: String, default: '' }
    },
    experience: [{
      company: { type: String, default: '' },
      title: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      description: { type: String, default: '' }
    }],
    education: [{
      institution: { type: String, default: '' },
      degree: { type: String, default: '' },
      year: { type: String, default: '' },
      description: { type: String, default: '' }
    }],
    skills: [{ type: String, default: '' }]
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  strict: false // Allow additional fields
});

export default mongoose.model('Resume', resumeSchema);