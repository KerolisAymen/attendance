const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const qr = require('qrcode');



// Set the view engine to use EJS
app.set('view engine', 'ejs');

// Set the directory for EJS templates (optional if you're using a single folder)
app.set('views', __dirname); // Use the current directory where server.js is located


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());


const studentSchema = new mongoose.Schema({
  name: String,
  grade:Number,
  meetings : Array
});

const courseSchema = new mongoose.Schema({
  name: String,
 
});


const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);




app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname,"registration.html"))
});


app.post('/registration.html', (req, res) => {
   const username = req.body.username;
   console.log(req.body);

  const grade = req.body.grade
  

    let newStudent = new Student({
      name : username,
      grade : grade
    })

    newStudent.save().then((s)=>{
      console.log(s); 
      res.send('Registration successful!');
    }).catch((error)=>{
      console.log(error);

    });
    
});



app.get("/attendanceReview/:name", async (req,res)=>{
  const profileData = await Student.findOne({name:req.params.name});
  console.log(profileData.meetings.length)
  const profileData2 = {
    name: profileData.name,
    grade: profileData.grade,
    meetingsAttended: profileData.meetings.length
  };

  // profileData.json();
  JSON.stringify(profileData2);
  console.log(profileData2);
  res.render('profile', { profileData2 });


})




app.post("/qrcodepage", async (req, res) => {
  // console.log(req.body.decodeText);
  // console.log(req.body.decodeText);
  
  let name = req.body.decodeText;
  const name2 = await Student.findOne({name :name});
  console.log(name2); 
  console.log(name2.meetings);
  
 
let today = new Date(new Date().setHours(0,0,0,0));
  // let newdate = new Date().setHours(0,0,0,0); 
   if(name2.meetings.length==0||name2.meetings[name2.meetings.length-1].toString()!=today.toString()){
  name2.meetings.push(today) ;
  name2.save().then(()=>{
    res.json({message:"saved successfully" , success:true});
    console.log("saved successfully")
  })
  }
});
//Kerolis456:afDaYNP5YvABh69L
//













mongoose.connect("mongodb+srv://Kerolis456:afDaYNP5YvABh69L@nodejsproject.jyjtxsy.mongodb.net/?retryWrites=true&w=majority&appName=nodejsProject")
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
