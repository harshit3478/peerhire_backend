import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  timeline: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Bid = mongoose.model('Bid', BidSchema);

export default Bid;