const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
dotenv.config();
exports.auth = async (req, res, next) => {
	try {

	  const token =req.body.token || req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
	  if (!token) {
		return res.status(401).json({ success: false, message: "Token Missing" });
	  }
  
	  try {
	
		const decode = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decode; 
	
		next();
	  } catch (error) {
		return res.status(401).json({ success: false, message: "Invalid Token" });
	  }
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: "Something Went Wrong While Validating the Token",
	  });
	}
  };