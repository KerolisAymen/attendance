// script.js file

function domReady(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 1000);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

domReady(function () {

  const meetingselect = document.getElementById("meeting-select");

  function onScanSuccess(decodeText, decodeResult) {


    console.log(typeof(decodeText)); 
    let s="" ; 
    for (let i = 0;i<decodeText.length ; i++){
      if (decodeText[i]!= ' ' && decodeText[i]!= '\n'){
        s+= decodeText[i];
      }
    }
    decodeText = s ; 
    console.log(s); 

    if (meetingselect.value != "") {
		var beepSound = document.getElementById("beep");
		beepSound.play();
    
      fetch("/qrcodepage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decodeText,
          selectedValue: meetingselect.value,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          displayMessage(decodeText + " " + data.message) ;
          beepSound.play();
        //  alert(decodeText + " " + data.message);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
	else{
		alert("choose meeting!!!");
	}
  }

  let htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
    fps: 3,
    qrbos: 250,
  });
  htmlscanner.render(onScanSuccess);
});

fetch("/getmeetings")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);

    data.forEach((element) => {
      var select = document.getElementById("meeting-select");
      var option = document.createElement("option");
      option.value = element._id;
      option.text = element.name +"---"+element.date;
      console.log(element._id);
      select.appendChild(option);
    });
  })
  .catch((error) => {
    console.log(error);
  });



  function displayMessage(message) {
    let messageDiv = document.getElementById("message-div");
    if (!messageDiv) {
      messageDiv = document.createElement("div");
      messageDiv.id = "message-div";
      document.body.appendChild(messageDiv);
    }
    messageDiv.innerHTML = message;
    messageDiv.style.position = "fixed";
    messageDiv.style.top = "0";
    messageDiv.style.left = "0";
    messageDiv.style.width = "100%";
    messageDiv.style.backgroundColor = "green";
    messageDiv.style.color = "white";
    messageDiv.style.padding = "10px";
    messageDiv.style.textAlign = "center";
    messageDiv.style.zIndex = "1000";
     messageDiv.style.display = "block"; 
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000); // Hide after 3 seconds
  }