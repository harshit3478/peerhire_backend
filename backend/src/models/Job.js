import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', JobSchema);

export default Job;