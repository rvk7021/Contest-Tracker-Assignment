const express = require('express');
const app = express();
const User = require('../models/User'); // Ensure correct import
require('dotenv').config();

exports.Leaderboard = async function (req, res) {
    try {
        // Fetch all users, selecting only required fields
        const leaderboard = await User.find({}, 'userName firstName lastName problemSolved college')
            .sort({ problemsSolved: -1 });

        // If no users found, return error response
        if (leaderboard.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found for the leaderboard.",
            });
        }

        // Return success response with leaderboard data
        return res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully.",
            leaderboard
        });

    } catch (error) {
        // Handle any errors
        return res.status(500).json({
            success: false,
            message: "Error fetching leaderboard.",
            error: error.message
        });
    }
};
