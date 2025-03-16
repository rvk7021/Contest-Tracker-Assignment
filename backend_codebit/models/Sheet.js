const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
});

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },
  problems: [ProblemSchema]
});

const SheetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  groups: {
    type: [GroupSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sheet', SheetSchema);
