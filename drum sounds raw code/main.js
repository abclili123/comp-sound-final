var audioCtx = new (window.AudioContext || window.webkitAudioContext);
var globalGain = audioCtx.createGain();
globalGain.connect(audioCtx.destination);
globalGain.gain.setValueAtTime(1,audioCtx.currentTime);

function playKick(){
    var kickOsc1 = audioCtx.createOscillator();
    var kickGain1 = audioCtx.createGain();
    kickOsc1.type = "triangle";
    kickOsc1.frequency.value = 30;
    var kickOsc2 = audioCtx.createOscillator();
    var kickGain2 = audioCtx.createGain();
    kickOsc2.type = "sine";
    kickOsc2.frequency.value = 60;

    kickGain1.gain.setValueAtTime(0.8, audioCtx.currentTime);
    kickGain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.5);
    kickGain2.gain.setValueAtTime(0.8, audioCtx.currentTime);
    kickGain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.5);

    kickOsc1.frequency.setValueAtTime(120, audioCtx.currentTime);
    kickOsc1.frequency.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    kickOsc2.frequency.setValueAtTime(50, audioCtx.currentTime);
    kickOsc2.frequency.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    kickOsc1.connect(kickGain1);
    kickOsc2.connect(kickGain2);
    kickGain1.connect(globalGain);
    kickGain2.connect(globalGain);

    kickOsc1.start(audioCtx.currentTime);
    kickOsc2.start(audioCtx.currentTime);

    kickOsc1.stop(audioCtx.currentTime + 0.5);
    kickOsc2.stop(audioCtx.currentTime + 0.5);
};

function playHat(){
    globalGain.gain.value = 0.05;
    var activeOscillators = {};
    //MAIN TONE
    var osc = audioCtx.createOscillator();
    var mainGain = audioCtx.createGain();
    osc.frequency.value = 5000;
    osc.connect(mainGain).connect(globalGain);
    osc.start();
    //globalGain.gain.setTargetAtTime(0.8,audioCtx.currentTime,0.1);
    activeOscillators[0] = osc;
    //attack
    mainGain.gain.setTargetAtTime(0.05,audioCtx.currentTime,0.01);
    //decay
    mainGain.gain.setTargetAtTime(0.10,audioCtx.currentTime,0.01);
    //sustain
    mainGain.gain.setTargetAtTime(0.1,audioCtx.currentTime,0.01);
    //release
    mainGain.gain.setTargetAtTime(0.0000001,audioCtx.currentTime,0.01);

    

    //overtones
    var overtoneOsc = {};
    var overtoneFreq = [7000,4000,3500,3000];
    var overtoneGain = audioCtx.createGain();
    overtoneGain.connect(globalGain);
    //overtoneGain.gain.setTargetAtTime(0.003,audioCtx.currentTime,0.01);
    for (var i=0;i<overtoneFreq.length;i++){
        var overtone = audioCtx.createOscillator();
        overtone.connect(overtoneGain);
        overtone.frequency.value = overtoneFreq[i];
        overtone.start();
        activeOscillators[i+1] = overtone;
        //attack
        overtoneGain.gain.setTargetAtTime(0.0002,audioCtx.currentTime,0.02);
        //decay
        overtoneGain.gain.setTargetAtTime(0.0001,audioCtx.currentTime,0.02);
        //sustain
        overtoneGain.gain.setTargetAtTime(0.0002,audioCtx.currentTime,0.02);
        //release
        overtoneGain.gain.setTargetAtTime(0.00000001,audioCtx.currentTime,0.02);
    }

};

function playSnare(){
    globalGain.gain.value = 0.4;
    var bufferSize = audioCtx.sampleRate;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var output = buffer.getChannelData(0);
    var noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
  
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  
	  var noiseFilter = audioCtx.createBiquadFilter();
	  noiseFilter.type = 'highpass';
	  noiseFilter.frequency.value = 500;
	  noise.connect(noiseFilter);

    var snareGain = audioCtx.createGain();
    noiseFilter.connect(snareGain).connect(globalGain);

    var osc = audioCtx.createOscillator(); 
    osc.type = 'triangle';

    var oscGain = audioCtx.createGain();
    osc.connect(oscGain).connect(globalGain);

    snareGain.gain.setValueAtTime(1, audioCtx.currentTime);
    snareGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    noise.start(audioCtx.currentTime);
  
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(audioCtx.currentTime);
  
    osc.stop(audioCtx.currentTime + 0.2);
    noise.stop(audioCtx.currentTime + 0.2);
};

function playPreset1(){
  globalGain.gain.value = 0.4;
  var osc1 = audioCtx.createOscillator();
  var gain1= audioCtx.createGain();
  var osc2 = audioCtx.createOscillator();
  var gain2= audioCtx.createGain();

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(globalGain);
  gain2.connect(globalGain);

  osc1.frequency.value = 500 + Math.random() * 15; //would be key value times math random
  osc2.frequency.value = 500 + Math.random() * 15;
  gain1.gain.setTargetAtTime(0.2, audioCtx.currentTime,0.1);
  gain2.gain.setTargetAtTime(0.2, audioCtx.currentTime,0.1);

  gain1.gain.setTargetAtTime(0.1, audioCtx.currentTime + 0.1,0.1);
  gain2.gain.setTargetAtTime(0.1, audioCtx.currentTime + 0.1,0.1);

  gain1.gain.setTargetAtTime(0, audioCtx.currentTime + 0.1,0.5); //can delete this and replace with keyUp
  gain2.gain.setTargetAtTime(0, audioCtx.currentTime + 0.1,0.5);

  var lfo = audioCtx.createOscillator();
  lfo.frequency.value = 2;
  lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 8;
  lfo.connect(lfoGain).connect(osc1.frequency);
  lfo.start();
  osc1.start();
  osc2.start();
}

function playPreset2(){
  globalGain.gain.value = 0.4;
  var osc1 = audioCtx.createOscillator();
  osc1.type = "triangle";
  var gain1= audioCtx.createGain();

  osc1.connect(gain1);
  gain1.connect(globalGain);

  osc1.frequency.value = 500;
  gain1.gain.setTargetAtTime(0.2, audioCtx.currentTime,0.1);

  gain1.gain.setTargetAtTime(0.1, audioCtx.currentTime + 0.1,0.1);

  gain1.gain.setTargetAtTime(0, audioCtx.currentTime + 0.1,0.5); //can delete this and replace with keyUp

  var lfo = audioCtx.createOscillator();
  lfo.frequency.value = 2;
  lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 8;
  lfo.connect(lfoGain).connect(osc1.frequency);
  lfo.start();
  osc1.start();
}

const kick = document.getElementById('kick');

kick.addEventListener('click', function handleClick() {
    globalGain.gain.setTargetAtTime(0.9,audioCtx.currentTime,0.01);
    playKick();
});

const hihat = document.getElementById('hihat');

hihat.addEventListener('click', function handleClick() {
  globalGain.gain.setTargetAtTime(0.05,audioCtx.currentTime,0.01);
  playHat();
});

const snare = document.getElementById('snare');

snare.addEventListener('click', function handleClick() {
  globalGain.gain.setTargetAtTime(0.4,audioCtx.currentTime,0.01);
  playSnare();
});

const preset1 = document.getElementById('preset1');

preset1.addEventListener('click', function handleClick() {
  globalGain.gain.setTargetAtTime(0.4,audioCtx.currentTime,0.01);
  playPreset1();
});

const preset2 = document.getElementById('preset2');

preset2.addEventListener('click', function handleClick() {
  globalGain.gain.setTargetAtTime(0.4,audioCtx.currentTime,0.01);
  playPreset2();
});
