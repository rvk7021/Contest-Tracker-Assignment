const fetch = require('node-fetch');
require('dotenv').config();
const cron = require('node-cron');

const PastContest = require('../models/PastContest');
const API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = process.env.PLAYLIST_ID;

const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

const extractContestName = (title) => {
    const match = title.match(/^(.*?)(?=\s*\|)/);
    return match ? match[1].trim() : title;  
};

// Function to normalize the title for better matching
const normalizeTitle = (title) => {
    return title
        .toLowerCase() 
        .replace(/\s+/g, ' ') 
        .replace(/\./g, '') 
        .replace(/div\s*(\d+)/i, 'div$1') // Normalize "Div 3" and "Div. 3" to "div3"
        .trim();
};

async function getPlaylistVideoTitles() {
    try {
        let nextPageToken = '';
        let videoData = [];

        do {
            const response = await fetch(`${YOUTUBE_API_URL}&pageToken=${nextPageToken}`);
            const data = await response.json();

            if (!data.items) {
                console.error("Error: No videos found or invalid response.");
                return [];
            }

            data.items.forEach(item => {
                const contestName = extractContestName(item.snippet.title);
                videoData.push({
                    title: normalizeTitle(contestName), // Normalize title for better matching
                    url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
                });
            });

            nextPageToken = data.nextPageToken || '';

        } while (nextPageToken);

        return videoData;
    } catch (error) {
        console.error("Error fetching video titles:", error);
        return [];
    }
}

exports.getvideo = async (req, res) => {
    const videos = await getPlaylistVideoTitles();
    console.log("Fetched videos:", videos);
    if (!videos || videos.length === 0) {
        return res.status(500).json({ message: "Failed to fetch YouTube videos" });
    }

    try {
        const contestData = await PastContest.find({}).sort({ start_time: -1 });
        const contestNames = contestData.map(contest => normalizeTitle(contest.title)); // Normalize contest titles

        const filteredVideos = videos.filter(video => {
            return contestNames.some(name => {
                return video.title.includes(name);
            });
        });

        if (filteredVideos.length > 0) {
            for (let video of filteredVideos) {
                for (let contest of contestData) {
                    if (normalizeTitle(contest.title) === video.title && !contest.solution_link) {
                        contest.solution_link = video.url;
                        await contest.save();
                        console.log(`Updated solution link for contest: ${contest.title}`);
                    }
                }
            }
            res.status(200).json(filteredVideos);
        } else {
            res.status(404).json({ message: "No matching videos found" });
        }

    } catch (error) {
        console.error("Error processing contest data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// Function to fetch YouTube Video manually
const mongoose = require('mongoose');

exports.Contest_Solution = async (req, res) => {
    const contestId = req.body.id;  
    const videoUrl = req.body.url;  

    try {
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: "Invalid contest ID" });
        }

        // Find the contest by ObjectId
        const getContest = await PastContest.findById(contestId);

        if (getContest) {
            getContest.solution_link = videoUrl; 
            await getContest.save(); 

            console.log(` Updated solution link for contest: ${getContest.title}`);
            return res.status(200).json({ message: "Solution link updated successfully", contest: getContest });
        }

        console.log(`Contest not found for ID: ${contestId}`);
        return res.status(404).json({ message: "Contest not found" });

    } catch (error) {
        console.error(" Error updating solution link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
