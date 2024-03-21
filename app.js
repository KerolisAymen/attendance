const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const qr = require("qrcode");
const axios = require("axios");

// Set the view engine to use EJS
app.set("view engine", "ejs");

// Set the directory for EJS templates (optional if you're using a single folder)
app.set("views", __dirname); // Use the current directory where server.js is located

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const studentSchema = new mongoose.Schema({
  name: String,
  grade: Number,
  meetings: Array,
});

const courseSchema = new mongoose.Schema({
  name: String,
});

const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/registration", (req, res) => {
  res.sendFile(path.join(__dirname, "registration.html"));
});

app.post("/registration.html", async(req, res) => {
  const username = req.body.username;
  // console.log(req.body);

  const grade = req.body.grade;

  let newStudent = new Student({
    name: username,
    grade: grade,
  });

  if(await Student.findOne({name :req.body.username})!=undefined)
  {
    console.log(await Student.findOne({name:req.body.username}));
    res.send("<h1>تم التسجيل من قبل</h1>");
  }else{
  newStudent
    .save()
    .then((s) => {
      console.log(s);
      res.send("<h1>تم التسجيل بنجاح</h1>");
    })
    .catch((error) => {
      console.log(error);
    });
  }
});

app.get("/attendanceReview/:name", async (req, res) => {
  const profileData = await Student.findOne({ name: req.params.name });
  // console.log(profileData.meetings.length)
  if(profileData != undefined){
  let qrsrc;
  const apiUrl = "https://api.qrserver.com/v1/create-qr-code/";
  const params = {
    size: "300x300",
    data: req.params.name,
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

  const profileData2 = {
    name: profileData.name,
    grade: profileData.grade,
    meetingsAttended: profileData.meetings.length,
    imgUrl: qrsrc,
  };

  JSON.stringify(profileData2);
  console.log(profileData2);
  res.render("profile", { profileData2 });
}
else{
  res.send("<h1>this user not found</h1>")
}
});

// if ("كرستين جمال كامل"=="كرستين جمال كامل")console.log("yes = ")
app.post("/qrcodepage", async (req, res) => {
  // console.log(req.body.decodeText);
  // console.log(req.body.decodeText);

  let name = req.body.decodeText;
  const name2 = await Student.findOne({ name: name });

  if (name2!= undefined)
  {
  console.log(name2);
  console.log(name2.meetings);

  let today = new Date(new Date().setHours(0, 0, 0, 0));
  
   if (name2.meetings.length == 0 ||name2.meetings[name2.meetings.length - 1].toString() != today.toString()){
    name2.meetings.push(today);
    await name2.save().then(() => {
      res.json({ message: "saved successfully", success: true });
      console.log("saved successfully");
    });
  }else{
    res.json({ message: "saved before", success: true });
  }
}
else res.json({ message: "this qr code is not found", success: false });
});

app.get("/dashboard" , async(req,res)=>{
console.log(await Student.find({},"name"));
const users = await Student.find({} ,"name") ; 
res.render('dashboard', { users });
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
