const mongoose = require('mongoose');

const pastContestSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    platform: { type: String, enum: ['Codeforces', 'CodeChef'], required: true },
    frozen: { type: Boolean, default: false },  
    start_time: { type: Date, required: true },  
    end_time: { type: Date, required: true },  
    duration_seconds: { type: Number, required: true },  
    distinct_users: { type: Number, default: 0 },  
    solution_link: { type: String, default: "" },
    contest_link: { type: String, default: "" }, 
}, { timestamps: true });

const PastContest = mongoose.model('PastContest', pastContestSchema);
module.exports = PastContest;
