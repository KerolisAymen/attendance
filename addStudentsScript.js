const mongoose = require("mongoose");
const fs = require('fs');


// mongoose
//   .connect(
//     "mongodb+srv://Kerolis456:afDaYNP5YvABh69L@nodejsproject.jyjtxsy.mongodb.net/?retryWrites=true&w=majority&appName=nodejsProject"
//   )
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((error) => {
//     console.log("Error connecting to MongoDB:", error);
//   });

const {Student , Meeting} = require("./model/User")
// const filePath = 'names.txt';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  let data2 = data.split("\r\n" || " ");
  // console.log('File content:', data2);
  data2.forEach(element => {
    element = element.split(" ");
    // console.log(element) ;

    let i = 1 ;
    newstudent = new Student({
      name : element[0] + " " + element[1] , 
      ID : Math.floor(Math.random() * 99999 + 10000) ,
      grade: Number(element[2])
    })
    newstudent.save().catch((err)=>{ console.log("error here>> " +i+element)}); 
    i++;
  });
});
