var melody = [];
let start = 0;
let example;
let g;
let last = 0;

function playNotes(noteList) {
    noteList = mm.sequences.unquantizeSequence(noteList)
    console.log(noteList.notes)
    example = audioCtx.createOscillator();
    g = audioCtx.createGain();
    g.gain.setValueAtTime(0, audioCtx.currentTime)
    example.connect(g);
    g.connect(globalGain);
    example.start();
    noteList.notes.forEach(note => {
        play(note);
    });
}

function play(note) {
    let offset = 0.9 //it takes a bit of time to queue all these events
    g.gain.setTargetAtTime(0.5, audioCtx.currentTime+ note.startTime+offset, 1);
    example.frequency.setValueAtTime(midiToFreq(note.pitch), audioCtx.currentTime+ note.startTime + offset)
    if(last !== note.pitch){
        g.gain.setTargetAtTime(0, audioCtx.currentTime+ note.endTime+offset-0.05, 1)
    }
    last = note.pitch
}

function genNotes() {
    //load a pre-trained RNN model
    music_rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
    music_rnn.initialize();

    //the RNN model expects quantized sequences
    continueFrom = {
        notes: melody,
        totalTime: start
    };
    let qns = mm.sequences.quantizeNoteSequence(continueFrom, 4);

    //and has some parameters we can tune
    rnn_steps = 40; //including the input sequence length, how many more quantized steps (this is diff than how many notes) to generate
    rnn_temperature = 1.1; //the higher the temperature, the more random (and less like the input) your sequence will be

    // we continue the sequence, which will take some time (thus is run async)
    // "then" when the async continueSequence is done, we play the notes
    music_rnn
        .continueSequence(qns, rnn_steps, rnn_temperature)
        .then((sample) => playNotes(mm.sequences.concatenate([qns,sample])));

    melody = []
    start = 0;
    last = 0;
}

function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

document.addEventListener("DOMContentLoaded", function(event) {

    const keyboardFrequencyMap = {
        '90': 60,  //Z - C
        '83': 61, //S - C#
        '88': 62,  //X - D
        '68': 63, //D - D#
        '67': 64,  //C - E
        '86': 65,  //V - F
        '71': 66, //G - F#
        '66': 67,  //B - G
        '72': 68, //H - G#
        '78': 69,  //N - A
        '74': 70, //J - A#
        '77': 71,  //M - B
        '81': 72,  //Q - C
        '50': 73, //2 - C#
        '87': 74,  //W - D
        '51': 75, //3 - D#
        '69': 76,  //E - E
        '82': 77,  //R - F
        '53': 78, //5 - F#
        '84': 79,  //T - G
        '54': 80, //6 - G#
        '89': 81,  //Y - A
        '55': 82, //7 - A#
        '85': 83,  //U - B
    }

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {}
    activeGain = {}

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
        }

        let magenta = document.getElementById('magenta').checked
        if(magenta){
            melody.push({
                pitch: keyboardFrequencyMap[key],
                startTime: start,
                endTime: start+0.5
            });
            start+=0.2;
            console.log("push note " + keyboardFrequencyMap[key])
        }

        if(!magenta && start > 0 && key == 16){
            genNotes();
            console.log("gen")
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            activeGain[key].gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + .5)
            activeGain[key].gain.setTargetAtTime(0, audioCtx.currentTime, 1)
            delete activeOscillators[key];
            delete activeGain[key];
        }
    }

    function playNote(key) {
        const gainNode = audioCtx.createGain();
        gainNode.connect(globalGain)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.setTargetAtTime(0.5, audioCtx.currentTime, 1);

        var notes = audioCtx.createOscillator();
        notes.type = document.getElementById('wave').value
        notes.frequency.setValueAtTime(midiToFreq(keyboardFrequencyMap[key]), audioCtx.currentTime)
        notes.connect(gainNode)
        notes.start();

        //initiate FM if checked
        let fm = document.getElementById('fm').value
        let modulationIndex = audioCtx.createGain();
        let fmInd = document.getElementById('fmInd').value
        if(fm>0){
            const fmFreq = audioCtx.createOscillator();
            modulationIndex.gain.value = fmInd;
            fmFreq.frequency.value = fm;
            fmFreq.connect(modulationIndex);
            modulationIndex.connect(notes.frequency)
            fmFreq.start();
        }

        activeOscillators[key] = notes
        activeGain[key] = gainNode
    }
});

