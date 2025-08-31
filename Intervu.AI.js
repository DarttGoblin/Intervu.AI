const process_block = document.querySelectorAll('.process-block');
const start_interview = document.querySelector('.start-interview');
const video_container = document.querySelector('.video-container');
const text_container = document.querySelector('.text-container');
const time_span = document.querySelector('.time-span');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

let duration = 5;

process_block[0].style.backgroundColor = 'rgb(33, 104, 192)';

start_interview.onclick = function() {
    ActivateCamera();
    Timer();
    // SendToApi();
    TTS('This is a sample text to be the placeholder for the api response and it will be repeated many times');
    // SendToApi();
}

function TypeApiAnswer() {

}

function TTS(text) {
    fetch("/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    })
    .catch(err => console.error(err));
}

// Example usage:
sendText("Hello, this is a test!");


function ActivateCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
        const video = document.createElement("video");
        video.classList.add('video-element');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video_container.appendChild(video);
        start_interview.style.display = 'none';
    })
    .catch(err => {
        console.error("Camera access denied:", err);
        alert("Camera access is required to continue the interview. Please enable it to proceed.");
        ActivateCamera();
    });
}

function Timer() {
    let totalSeconds = duration * 60;
    let red = true;

    const interval = setInterval(() => {
        let mins = Math.floor(totalSeconds / 60);
        let secs = totalSeconds % 60;

        minutes.textContent = mins > 9 ? mins : '0' + mins;
        seconds.textContent = secs > 9 ? secs : '0' + secs;

        totalSeconds--;

        if (totalSeconds < 0) {
            clearInterval(interval);
            alert("Time is up!");
        }

        if (mins < 5) {
            if (red) {time_span.style.color = 'red';}
            else {time_span.style.color = 'black';}
            red = !red;
        }
    }, 1000);
}