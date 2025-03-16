const Contest=require('../models/Contest');
const cron=require('node-cron');
require('dotenv').config();
const axios = require('axios');
 const codeforcesUrl = 'https://codeforces.com/api/contest.list';
 const codechefUrl='https://www.codechef.com/api/list/contests/all';
 
let cronJob;

const fetchUpcomingContest = async () => {
    try {
     
        const codeforcesResponse = await axios.get(codeforcesUrl);
        const codechefResponse = await axios.get(codechefUrl);
        const contests = await Contest.find({});
        
        const codeforcesContests = codeforcesResponse.data.result;
        const upcomingCodeforcesContests = codeforcesContests.filter(contest => contest.phase === 'BEFORE' || contest.phase === 'CODING');
        
        const upcomingCodechefContests = codechefResponse.data.future_contests;
        const upcomingContestNamesForces = new Set(upcomingCodeforcesContests.map((c) => c.name));
        const upcomingContestNamesChef = new Set(upcomingCodechefContests.map((c) => c.contest_name));
        
        for (const contest of contests) {
            if (contest.platform === 'Codeforces') {
                if (upcomingContestNamesForces.has(contest.name)) {
                    upcomingContestNamesForces.delete(contest.name); 
                } else {
                    await Contest.findByIdAndDelete(contest._id);
                }
            }
        
            if (contest.platform === 'Codechef') {
                if (upcomingContestNamesChef.has(contest.name)) {
                    upcomingContestNamesChef.delete(contest.name);
                } else {
                    await Contest.findByIdAndDelete(contest._id);
                }
            }
        }
        
      
    

        for (const contest of upcomingCodeforcesContests) {

 if(upcomingContestNamesForces.has(contest.name)){
    contest.durationSeconds = contest.durationSeconds/(60*60);
    await Contest.create({
        name: contest.name,
        description: "All the best for the contest",
        startTime: formatStartDateToIST(contest.startTimeSeconds),
        duration: (contest.durationSeconds) ,
        link: "https://codeforces.com/contests",
        platform: 'Codeforces'
    });
   
 }

        }

    
        for (const contest of upcomingCodechefContests) {

if(upcomingContestNamesChef.has(contest.contest_name)){
    await Contest.create({
        name: contest.contest_name,
        description: "All the best for the contest",
        startTime: contest.contest_start_date,
        duration: contest.contest_duration / 60,
        link: "https://www.codechef.com/contests",
        platform: 'Codechef'
    });
}
        }

    
    } catch (error) {
        console.error('Error fetching contests:', error);
        throw error;
    }
};

const scheduleFetch = () => {
    if (cronJob) {
        cronJob.stop();
    }
     cronJob = cron.schedule('*/4 * * * *', fetchUpcomingContest);

  
};

scheduleFetch();

exports.fetchUpcomingContestAPI = async (req, res) => {
    try {
        await fetchUpcomingContest();
        scheduleFetch(); 
        return res.status(200).json({
            success: true,
            message: "Contests fetched successfully",
            nextFetchIn: "15 minutes"
        });
    } catch (error) {
       
        return res.status(500).json({
            success: false,
            message: 'Error fetching contests',
            error: error.message
        });
    }
};
function formatStartDateToIST(input) {
    // Determine if the input is a Date object or a timestamp in seconds
    let date;
    if (input instanceof Date) {
        date = input;
    } else if (typeof input === "number") {
        // For Codeforces contests, the timestamp is in seconds
        date = new Date(input * 1000);
    } else {
        // Fallback if the input is a valid date string already
        date = new Date(input);
    }

    // Format date components with leading zeros if necessary
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Return a valid ISO 8601 datetime string using 'T' as the separator.
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


exports.getAllContests=async(req,res)=>{
    try {
      await  fetchUpcomingContest();
        const contests = await Contest.find({}).sort({ startTime: 1 });
        return res.status(200).json({
            success: true,
            message: "Contests fetched successfully",
            contests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching contests", 
            error: error.message
        });
    }
}
