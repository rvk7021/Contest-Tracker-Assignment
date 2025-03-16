const express = require('express');
const cors = require('cors');
const app = express();
const database = require('./config/database');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const userRoutes = require('./routes/user');
const {scheduleEmailTask}=require('./controllers/sendContestMail');
 const job = require('./Utils/cron');
// const path = require('path');
dotenv.config();
 database.connect();
job.start();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true ,
}));
// const __dirname = path.resolve();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.send("API is working!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is started on http://localhost:${PORT}`);
});
// app.use(express.static(path.join(__dirname, 'frontend_codebit/dist')))

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'frontend_codebit','dist','index.html'))
// })
setTimeout(() => {
    scheduleEmailTask();
}, 10000);
