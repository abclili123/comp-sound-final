var trackAudioCtx;
var loadMP3 = false;
let trackGain;

async function loadBuffer(bufferURL) {
    //better to have a try/catch block here, but for simplicity...
    const response = await fetch(bufferURL);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await trackAudioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

const playButton = document.getElementById("mp3")

playButton.addEventListener('click', async function () {
    if(loadMP3 === true){
    if (trackAudioCtx.state === "running") {
        trackAudioCtx.suspend().then(() => {
            playButton.textContent = "play";
        });
    } else if (trackAudioCtx.state === "suspended") {
        trackAudioCtx.resume().then(() => {
            playButton.textContent = "pause";
        });
    }
    }
    else{
        trackAudioCtx = new AudioContext();
        var audioBuffer = await loadBuffer('track.mp3');
        const source = trackAudioCtx.createBufferSource();
        trackGain = trackAudioCtx.createGain();
        trackGain.gain.setTargetAtTime(0.7, trackAudioCtx.currentTime, 0.1)
        source.connect(trackGain).connect(trackAudioCtx.destination);
        source.buffer = audioBuffer;
        source.loop = true;
        source.start();
        loadMP3 = true;
        playButton.textContent = "pause";
    }
});
