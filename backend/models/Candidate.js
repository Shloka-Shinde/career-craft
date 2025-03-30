import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicantEmail: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  applicantName: {
    type: String,
    required: true,
    trim: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'interviewed', 'hired', 'rejected'],
    default: 'applied'
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String,
    default: ''
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
  }
});

export default mongoose.model('Candidate', candidateSchema);