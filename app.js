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
const fs = require("fs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secretKey = "kero";
const cors = require("cors");

app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
//app.use(cors());
// Set the directory for EJS templates (optional if you're using a single folder)
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const { Student, Meeting } = require("./model/User");
const { register, adminAuth, userAuth } = require("./Auth/auth.js");
const { decode } = require("punycode");


app.get("/", adminAuth, async (req, res) => {
  jwt.verify(req.cookies.token, "kero", async (err, decodedToken) => {

    const user = await Student.findOne({ ID: decodedToken.ID });
    console.log(user.name+" visited home page");
    res.render("home", { user });
  });
});

app.get("/registration", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "registration.html"));
});

app.post("/submit", upload.single("avatar"), async (req, res, next) => {
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
});

app.post("/edituser", upload.single("avatar"), async (req, res, next) => {
  const id = req.body.ID;
  const picUrl = req.body.picurl;

  try {
    // Find the user by ID
    let user = await Student.findOne({ ID: id });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update the user's profile picture URL
    user.profilepic = picUrl;

    // Save the updated user
    await user.save();

    res.send("User profile updated successfully");
  } catch (error) {
    next(error);
  }
});


app.get("/attendanceReview", userAuth, async (req, res) => {
  let ID;
  const token = req.cookies.token;
  if (!token) return;
  jwt.verify(token, "kero", (err, decodedToken) => {
    ID = decodedToken.ID;
  });

  attendanceReview(ID,res);

});
app.get("/attendanceReview/:ID", adminAuth, async (req, res) => {
  let ID = req.params.ID;
 attendanceReview(ID,res) ; 
});



async function  attendanceReview(ID,res){


  
  const profileData = await Student.findOne({ ID: ID }).populate(
    "meetings.meeting"
  );

 console.log(profileData.name +" profile visited"); 
  
  if (profileData != undefined) {
    const allstudents = await Student.find({
      grade: profileData.grade,
    }).populate("meetings.meeting");
    const grapharray = [];
    await allstudents.forEach(async (student) => {
      grapharray.push([student.name, await student.totalscore]);
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
        // console.log("QR code URL:", response.request.res.responseUrl);
        qrsrc = response.request.res.responseUrl;
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });

   // console.log(profileData.meetings);
    const profileData2 = {
      ID: profileData.ID,
      totalscore: profileData.totalscore,
      name: profileData.name,
      grade: profileData.grade,
      meetingsAttended: profileData.meetings.length,
      meetings: profileData.meetings,
      profilepic: profileData.profilepic,
      imgUrl: qrsrc,
      graph: grapharray,
    };

    JSON.stringify(profileData2);
   // console.log(profileData2);
    res.render("profile", { profileData2 });
  } else {
    res.send("<h1>this user not found</h1>");
  }

}

app.route("/qrpage").get(adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "qrpage.html"));
});
app.post("/qrcodepage", adminAuth, async (req, res) => {
  console.log(req.body);
  const name = await Student.findOne({ ID: req.body.decodeText });
  const meeting1 = await Meeting.findById(req.body.selectedValue);
  const newdata = await {
    meeting: meeting1.id,
  };
  // const arr = await name.meetings.filter(
  //   (object) => object.meeting.ObjectId === meeting1.id
  // );
  // console.log(name);
  // console.log(name.meetings[0].meeting.toString());
  // console.log(meeting1.id);
  // console.log(arr);
  if (name == undefined) {
    res.send({ message: "not in system" });
  } else {
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
  }
});

app.get("/dashboard", adminAuth, async (req, res) => {
  const users = await Student.find({}); //.populate("meetings.meeting");
  // console.log(users);
  res.render("dashboard", { users });
});

app.get("/addnewmeeting", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "addnewmeeting.html"));
});
app.get("/getmeetings", adminAuth, async (req, res) => {
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

app
  .route("/login")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
  })
  .post(async (req, res) => {
    const username = req.body.username;
    const user = await Student.findOne({ ID: username });
    //console.log(user);
    if (user) {
      // Generate token
      const token = jwt.sign({ ID: user.ID, role: user.role }, secretKey);

      // Correctly set the cookie
      res.cookie("token", token, {
        // httpOnly: true, // Cookie is accessible only by the web server
        secure: process.env.NODE_ENV === "production", // Cookie is only sent over HTTPS
        sameSite: "Strict", // Helps mitigate CSRF attacks
      });

      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  });

app.get("/edit", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "edit.html"));
});

app.get("/users", adminAuth, async (req, res) => {
  const users = await Student.find({});
  res.json(users);
});

app.get("/bonus", (req, res) => {
  res.sendFile(path.join(__dirname, "bonus.html"));
});
app.post("/addbonusandminus", async (req, res) => {
  const { ID, title, description, bonus } = req.body;

  const student = await Student.findOne({ ID: ID });
  if (student != undefined && student.meetings.length > 0) {
    console.log(student.meetings);
    student.meetings[student.meetings.length - 1].bonusandminus.push({
      title: title,
      description: description,
      bonus: bonus,
    });
    console.log(student.meetings[student.meetings.length - 1]);
    student.save().then((data) => {
      res.json("saved");
    });
  }
});

app.get("/print", adminAuth, async (req, res) => {
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
