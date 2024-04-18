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
    var index = 0;
    var typingInterval = setInterval(function() {
      if (index < messageToSend.length) {
        textarea.value += messageToSend[index];
        index++;
      } else {
        clearInterval(typingInterval);
        // Automatically send the message after typing
        sendMessage();
      }
    }, 0); // Adjust the typing speed here (milliseconds per character)
  }
  

  (async() => {
    var liElements = document.querySelectorAll('li[data-gender="1"]');
    if (liElements.length > 0) {
        for (let i = 0; i < liElements.length; i++) {


            // Wrap setTimeout in a Promise to create a delay
            // Perform click action on each <li> element
            
            liElements[i].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            autoSendMessage() ;
            console.log(i);
        }
    } else {
        console.log("No <li> elements with the 'gender_color_2' class found.");
    }
})();
