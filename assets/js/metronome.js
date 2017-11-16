var audioContext = null;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var currentTwelveletNote;        // What note is currently last scheduled?
var tempo = 120.0;          // tempo (in beats per minute)
var meter = 4;
var masterVolume = 0.5;
var accentVolume = 1;
var quarterVolume = 0.75;
var eighthVolume = 0;
var sixteenthVolume = 0;
var tripletVolume = 0;
var lookahead = 25.0;       // How frequently to call scheduling function
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteLength = 0.05;      // length of "beep" (in seconds)
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages


function maxBeats() {
  var beats = (meter * 12);
  return beats;
}

function nextTwelvelet() {
  var secondsPerBeat = 60.0 / tempo;
  nextNoteTime += 0.08333 * secondsPerBeat;    // Add beat length to last beat time
  currentTwelveletNote++;    // Advance the beat number, wrap to zero

  if (currentTwelveletNote == maxBeats()) {
    currentTwelveletNote = 0;
  }
}

function calcVolume(beatVolume) {
  return (beatVolume * masterVolume);
}

function setFlasher(color) {
    document.getElementById("flasher").style.backgroundColor=color;
    setTimeout(function() { 
        document.getElementById("flasher").style.backgroundColor='';
    }, 100);
}

function scheduleNote(beatNumber, time) {
  // push the note on the queue, even if we're not playing.
  notesInQueue.push({ note: beatNumber, time: time });

  // create oscillator & gainNode & connect them to the context destination
  var osc = audioContext.createOscillator();
  var gainNode = audioContext.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (beatNumber % maxBeats() === 0) {
    setFlasher("#FF3C7D");
    if (accentVolume > 0.25) {
      osc.frequency.value = 880.0;
      gainNode.gain.value = calcVolume(accentVolume);
    } else {
      osc.frequency.value = 440.0;
      gainNode.gain.value = calcVolume(quarterVolume);
    }
  } else if (beatNumber % 12 === 0) {   // quarter notes = medium pitch
    setFlasher("#00CCCA");
    osc.frequency.value = 440.0;
    gainNode.gain.value = calcVolume(quarterVolume);
  } else if (beatNumber % 6 === 0) {
    osc.frequency.value = 440.0;
    gainNode.gain.value = calcVolume(eighthVolume);
  } else if (beatNumber % 4 === 0) {
    osc.frequency.value = 300.0;
    gainNode.gain.value = calcVolume(tripletVolume);
  } else if (beatNumber % 3 === 0 ) {                    // other 16th notes = low pitch
    osc.frequency.value = 220.0;
    gainNode.gain.value = calcVolume(sixteenthVolume);
  } else {
    gainNode.gain.value = 0;   // keep the remaining twelvelet notes inaudible
  }

  osc.start(time);
  osc.stop(time + noteLength);
}

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
    scheduleNote( currentTwelveletNote, nextNoteTime );
    nextTwelvelet();
  }
}

function play() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    currentTwelveletNote = 0;
    nextNoteTime = audioContext.currentTime;
    timerWorker.postMessage("start");
    document.getElementById("play-icon").innerHTML = "pause";
  } else {
    timerWorker.postMessage("stop");
    document.getElementById("play-icon").innerHTML = "play_arrow";
  }
}

function init(){
  audioContext = new AudioContext();
  timerWorker = new Worker("assets/js/worker.js");

  timerWorker.onmessage = function(e) {
    if (e.data == "tick") {
      scheduler();
    } else {
      console.log("message: " + e.data);
    }
  };

  timerWorker.postMessage({"interval":lookahead});
}

document.onkeydown = function(e){
    if (e.keyCode == 32) {//space
        play();
        return;
    }
    else if (e.keyCode == 74) { //j
        var bpmInput = document.getElementById("bpmInput");
        var bpmOutput = document.getElementById("bpmOutput");
        bpmInput.stepDown();
        bpmOutput.value = bpmInput.value;
        tempo = bpmInput.value;
    } else if (e.keyCode == 75) {//k
        var bpmInput = document.getElementById("bpmInput");
        var bpmOutput = document.getElementById("bpmOutput");
        bpmInput.stepUp();
        bpmOutput.value = bpmInput.value;
        tempo = bpmInput.value;
    }
}


window.addEventListener("load", init );
