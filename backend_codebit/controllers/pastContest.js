const axios = require('axios');
const PastContest = require('../models/PastContest');
const cron = require('node-cron');
require('dotenv').config();

const codeforcesUrl = 'https://codeforces.com/api/contest.list';
const codechefUrl = 'https://www.codechef.com/api/list/contests/all';
let cronJob;
// Contest Link base URLs
const contestlink = 'http://codeforces.com/contest/';
const contestlinkchef = 'http://codechef.com/';

// Function to fetch past contests from Codeforces (last 5 contests or response length)
const fetchCodeforcesContests = async () => {
    console.log("Fetching past contests from Codeforces API");
    try {
        const response = await axios.get(codeforcesUrl);
        if (response.data.status !== 'OK') return [];

        const pastContests = response.data.result
            .filter(contest => contest.phase === 'FINISHED')
            .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds) // Sort by start time (latest first)
            .slice(0, Math.min(5, response.data.result.length)) // Limit to 5 or response length
            .map(contest => ({
                title: contest.name,
                platform: 'Codeforces',
                frozen: contest.frozen,
                start_time: new Date(contest.startTimeSeconds * 1000),
                end_time: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
                duration_seconds: contest.durationSeconds,
                distinct_users: 0, // Not available in Codeforces API
                solution_link: "",
                contest_link: `${contestlink}${contest.id}`  // Adding contest link
            }));

        return pastContests;
    } catch (error) {
        return [];
    }
};

// Function to fetch past contests from CodeChef (last 5 contests or response length)
const fetchCodeChefContests = async () => {
    console.log("Fetching past contests from CodeChef API");
    try {
        const response = await axios.get(codechefUrl);
        if (response.data.status !== 'success') return [];

        const pastContests = response.data.past_contests
            .sort((a, b) => new Date(b.contest_start_date_iso) - new Date(a.contest_start_date_iso)) // Sort by start time (latest first)
            .slice(0, Math.min(5, response.data.past_contests.length)) // Limit to 5 or response length
            .map(contest => ({
                title: contest.contest_name,
                platform: 'CodeChef',
                frozen: false,
                start_time: new Date(contest.contest_start_date_iso),
                end_time: new Date(contest.contest_end_date_iso),
                duration_seconds: parseInt(contest.contest_duration, 10) * 60, // Convert minutes to seconds
                distinct_users: contest.distinct_users || 0,
                solution_link: "",
                contest_link: `${contestlinkchef}${contest.contest_code}`  // Adding contest link
            }));

        return pastContests;
    } catch (error) {
        return [];
    }
};



// Function to update past contests in MongoDB (only if they don’t exist)
const updatePastContests = async (req, res) => {
    try {
        const [codeforcesContests, codechefContests] = await Promise.all([
            fetchCodeforcesContests(),
            fetchCodeChefContests()
        ]);

        const allContests = [...codeforcesContests, ...codechefContests];

        for (const contest of allContests) {
            const exists = await PastContest.exists({ title: contest.title, platform: contest.platform });

            if (!exists) {
                await PastContest.create(contest);
            }
        }

        // Return success response if req and res are provided
        if (req && res) {
            return res.status(200).json({ status: "success", message: "Past contests updated successfully" });
        }
    } catch (error) {
        // Handle errors silently
        if (req && res) {
            return res.status(500).json({ error: error.message });
        }
    }
};

const scheduleFetch = () => {
    if (cronJob) {
        cronJob.stop();
    }
    console.log("Scheduling past contest fetch every 1 minute");
    cronJob = cron.schedule('*/1 * * * *', updatePastContests);
};

scheduleFetch();


// Get all past contests from MongoDB
const getPastContests = async (req, res) => {
    try {
        const contests = await PastContest.find().sort({ start_time: -1 }); // No limit here
        res.json({ status: "success", past_contests: contests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { updatePastContests, getPastContests };
