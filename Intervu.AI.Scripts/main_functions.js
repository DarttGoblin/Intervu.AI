function TTS(text) {
    fetch("http://127.0.0.1:5000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = 1.3;
        audio.play();
        SlowTyping(initial_speech.split(""), text_container);
        bot_container.classList.add('glowing'); 
        audio.addEventListener("ended", () => {
            bot_container.classList.remove('glowing'); 
        });

        // StartRecording();
    })
    .catch(err => console.error(err));
}

function STT(audio) {
}

function EvaluateUserResponse(response) {
}

function ReplyToCondidate() {

}