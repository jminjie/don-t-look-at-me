'use strict';

var recording = false;

// adds hidden video element to body.
// This is done by nesting it in a div.
function createHiddenVideoElement() {
    var outerDiv = document.createElement("div");
    outerDiv.style.cssText = "overflow:hidden;position:relative;";
    outerDiv.setAttribute("ind", "container");
    document.body.appendChild(outerDiv);
    var hiddenVideo = document.createElement("video");
    hiddenVideo.setAttribute("id", "hiddenVideo");
    hiddenVideo.setAttribute("width", "400");
    hiddenVideo.setAttribute("height", "300");
    hiddenVideo.setAttribute("preload", "auto");
    hiddenVideo.style.cssText = "overflow:hidden;right:-50px;position:absolute;";
    hiddenVideo.loop = true;
    hiddenVideo.playsinline = true;
    hiddenVideo.autoplay = true;
    outerDiv.appendChild(hiddenVideo);
}

function gumSuccess(stream) {
    var vid = document.getElementById('hiddenVideo');
    // add camera stream if getUserMedia succeeded
    if ("srcObject" in vid) {
        vid.srcObject = stream;
    } else {
        vid.src = (window.URL && window.URL.createObjectURL(stream));
    }
    vid.onloadedmetadata = function() {
        vid.play();
    }
    // start video
    vid.play();
    // start tracking
    var ctrack = new clm.tracker();
    ctrack.init();
    ctrack.start(vid);
    // start loop to draw face
    drawLoop();
    function drawLoop() {
        if (!recording && ctrack.getScore() >= 0.5) {
            console.log("start recording and hide");
            startRecordingAndHide();
            recording = true;
        } else if (recording && ctrack.getScore() < 0.5) {
            console.log("stop recording and play");
            stopRecordingAndPlay();
            recording = false;
        }
        requestAnimFrame(drawLoop);
    }
}
