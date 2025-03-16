const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "interviewer"],
      required: false,
    },
    topics: [
      {
        topicName: { type: String, required: true },
        problems: [
          {
            problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
          },
        ],
      },
    ],
    SubmissionCount: {
      type: Number,
      default: 0,
    },
    problemSolved: {
      type: Number,
      default: 0,
    },
    Easy: {
      type: Number,
      default: 0,
    },
    Medium: {
      type: Number,
      default: 0,
    },
    Hard: {
      type: Number,
      default: 0,
    },
    activeDays: [{ type: String }],
    githubProfile:{
      type:String,
      default:null
    },
    bio: {
      type: String
    },
    token: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    codingProfile: {
      LeetCode: { type: String, default: null },
      Codeforces: { type: String, default: null },
      CodeChef: { type: String, default: null }
    },
    SocialMedia: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      instagram: { type: String, default: null }
    },
    
    Country:{
        type:String,
        default:"India"
    },

  }
);

module.exports = mongoose.model("user", userSchema)