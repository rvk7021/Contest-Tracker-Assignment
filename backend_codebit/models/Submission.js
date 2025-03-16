const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  code: { type: String, required: true }, 
  language: { type: String, default: "CPP" }, 
  status: { 
    type: String, 
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'], 
    required: true 
  },
  runtime: { type: Number  }, 
  memory: { type: Number}, 
  submittedAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Submission', SubmissionSchema);
