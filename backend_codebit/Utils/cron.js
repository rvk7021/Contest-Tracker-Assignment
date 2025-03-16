const https = require("https");
const cron = require("node-cron");

const URL = "https://codebit-lrzz.onrender.com";

const job = cron.schedule("*/5 * * * *", function () {
	https
		.get(URL, (res) => {
			if (res.statusCode === 200) {
				console.log("GET request sent successfully");
			} else {
				console.log("GET request failed", res.statusCode);
			}
		})
		.on("error", (e) => {
			console.error("Error while sending request", e);
		});
}, { scheduled: true });

module.exports = job;
