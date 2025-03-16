const mongoose = require("mongoose");
const cron = require("node-cron");
const User = require("../models/User");
const Contest = require("../models/Contest");
const mailSender = require("../Utils/mailSender");
const { contestEmail } = require("../mail/template");

const sendContestEmails = async () => {
  const users = await User.find({});
  const upcomingContests = await Contest.find({});

  if (upcomingContests.length === 0) {
  
    return;
  }

  for (const user of users) {
    const contestsToNotify = upcomingContests.filter(
      (contest) => !contest.notifiedUsers.registeredTime.includes(user.email)
    );

    if (contestsToNotify.length === 0) continue;

    const emailMessage = contestEmail(user.userName, contestsToNotify);

    try {
      await mailSender(user.email, "Upcoming Contests Notification", emailMessage);

      await Contest.updateMany(
        { _id: { $in: contestsToNotify.map((contest) => contest._id) } },
        { $push: { "notifiedUsers.registeredTime": user.email } }
      );

    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
    }
  }
};

const scheduleEmailTask = async () => {
  console.log("Email task scheduled");
  await sendContestEmails();
  cron.schedule("0 */12 * * *", sendContestEmails);
};

exports.scheduleEmailTask = scheduleEmailTask;
