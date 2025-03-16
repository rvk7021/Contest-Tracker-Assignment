const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  description: { type: String, required: true }, 
  startTime: { type: String, required: true }, 
  duration: { type: Number, required: true }, 
  link: { type: String, required: true }, 
  platform: { type: String, required: true },
  notifiedUsers: { 
    registeredTime: { type: [String], default: [] },

  }
});
module.exports = mongoose.model('Contest', ContestSchema);
