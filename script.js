// ================= AUDIO CONTEXT =================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

let isBGMute = false; // mute only background
let bgOsc1 = null, bgOsc2 = null, bgGain = null, bgInterval = null;

// ================= EFFECT SOUNDS =================
function playTone(freq, duration = 0.2, type = 'sine', volume = 0.5) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function clickSound() { playTone(700, 0.08, 'square', 0.25); }
function winSound() { playTone(880, 0.25, 'triangle', 0.6); setTimeout(()=>playTone(1200,0.25,'triangle',0.6),200); }
function loseSound() { playTone(300,0.35,'sawtooth',0.5); }
function drawSound() { playTone(520,0.25,'sine',0.4); }

// ================= BACKGROUND MUSIC =================
function startBackgroundMusic() {
    if (bgOsc1) return;

    audioCtx.resume();
    bgGain = audioCtx.createGain();
    bgGain.gain.value = isBGMute ? 0 : 0.05;
    bgGain.connect(audioCtx.destination);

    bgOsc1 = audioCtx.createOscillator();
    bgOsc2 = audioCtx.createOscillator();

    bgOsc1.type = 'sine'; bgOsc2.type = 'triangle';
    bgOsc1.frequency.value = 180;
    bgOsc2.frequency.value = 220;

    bgOsc1.connect(bgGain); bgOsc2.connect(bgGain);
    bgOsc1.start(); bgOsc2.start();

    const notes = [180,200,220,240,200,180];
    let i=0;
    bgInterval = setInterval(()=>{
        if(!bgOsc1) return;
        bgOsc1.frequency.setValueAtTime(notes[i], audioCtx.currentTime);
        bgOsc2.frequency.setValueAtTime(notes[i]+40,audioCtx.currentTime);
        i=(i+1)%notes.length;
    },700);
}

function stopBackgroundMusic() {
    if(bgOsc1){
        bgOsc1.stop(); bgOsc2.stop();
        bgOsc1.disconnect(); bgOsc2.disconnect();
        bgOsc1=null; bgOsc2=null; clearInterval(bgInterval);
    }
}

function toggleMute() {
    isBGMute = !isBGMute;
    if(bgGain) bgGain.gain.value = isBGMute ? 0 : 0.05;
    document.getElementById("muteBtn").innerText = isBGMute ? "🔇 Unmute BG" : "🔊 Mute BG";
}

// ================= GAME LOGIC =================
let userScore=0, computerScore=0;

function startGame() {
    audioCtx.resume();
    document.getElementById('startScreen').style.display='none';
    document.getElementById('gameScreen').style.display='flex';
    startBackgroundMusic();
}

function emoji(choice){ if(choice==='rock') return '✊'; if(choice==='paper') return '📄'; return '✂️'; }

function playGame(userChoice, button){
    clickSound();
    const buttons=document.querySelectorAll('.buttons button'); buttons.forEach(b=>b.disabled=true);
    const choices=['rock','paper','scissors'];
    const computerChoice=choices[Math.floor(Math.random()*3)];

    button.style.transform="scale(1.3)";
    setTimeout(()=>button.style.transform="scale(1)",300);

    document.getElementById('userChoice').innerText=`You chose: ${emoji(userChoice)}`;
    document.getElementById('computerChoice').innerText=`Computer chose: ${emoji(computerChoice)}`;

    const resultDiv=document.getElementById('result');

    if(userChoice===computerChoice){ resultDiv.innerText="Ayyo Draw iendhi rahh!"; drawSound();}
    else if(
        (userChoice==='rock' && computerChoice==='scissors') ||
        (userChoice==='paper' && computerChoice==='rock') ||
        (userChoice==='scissors' && computerChoice==='paper')
    ){ resultDiv.innerText="Gelichinav rahh! 🎉"; userScore++; winSound(); confetti({particleCount:100,spread:70,origin:{y:0.6}});}
    else{ resultDiv.innerText="Poindhirah reyy! 😢"; computerScore++; loseSound();}

    document.getElementById('userScore').innerText=userScore;
    document.getElementById('computerScore').innerText=computerScore;

    if(userScore===5||computerScore===5){ setTimeout(showGameOver,700); }
    setTimeout(()=>buttons.forEach(b=>b.disabled=false),1000);
}

function showGameOver(){
    document.getElementById('gameScreen').style.display='none';
    document.getElementById('gameOverScreen').style.display='flex';
    document.getElementById('gameOverMessage').innerText=
        userScore===5?"🎉 Gelichinav rahh!":"😢 Poindhirah reyy!";
    stopBackgroundMusic();
}

function resetGame(){
    userScore=0; computerScore=0;
    document.getElementById('userScore').innerText=0;
    document.getElementById('computerScore').innerText=0;
    document.getElementById('userChoice').innerText='';
    document.getElementById('computerChoice').innerText='';
    document.getElementById('result').innerText='';
    document.getElementById('gameOverScreen').style.display='none';
    document.getElementById('gameScreen').style.display='flex';
    startBackgroundMusic();
}
