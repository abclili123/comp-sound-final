async function loadBuffer(bufferURL) {
    //better to have a try/catch block here, but for simplicity...
    const response = await fetch(bufferURL);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

const playButton = document.getElementById("mp3")

playButton.addEventListener('click', async function () {
    var audioBuffer = await loadBuffer('track.mp3');
    const source = audioCtx.createBufferSource();
    source.connect(audioCtx.destination);
    source.buffer = audioBuffer;
    source.start();

});
