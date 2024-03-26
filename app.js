const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const qr = require("qrcode");
const axios = require("axios");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const ejs = require('ejs');

// Set the view engine to use EJS
app.set("view engine", "ejs");

// Set the directory for EJS templates (optional if you're using a single folder)
app.set("views", __dirname);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());
const meetingSchema = new mongoose.Schema({
  name: String,
  date: Date,
});

const studentSchema = new mongoose.Schema
({
    ID : String,
    name: String,
    grade: Number,
    profilepic: String,
    meetings: [
      {
        _id: false ,
        meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
        bonusandminus: [Number], // Array of strings for bonus and minus data
      },
    ],
});


studentSchema.methods.gettotalbonus = async function(){
  let bonus = 0; 
  this.meetings.forEach(element => {
    if(element.meeting.name== "تسبحة")
    bonus+= 50 ; 
  else
  bonus+=30;
  });
  console.log(bonus); 
  return bonus;
}

const Student = mongoose.model("Student", studentSchema);
const Meeting = mongoose.model("Meeting", meetingSchema);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/registration", (req, res) => {
  res.sendFile(path.join(__dirname, "registration.html"));
});

app.post("/registration.html",upload.single("avatar"),
  async (req, res, next) => {
    const username = req.body.username;
    // console.log(req.body);

    const grade = req.body.grade;
    let newuserid = Math.floor((Math.random() * 99999) + 10000)
    let newStudent = new Student({
      ID : newuserid , 
      name: username,
      profilepic: req.file.path,
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
          res.send(`<h1>تم التسجيل بنجاح</h1> <h2>your id :</h2><h2> ${newuserid} </h2>`);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
);

app.get("/attendanceReview/:ID", async (req, res) => {
  const profileData = await Student.findOne({ ID: req.params.ID }).populate("meetings.meeting");
  const allstudents = await Student.find({grade :profileData.grade}).populate("meetings.meeting");
  const grapharray = []; 
  await allstudents.forEach(async student => {
   
    grapharray.push([student.name,await student.gettotalbonus()]) ; 
  });
  console.log(grapharray);
  if (profileData != undefined) {
    let qrsrc;
    const apiUrl = "https://api.qrserver.com/v1/create-qr-code/";
    const params = {
      size: "300x300",
      data: req.params.ID,
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
      ID : profileData.ID,
      name: profileData.name,
      grade: profileData.grade,
      meetingsAttended: profileData.meetings.length,
      meetings: profileData.meetings,
      profilepic: profileData.profilepic,
      imgUrl: qrsrc,
      graph : grapharray
    };

    JSON.stringify(profileData2);
    console.log(profileData2);
    res.render("profile", { profileData2 });
  } else {
    res.send("<h1>this user not found</h1>");
  }
});

app.post("/qrcodepage", async (req, res) => {
  console.log(req.body);
  const name = await Student.findOne({ ID: req.body.decodeText });
  const meeting1 = await Meeting.findById(req.body.selectedValue);
  const newdata = await {
    meeting: meeting1.id,
  };
  const arr = await name.meetings.filter((object) => object.meeting.ObjectId === meeting1.id);
  // console.log(name); 
  // console.log(name.meetings[0].meeting.toString());
  // console.log(meeting1.id);
  // console.log(arr); 
  if (await name.meetings.filter((object) => object.meeting.toString() === meeting1.id).length == 0) { // use this here
    await name.meetings.push(newdata);
    await name.save()
      .then((saveddata) => {
        res.send({ message:" saved", success: true });
      })
      .catch((err) => {
        res.send({message:"error saving"})
      });
  } else {
    res.send({ message:"saved before" });
  }
});

app.get("/dashboard", async (req, res) => {
  const users = await Student.find({}) //.populate("meetings.meeting");
  console.log(users);
  res.render("dashboard", { users });
});

app.get("/getmeetings", async (req, res) => {
  res.send(await Meeting.find({}));
});
app.post("/putmeetings", async (req, res) => {
  console.log(req.body);
  const newmeeting = new Meeting({
    name: req.body.type,
    date: req.body.date,
  });
  newmeeting.save().then((data) => {
    res.send("added successfully");
  });
});

app.post("/forgraph",async(req,res)=>{
  console.log(req.body.ID);
  const student =  await Student.find({ID:req.body.ID})
  // res.json({name:"kero"}) ; 
})
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
