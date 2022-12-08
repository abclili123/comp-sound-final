var melody = [];
let start = 0;
let magentaSynth = [];
let g;
let mLength = 0;
let last = 0;

function createSynth(synth) {
    g = audioCtx.createGain();
    g.connect(globalGain)
    g.gain.setValueAtTime(0, audioCtx.currentTime);

    let lfo;
    let lfoGain;
    // initiate lfo
    if(synth['lfo']){
        lfo = audioCtx.createOscillator();
        lfo.frequency.value = 2;
        lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 8;
        lfo.start();
    }

    let modulationIndex;
    //initiate FM if checked
    if(synth['fm'] > 0){
        modulationIndex = audioCtx.createGain();
        const fmFreq = audioCtx.createOscillator();
        modulationIndex.gain.value = synth['fmInd'];
        fmFreq.frequency.value = synth['fm'];
        fmFreq.connect(modulationIndex);
        fmFreq.start();
    }

    // additive synthesis
    for(let i = 0; i<=synth['add']; i++){
        magentaSynth[i] = audioCtx.createOscillator();
        magentaSynth[i].type =synth['type'];

        if(synth['fm'] > 0) {
            modulationIndex.connect(magentaSynth[i].frequency)
        }

        if(synth['lfo']){
            lfo.connect(lfoGain).connect(magentaSynth[i].frequency);
        }
        magentaSynth[i].connect(g)
        magentaSynth[i].start();
        mLength = magentaSynth.length
    }
}

function playNotes(noteList) {
    noteList = mm.sequences.unquantizeSequence(noteList)
    console.log(noteList.notes)
    createSynth(setSythn(0))
    noteList.notes.forEach(note => {
        play(note);
    });
    console.log("end" + start+0.2)
    g.gain.setTargetAtTime(0, audioCtx.currentTime+ start+0.2+1, 1)
    melody = []
    start = 0;
    last = 0;
}

function play(note) {
    let offset = 1 //it takes a bit of time to queue all these events
    g.gain.setTargetAtTime(0.2/mLength, audioCtx.currentTime+ note.startTime+offset, 0.1);
    for(let i = 0; i<mLength; i++) {
        if(i>0){
            magentaSynth[i].frequency.setValueAtTime(midiToFreq(note.pitch) + Math.random() * 15, audioCtx.currentTime+ note.startTime + offset)
        }
        else{
            magentaSynth[i].frequency.setValueAtTime(midiToFreq(note.pitch), audioCtx.currentTime+ note.startTime + offset)
        }
    }

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
    mLength = 0;
    music_rnn
        .continueSequence(qns, rnn_steps, rnn_temperature)
        .then((sample) => playNotes(mm.sequences.concatenate([qns,sample])));
}

function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

function setSythn(key){
    return {
        'key': key,
        'add': document.getElementById('additive').value,
        'type': document.getElementById('wave').value,
        'fm': document.getElementById('fm').value,
        'fmInd': document.getElementById('fmInd').value,
        'lfo': document.getElementById('lfo').checked,
    };
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
    let totalOsc = 1

    const res = document.getElementById("res")
    res.addEventListener('click', function() {
        document.getElementById('additive').value = 0
        document.getElementById('wave').value = 'sine'
        document.getElementById('fm').value = 0
        document.getElementById('fmInd').value = 0
        document.getElementById('lfo').checked = false
    });

    const preset1 = document.getElementById("preset1")
    preset1.addEventListener('click', function() {
        document.getElementById('additive').value = 2;
        document.getElementById('wave').value = 'sine'
        document.getElementById('fm').value = 0
        document.getElementById('fmInd').value = 0
        document.getElementById('lfo').checked = true
    });

    const preset2 = document.getElementById("preset2")
    preset2.addEventListener('click', function() {
        document.getElementById('additive').value = 0;
        document.getElementById('wave').value = 'triangle'
        document.getElementById('fm').value = 0
        document.getElementById('fmInd').value = 0
        document.getElementById('lfo').checked = true
    });


    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(setSythn(key));
        }
        let magenta = document.getElementById('magenta').checked
        if(magenta){
            if(keyboardFrequencyMap[key] != undefined){
                melody.push({
                    pitch: keyboardFrequencyMap[key],
                    startTime: start,
                    endTime: start+0.5
                });
                start+=0.2;
                console.log("push note " + keyboardFrequencyMap[key])
            }
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
            totalOsc -= activeOscillators[key].length
            delete activeOscillators[key];
            delete activeGain[key];
        }
    }

    function playNote(synth) {
        const gainNode = audioCtx.createGain();
        gainNode.connect(globalGain)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

        let oscs = [];

        let lfo;
        let lfoGain;
        // initiate lfo
        if(synth['lfo']){
            lfo = audioCtx.createOscillator();
            lfo.frequency.value = 2;
            lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 8;
            lfo.start();
        }

        let modulationIndex;
        //initiate FM if checked
        if(synth['fm'] > 0){
            modulationIndex = audioCtx.createGain();
            const fmFreq = audioCtx.createOscillator();
            modulationIndex.gain.value = synth['fmInd'];
            fmFreq.frequency.value = synth['fm'];
            fmFreq.connect(modulationIndex);
            fmFreq.start();
        }

        // additive synthesis
        for(let i = 0; i<=synth['add']; i++){
            oscs[i] = audioCtx.createOscillator();
            oscs[i].type =synth['type'];
            oscs[i].frequency.setValueAtTime(midiToFreq(keyboardFrequencyMap[synth['key']]), audioCtx.currentTime)
            if(i>0){
                oscs[i].frequency.setValueAtTime(midiToFreq(keyboardFrequencyMap[synth['key']]) + Math.random() * 15, audioCtx.currentTime)
            }

            if(synth['fm'] > 0) {
                modulationIndex.connect(oscs[i].frequency)
            }

            if(synth['lfo']){
                lfo.connect(lfoGain).connect(oscs[i].frequency);
            }
            oscs[i].connect(gainNode)
            oscs[i].start();

            totalOsc+=1;
        }

        gainNode.gain.setTargetAtTime(0.3/totalOsc, audioCtx.currentTime,0.1);

        activeOscillators[synth['key']] = oscs
        activeGain[synth['key']] = gainNode
    }
});

