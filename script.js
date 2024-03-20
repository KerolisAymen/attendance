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
const map1 = new Map();
domReady(function () {

	// If found you qr code
	function onScanSuccess(decodeText, decodeResult) {
		// alert("You Qr is : " + decodeText, decodeResult);
        var beepSound = document.getElementById("beep");
    beepSound.play();
    console.log(decodeText);
    // console.log(decodeResult); 
	console.log(JSON.stringify({decodeText}));
	map1.set(decodeText).val++; 
	fetch( "/qrcodepage",{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({decodeText})
	})
	.then(response => {
		if (!response.ok) {
		  throw new Error('Network response was not ok');
		}
		return response.json();
	  })
	  .then(data => {
		if (data.success) {
		  // Show message box
		  alert(decodeText +" "+ data.message);
		} else {
		  console.error('Request was successful, but data indicates failure:', data);
		}
	  })
	  .catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	  });

	}

	let htmlscanner = new Html5QrcodeScanner(
		"my-qr-reader",
		{ fps: 3, qrbos: 250 }
	);
	htmlscanner.render(onScanSuccess);
});


// Make a request to the backend endpoint
