
const mongoose = require("mongoose"); 
const {Student , Meeting} = require("../model/User"); 
const jwt = require("jsonwebtoken")
const jwtSecret ="kero" ;
exports.register = async (req, res, next) => {
    const { username, password } = req.body
    if (password.length < 6) {
      return res.status(400).json({ message: "Password less than 6 characters" })
    }
    try {
      await User.create({
        username,
        password,
      }).then(user =>
        res.status(200).json({
          message: "User successfully created",
          user,
        })
      )
    } catch (err) {
      res.status(401).json({
        message: "User not successful created",
        error: error.mesage,
      })
    }
}






exports.adminAuth = (req, res, next) => {
  const token = req.cookies.token
  // console.log(req.cookies.token);
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {

      if(decodedToken.role==="admin"){
        next();
      }
      else{
        res.redirect('/attendanceReview')
      }
    })
  } else {
    res.redirect('/login');
    // return res
    //   .status(401)
    //   .json({ message: "Not authorized, token not available" })
  }
}



exports.userAuth = (req, res, next) => {
  const token = req.cookies.token
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        if (decodedToken.role == "basic" || decodedToken.role == "admin") {
          next()
          
        } else {
          res.redirect('/login');
        }
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}


