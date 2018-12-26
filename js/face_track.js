var vid = document.getElementById('hiddenVideo');

function gumSuccess( stream ) {
    // add camera stream if getUserMedia succeeded
    console.log("gumSuccess called markmliu");

    if ("srcObject" in vid) {
        vid.srcObject = stream;
    } else {
        vid.src = (window.URL && window.URL.createObjectURL(stream));
    }
    vid.onloadedmetadata = function() {
        vid.play();
    }
    var ctrack = new clm.tracker();
    ctrack.init();
    var trackingStarted = false;
    // start video
    vid.play();
    // start tracking
    ctrack.start(vid);
    trackingStarted = true;
    // start loop to draw face
    drawLoop(false);
    function drawLoop(recording) {
        if (!recording && ctrack.getScore() < 0.45) {
            console.log("start recording and hide");
            while (true) {
                console.log("looping");
                try {
                    startRecordingAndHide();
                    break;
                }
                catch (error) {
                    // just continue trying
                }

            }
            recording = true;
        } else if (recording && ctrack.getScore() > 0.45) {
            console.log("stop recording and play");
            while (true) {
                try {
                    stopRecordingAndPlay();
                    break;
                }
                catch (error) {
                    // just continue trying
                }
            }
            recording= false;
        }
        requestAnimFrame(drawLoop.bind(recording));
    }
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            return window.setTimeout(callback, 1000/60);
        };
})();

// set up video
if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess);
} else if (navigator.getUserMedia) {
    navigator.getUserMedia({video : true}, gumSuccess, gumFail);
} else {
    alert("Your browser does not support getUserMedia.");
}
