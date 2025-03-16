const express=require('express');
const router=express.Router();
const {addProblem,searchproblem,search,searchProblemBySubstring,AllProblems}=require('../controllers/problem');
const {checkProblem}=require('../middleware/problem')
const {login,signup}=require('../controllers/auth'); 
const { addTestCase } = require('../controllers/testCases');
const {fetchUpcomingContestAPI,getAllContests}=require('../controllers/contest');
const {executeCode}=require('../controllers/compiler')
const {Leaderboard}=require('../controllers/leaderBoard');
const {auth }=require('../middleware/auth');
const {getUser,logout,updateProfile,addSocialMediaAccount,addGithubProfile,getCodingProfile,removeCodingProfile}=require('../controllers/auth');
const {submitCode,getUserSubmissions,runCode}=require('../controllers/submission');
const {addPost,getLatestPosts,likeUnlikePost,deletePost,getFeedPosts,getUserPosts,addComment,getComments}=require('../controllers/post');
const {fetchCodeChefRating,fetchCodeforcesRating,fetchLeetCodeRating}=require('../controllers/rating');
const { CheckSheet, CreateGroup, DeleteGroup, DeleteSheet,ShowAllGroups,CreateSheet, AddProblemToGroup, RemoveProblemFromGroup,ShowProblemsInGroup } = require('../controllers/userSheet');
const {updatePastContests,getPastContests}=require('../controllers/pastContest');
const {AddBookmark,DeleteBookmark,GetBookmarks}=require('../controllers/bookmark');
const {getvideo,Contest_Solution}=require('../controllers/getYouTube');
// auth routes
router.post('/login',login);
router.post('/signup',signup);
router.post('/logout', auth, logout);
router.get('/getUser',auth,getUser);
router.post('/uploadProfile',auth,updateProfile);
router.post('/addsocialmedia',auth,addSocialMediaAccount);
router.get('/fetchcodeforcesrating/:username',auth,fetchCodeforcesRating);
router.get('/fetchcodechefrating/:username',auth,fetchCodeChefRating);
router.get('/fetchleetcoderating/:username',auth,fetchLeetCodeRating);
router.post('/getcodingprofile',auth,getCodingProfile);
router.post('/addgithub',auth,addGithubProfile);
router.delete('/removecodingprofile',auth,removeCodingProfile);
// problem routes
router.post('/problems',checkProblem,addProblem);
router.get('/problems/search',searchproblem);
router.get('/problems/searchbyn',search);
router.get('/problems/searchbys',searchProblemBySubstring);
router.post('/problems/addTest',addTestCase);
router.get('/problems',AllProblems);
// contest routes
router.post('/contest',fetchUpcomingContestAPI);
router.get('/contests',auth,getAllContests);
router.post('/execute',executeCode);
router.post('/submit',auth,submitCode);
router.post('/run',runCode);
router.post('/submissions',auth,getUserSubmissions);

// past contest routes
router.get('/pastcontest',updatePastContests);
router.get('/pastcontest/get',getPastContests);
// bookmark routes
router.post('/bookmark',auth,AddBookmark);
router.delete('/bookmark',auth,DeleteBookmark);
router.get('/bookmark',auth,GetBookmarks);
// leaderboard routes
router.get('/leaderboard',Leaderboard);
// user sheet routes
router.get('/sheet/check',auth,CheckSheet);
router.post('/sheet/check',auth,CreateSheet);
router.delete('/sheet/check',auth,DeleteSheet);
router.post('/sheet/group',auth,CreateGroup);
router.delete('/sheet/group',auth,DeleteGroup);
router.get('/sheet/groups',auth,ShowAllGroups);
router.post('/sheet/group/problem',auth,AddProblemToGroup);
router.get('/sheet/group/problems',auth,ShowProblemsInGroup);
router.delete('/sheet/group/problem',auth,RemoveProblemFromGroup);
// user routes
// youtube routes
router.get('/addsolution',getvideo);
router.post('/solution/update',Contest_Solution);
//post routes
router.post('/post',auth,addPost);
router.post('/post/like/:postId',auth,likeUnlikePost);
router.delete('/post/:postId',auth,deletePost);
router.get('/getposts',getFeedPosts);
router.get('/post/user/:userName',auth,getUserPosts);
router.post('/post/comment/:postId',auth,addComment);
router.get('/post/comment/:postId',auth,getComments);
router.get('/post/home/feed',getLatestPosts);
module.exports=router;
