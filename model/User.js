const mongoose = require("mongoose");


const meetingSchema = new mongoose.Schema({
    name: String,
    date: Date,
  });
  
  const studentSchema = new mongoose.Schema({
    ID: String,
    name: String,
    grade: Number,
    profilepic: String,
    role : { 
      type : String ,  
      default : "basic"  
    } , 
    meetings: [
      {
        _id: false,
        meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
        bonusandminus: [Number], // Array of strings for bonus and minus data
      },
    ],
  });
  
  studentSchema.methods.gettotalbonus = async function () {
    let bonus = 0;
    this.meetings.forEach((element) => {
      if (element.meeting.name == "تسبحة") bonus += 50;
      else bonus += 30;
    });
    console.log(bonus);
    return bonus;
  };
  
  const Student = mongoose.model("Student", studentSchema);
  const Meeting = mongoose.model("Meeting", meetingSchema);

  module.exports = {Student, Meeting} ;