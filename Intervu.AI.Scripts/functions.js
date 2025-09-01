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
        SlowTyping(text.split(""), text_container);
        bot_container.classList.add('glowing'); 
        audio.addEventListener("ended", () => {
            bot_container.classList.remove('glowing');
            StartRecording();
        });
    })
    .catch(err => console.error(err));
}

function STT(audio) {
    const formData = new FormData();
    formData.append("audio", audio, "recorded_audio.webm");

    fetch("http://127.0.0.1:5000/stt", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        EvaluateUserResponse(data.text);
    })
    .catch(err => console.error("STT error:", err));
}

function EvaluateUserResponse(question, answer) {
    if (initial_question) {
        question = initial_speech;
        initial_question = false;
    }

    fetch("http://127.0.0.1:5000/evaluate", {
        method: "POST",
        body: JSON.stringify({ question, answer }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        console.log('score: ', data.score);
        console.log('explanation: ', data.explanation);
        ReplyToCondidate(question_index);
    })
    .catch(err => console.error("STT error:", err));
}

function ReplyToCondidate(index) {
    question = 'this is my repley';
    TTS(question);
    return index++;
}

function GenerateFieldOptions() {
    field_options.forEach(option_value => {
        const option = document.createElement('option');
        option.textContent = option_value;
        option.value = option_value;
        field_select.appendChild(option);
    });

    field_select.addEventListener("change", e => {
        GenerateSpecialityOptions(e.target.value);
    });
}

function GenerateSpecialityOptions(field) {
    speciality_select.innerHTML = "";
    const options = speciality_map[field] || [];

    const default_option = document.createElement('option');
    default_option.textContent = "Choose a speciality";
    default_option.value = "Choose a speciality";
    speciality_select.appendChild(default_option);

    options.forEach(option_value => {
        const option = document.createElement('option');
        option.textContent = option_value;
        option.value = option_value;
        speciality_select.appendChild(option);
    });
}

function Timer() {
    let totalSeconds = duration_select.value * 60;
    let red = true;

    const interval = setInterval(() => {
        if (!begin) {return;}

        let mins = Math.floor(totalSeconds / 60);
        let secs = totalSeconds % 60;

        minutes.textContent = mins > 9 ? mins : '0' + mins;
        seconds.textContent = secs > 9 ? secs : '0' + secs;

        totalSeconds--;

        if (totalSeconds < 0) {
            clearInterval(interval);
            TTS(last_speech);
        }

        if (mins < 5) {
            if (red) {time_span.style.color = 'red';}
            else {time_span.style.color = 'black';}
            red = !red;
        }
    }, 1000);
}

function MovableVideo() {
    let offsetX, offsetY, isDragging = false;

    video_container.addEventListener("mousedown", e => {
        isDragging = true;
        offsetX = e.clientX - video_container.offsetLeft;
        offsetY = e.clientY - video_container.offsetTop;
    });

    document.addEventListener("mousemove", e => {
    if (isDragging) {
        video_container.style.position = "absolute";
        video_container.style.left = (e.clientX - offsetX) + "px";
        video_container.style.top = (e.clientY - offsetY) + "px";
    }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

function SlowTyping(samples_letters, location) {
    for (var i = 0; i < samples_letters.length; i++) {
        (function(index) {
            setTimeout(() => { location.innerHTML += samples_letters[index]; }, 50 * index);
        })(i);
    }
}

async function ActivateMedia() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const video = document.createElement("video");
        video.classList.add('video-element');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video_container.appendChild(video);
        start_container.style.display = 'none';
        begin = true;

    } catch (err) {
        console.error("Camera/Mic access denied:", err);
        alert("Camera and microphone access are required to continue the interview. Please enable them to proceed.");
        ActivateMedia();
    }
}

function StartRecording() {
    if (!stream) return;

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        STT(blob);
        audioChunks = [];
    };

    mediaRecorder.start();
    console.log('recording');
}

function StopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log('record');
    }
}