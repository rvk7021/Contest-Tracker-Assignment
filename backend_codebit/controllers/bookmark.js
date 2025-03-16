const Bookmark = require('../models/Contestbookmark');
const Contest = require('../models/Contest');
const PastContest = require('../models/PastContest');

exports.AddBookmark = async (req, res) => {
    const userId = req.user.id; 
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { contestTitle } = req.body; 
    console.log('Contest Title:', contestTitle); 
    contestTitle.trim(); 

    try {
        let contest = await Contest.findOne({ name: contestTitle });

        if (!contest) {
            contest = await PastContest.findOne({ title: contestTitle });
        }

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const existingBookmark = await Bookmark.findOne({ user: userId });
        if (existingBookmark) {
            if (existingBookmark.contestTitles.includes(contestTitle)) {
                return res.status(400).json({ message: 'Contest already bookmarked' });
            } else {
                existingBookmark.contestTitles.push(contestTitle);
                await existingBookmark.save();
                return res.status(201).json({ message: 'Contest bookmarked successfully', bookmark: existingBookmark });
            }
        }

        const bookmark = new Bookmark({
            user: userId,
            contestTitles: [contestTitle],
        });

        await bookmark.save();

        return res.status(201).json({ message: 'Contest bookmarked successfully', bookmark });
    } catch (error) {
        console.error('Error adding bookmark:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.DeleteBookmark = async (req, res) => {
    let userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { contestTitle } = req.body; 
    contestTitle.trim(); 

    try {
        const existingBookmark = await Bookmark.findOne({ user: userId });

        if (!existingBookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        if (!existingBookmark.contestTitles.includes(contestTitle)) {
            return res.status(400).json({ message: 'Contest not bookmarked' });
        }

        existingBookmark.contestTitles = existingBookmark.contestTitles.filter(title => title !== contestTitle);
        await existingBookmark.save();

        return res.status(200).json({ message: 'Contest removed from bookmarks successfully', bookmark: existingBookmark });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.GetBookmarks = async (req, res) => {
    let userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const bookmark = await Bookmark.findOne({ user: userId });

        if (!bookmark) {
            return res.status(404).json({ message: 'No bookmarks found' });
        }

        const contestDetails = [];

        // Iterate over each bookmarked contest
        for (let i = 0; i < bookmark.contestTitles.length; i++) {
            // Look for the contest in the Contest collection (future contests)
            let contest = await Contest.findOne({ name: bookmark.contestTitles[i] });

            // If not found in future contests, look in PastContest collection (past contests)
            if (!contest) {
                contest = await PastContest.findOne({ title: bookmark.contestTitles[i] });
            }

            if (contest) {
                // Format the contest data
                const contestData = {
                    title: contest.name || contest.title,  // use the name for future contests and title for past contests
                    platform: contest.platform,
                    date: contest.startTime || contest.start_time,  // handle different field names
                    duration: contest.duration || contest.duration_seconds,  // duration for past and future contests
                    contestLink: contest.link || contest.contest_link,  // contest link
                    solutionLink: contest.solution_link || ""  // solution link, if available
                };

                contestDetails.push(contestData);
            }
        }

        // Return all the contest details, from both future and past contests
        return res.status(200).json({ message: 'Bookmarks retrieved successfully', bookmarks: contestDetails });

    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
