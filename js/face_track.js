'use strict';

var vid = document.getElementById('hiddenVideo');
var recording = false;

function gumSuccess(stream) {
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
