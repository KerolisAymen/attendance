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
        bonusandminus: [{
          _id: false , 
          title:String , description:String  , bonus:Number 
        }], // Array of strings for bonus and minus data
      },
    ],
  });
  

// Define a virtual property for totalscore
studentSchema.virtual('totalscore').get(function() {
  let total = 0;

  // Iterate through meetings and adjust total score based on meeting names
  this.meetings.forEach(meeting => {
      if (meeting.meeting.name === 'تسبحة') {
          total += 50;
      } else if (meeting.meeting.name === 'اجتماع') {
          total += 30;
      }
     
      meeting.bonusandminus.forEach(bonus=> {total += bonus.bonus ;
      }) 
  });

  return total;
});

// Apply virtuals to schema
studentSchema.set('toObject', { virtuals: true });
studentSchema.set('toJSON', { virtuals: true });



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