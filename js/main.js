'use strict';

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');

window.onload = async function() {
    await startCamera();
    initFace();
};

function playRecording() {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = false;
  recordedVideo.play();
}


function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecordingAndHide() {
    if (typeof window.stream === 'undefined') {
        throw "window.stream is not yet defined";
    }
    startRecording();
    recordedVideo.pause();
    recordedVideo.hidden = true;
}

function stopRecordingAndPlay() {
    if (typeof window.stream === 'undefined') {
        throw "window.stream is not yet defined";
    }
    recordedVideo.hidden = false;
    stopRecording();
    playRecording();
}

function startRecording() {
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
        options = {mimeType: ''};
      }
    }
  }

  try {
    console.log("type is " + typeof window.stream);
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  try {
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
  } catch (error) {
    console.log("Coudn't start mediaRecorder");
  }
}

function stopRecording() {
  try {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
  } catch (error) {
    console.log("Couldn't stop mediaRecorder");
  }
}

function handleSuccess(stream) {
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;
}

function handleFailure(stream) {
  console.log('getUserMedia() didnt get stream:', stream);
    window.stream = null;
}

async function init(constraints) {
  try {
    navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleFailure);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

async function startCamera() {
  const constraints = {
    video: {
      width: 1280, height: 720
    }
  };
  console.log('Using media constraints:', constraints);
  await init(constraints);
}
