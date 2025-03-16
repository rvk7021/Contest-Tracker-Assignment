const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: { type: String, required: true }, 
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  tags: { type: [String], required: true }, 
  inputFormat: { type: String }, 
  outputFormat: { type: String }, 
  examples: [
    {
      input: { type: String },
      output: { type: String }, 
      explanation: { type: String }
    }
  ],
  constraints: { type: String }, 
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type:  Date, default: Date.now } 
});

module.exports = mongoose.model('Problem', ProblemSchema);
