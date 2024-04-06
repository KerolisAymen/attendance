const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const qr = require("qrcode");
const axios = require("axios");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const ejs = require("ejs");
const fs = require('fs');
const cookieParser = require("cookie-parser") ; 
const jwt = require("jsonwebtoken")
const secretKey ="kero" ;

// const googleStorage = require('@google-cloud/storage');
// var serviceAccount = require("./serviceAccountKey.json");

// var admin = require("firebase-admin");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: "gs://attendance-417319.appspot.com"
// });

// var bucket = admin.storage().bucket();

// bucket.upload(path.join(__dirname,"/beeb.mp3"))

// Set the view engine to use EJS

app.set("view engine", "ejs");

// Set the directory for EJS templates (optional if you're using a single folder)
app.set("views", path.join(__dirname,"views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

const {Student , Meeting} = require("./model/User")
const {register,adminAuth,userAuth } = require("./Auth/auth.js");


//  (async()=>{
//   const temp = await Student.find({}); 
//   console.log(temp[5]);
// }) ()


app.get("/", adminAuth ,  (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/registration", adminAuth,(req, res) => {
  res.sendFile(path.join(__dirname, "registration.html"));
});

app.post("/submit",upload.single("avatar"),
  async (req, res, next) => {
    const username = req.body.username;

    const grade = req.body.grade;
    let newuserid = Math.floor(Math.random() * 99999 + 10000);
    let newStudent = new Student({
      ID: newuserid,
      name: username,
      profilepic: req.body.picurl,
      grade: grade,
    });

    if ((await Student.findOne({ name: req.body.username })) != undefined) {
      console.log(await Student.findOne({ name: req.body.username }));
      res.send("<h1>تم التسجيل من قبل</h1>");
    } else {
      newStudent
        .save()
        .then((s) => {
          console.log(s);
          res.send(
            `<h1>تم التسجيل بنجاح</h1> <h2>your id :</h2><h2> ${newuserid} </h2>`
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
);

app.get("/attendanceReview",userAuth, async (req, res) => {

  let ID ; 
  const token = req.cookies.token ; 
  if (!token) return ; 
  jwt.verify(token, "kero" , (err ,decodedToken)=>{
    ID = decodedToken.ID  ; 
  })
  const profileData = await Student.findOne({ ID: ID}).populate(
    "meetings.meeting"
  );


  if (profileData != undefined) {
    const allstudents = await Student.find({
      grade: profileData.grade,
    }).populate("meetings.meeting");
    const grapharray = [];
    await allstudents.forEach(async (student) => {
      grapharray.push([student.name, await student.gettotalbonus()]);
    });

    let qrsrc;
    const apiUrl = "https://api.qrserver.com/v1/create-qr-code/";
    const params = {
      size: "300x300",
      data: ID,
    };

    await axios
      .get(apiUrl, { params })
      .then((response) => {
        console.log("QR code URL:", response.request.res.responseUrl);
        qrsrc = response.request.res.responseUrl;
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });

    console.log(profileData.meetings);
    const profileData2 = {
      ID: profileData.ID,
      name: profileData.name,
      grade: profileData.grade,
      meetingsAttended: profileData.meetings.length,
      meetings: profileData.meetings,
      profilepic: profileData.profilepic,
      imgUrl: qrsrc,
      graph: grapharray,
    };

    JSON.stringify(profileData2);
    console.log(profileData2);
    res.render("profile", { profileData2 });
  } else {
    res.send("<h1>this user not found</h1>");
  }
});

app.get("/attendanceReview/:ID",adminAuth, async (req, res) => {

  let ID = req.params.ID ; 
  console.log(ID); 
  const profileData = await Student.findOne({ID: ID}).populate(
    "meetings.meeting"
  );


  if (profileData != undefined) {
    const allstudents = await Student.find({
      grade: profileData.grade,
    }).populate("meetings.meeting");
    const grapharray = [];
    await allstudents.forEach(async (student) => {
      grapharray.push([student.name, await student.gettotalbonus()]);
    });

    let qrsrc;
    const apiUrl = "https://api.qrserver.com/v1/create-qr-code/";
    const params = {
      size: "300x300",
      data: ID,
    };

    await axios
      .get(apiUrl, { params })
      .then((response) => {
        console.log("QR code URL:", response.request.res.responseUrl);
        qrsrc = response.request.res.responseUrl;
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });

    console.log(profileData.meetings);
    const profileData2 = {
      ID: profileData.ID,
      name: profileData.name,
      grade: profileData.grade,
      meetingsAttended: profileData.meetings.length,
      meetings: profileData.meetings,
      profilepic: profileData.profilepic,
      imgUrl: qrsrc,
      graph: grapharray,
    };

    JSON.stringify(profileData2);
    console.log(profileData2);
    res.render("profile", { profileData2 });
  } else {
    res.send("<h1>this user not found</h1>");
  }
});

app.route("/qrpage").get(adminAuth,(req,res)=>{
  res.sendFile(path.join(__dirname, "qrpage.html"));
})
app.post("/qrcodepage", adminAuth, async (req, res) => {
  console.log(req.body);
  const name = await Student.findOne({ ID: req.body.decodeText });
  const meeting1 = await Meeting.findById(req.body.selectedValue);
  const newdata = await {
    meeting: meeting1.id,
  };
  const arr = await name.meetings.filter(
    (object) => object.meeting.ObjectId === meeting1.id
  );
  // console.log(name);
  // console.log(name.meetings[0].meeting.toString());
  // console.log(meeting1.id);
  // console.log(arr);
  if (
    (await name.meetings.filter(
      (object) => object.meeting.toString() === meeting1.id
    ).length) == 0
  ) {
    // use this here
    await name.meetings.push(newdata);
    await name
      .save()
      .then((saveddata) => {
        res.send({ message: " saved", success: true });
      })
      .catch((err) => {
        res.send({ message: "error saving" });
      });
  } else {
    res.send({ message: "saved before" });
  }
});

app.get("/dashboard",adminAuth, async (req, res) => {
  const users = await Student.find({}); //.populate("meetings.meeting");
  // console.log(users);
  res.render("dashboard", { users });
});

app.get("/addnewmeeting" ,adminAuth, (req,res)=>{
  res.sendFile(path.join(__dirname, "addnewmeeting.html"));
})
app.get("/getmeetings",adminAuth, async (req, res) => {
  res.send(await Meeting.find({}));
});
app.post("/putmeetings", adminAuth, async (req, res) => {
  console.log(req.body);
  const newmeeting = new Meeting({
    name: req.body.type,
    date: req.body.date,
  });
  newmeeting.save().then((data) => {
    res.send("added successfully");
  });
});

app.route("/login").get((req,res)=>{
  res.sendFile(path.join(__dirname,"login.html"))
}).post( async (req, res) => {
  const username= req.body.username;
  // console.log(username); 
 const user = await Student.findOne({ID : username})
 console.log(user); 
  if (user) {
    // Generate token
    const token = jwt.sign({ ID: user.ID , role: user.role}, secretKey);
    // res.cookie('token', token, { httpOnly: false });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }

});

app.get("/print",adminAuth, async (req, res) => {
  const users = await Student.find({}); //.populate("meetings.meeting");
  
  res.render("print", { users });
});
mongoose
  .connect(
    "mongodb+srv://Kerolis456:afDaYNP5YvABh69L@nodejsproject.jyjtxsy.mongodb.net/?retryWrites=true&w=majority&appName=nodejsProject"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
