// Function to send a message
function sendMessage() {
    // Get the message from the textarea
    var message = document.getElementById('msg').value;
  
     document.getElementById('send_message').click();
    // Simulate sending the message (you should replace this with your actual sending code)
  

    console.log("Message sent:", message);
  
    // Clear the textarea after sending the message
    document.getElementById('msg').value = "";
  }
  
  // Function to automatically send a message after a delay
  function autoSendMessage() {
    // Replace 'Your message here' with the message you want to send automatically
    var messageToSend = "hi hru";
    
    // Simulate typing message into textarea (you can modify this to directly fill the textarea)
    var textarea = document.getElementById('msg');
  
        textarea.value = messageToSend;
    }
  

  (async() => {
    var liElements = document.querySelectorAll('li[data-gender="1"]');
    let arr = [] ; 
    if (liElements.length > 0) {
        for (let i = 0; i < liElements.length; i++) {

          console.log(arr);
            // Wrap setTimeout in a Promise to create a delay
            // Perform click action on each <li> element
            if(!arr.includes(liElements[i])){
              console.log("first")
            liElements[i].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
           
              // autoSendMessage() ;
              // sendMessage();
              await new Promise(resolve => setTimeout(resolve, 10));
              console.log(i + " / "+ liElements.length);
              arr.push(liElements[i]);
            }else console.log("not first")
          
        }
    } else {
        console.log("No <li> elements with the 'gender_color_2' class found.");
    }
})();
