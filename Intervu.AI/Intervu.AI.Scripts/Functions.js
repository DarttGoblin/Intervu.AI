function TTS(text) {
    fetch("http://127.0.0.1:5000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const bot_audio = new Audio(url);
        bot_audio.playbackRate = 1.3;
        bot_audio.volume = 1;
        bot_audio.play();
        text_container.innerHTML = '';
        SlowTyping(text.split(""));
        bot_container.classList.add('glowing'); 
        bot_audio.addEventListener("ended", () => {
            bot_container.classList.remove('glowing');
            if (text == LastSpeech()) {return;}
            if (interviewEnded) {TTS(LastSpeech());}
            StartRecording();
        });
    })
    .catch(err => {
            console.error(err);
            SlowTyping("The backend server is not running. Will be soon! Watch demo instead.");
            // SlowTyping("Oops! Something went wrong on my side. Don't worry, it's not your fault, please try again and I'll get us back on track!");
        }
    );
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
        console.log('user response: ', data.text);
        ReplyToCondidate(question, data.text, question_index, field_select.value, speciality_select.value, num_questions);
    })
    .catch(err => 
        {
            console.error("STT error:", err)
            SlowTyping("The backend server is not running. Will be soon! Watch demo instead.");
            // SlowTyping("Oops! Something went wrong on my side. Don't worry, it's not your fault, please try again and I'll get us back on track!");
        });
}

function ReplyToCondidate(question, answer, index, condidate_field, condidate_speciality, num_questions) {
    if (initial_question) {
        question = initial_speech;
        initial_question = false;
    }

    fetch("http://127.0.0.1:5000/reply", {
        method: "POST",
        body: JSON.stringify({ question, answer, index, condidate_field, condidate_speciality, num_questions }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        next_question = data.next_question;
        scores.push(Number(data.score));

        question = data.next_question;
        TTS(data.feedback + " " + data.next_question);

        CheckProgress();
        question_index = question_index + 1;
        return question_index; 
    })
    .catch(err => {
        console.error("STT error:", err)
        SlowTyping("The backend server is not running. Will be soon! Watch demo instead.");
        // SlowTyping("Oops! Something went wrong on my side. Don't worry, it's not your fault, please try again and I'll get us back on track!");
    });

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
            EndInterview();
        }

        if (mins < 5) {
            if (red) {
                time_span.classList.remove('black');
                time_span.classList.add('red');
            }
            else {
                time_span.classList.remove('red');
                time_span.classList.add('black');
            }
            red = !red;
        }
    }, 10);
}

function SlowTyping(text_letters) {
    const bot_response = document.createElement('span');
    bot_response.classList.add('text-container-span');
    text_container.innerHTML = '';
    text_container.appendChild(bot_response);

    for (var i = 0; i < text_letters.length; i++) {
        (function(index) {
            setTimeout(() => { bot_response.textContent += text_letters[index]; }, 50 * index);
        })(i);
    }
}

async function ActivateMedia() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: { 
                echoCancellation: true, 
                noiseSuppression: true, 
                autoGainControl: true 
            }
        });

        const video = document.createElement("video");
        video.classList.add('video-element');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
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
        if (interviewEnded) {return;}

        clearTimeout(recordingTimeout);
        text_container.innerHTML = '';
        BotState('Thinking...');

        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        STT(blob);
        audioChunks = [];
    };

    mediaRecorder.start();
    console.log('recording has started');
    FinishButton();

    recordingTimeout = setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            console.log("Recording stopped automatically after 1 minute.");
        }
    }, user_time_allowed * 1000);
}

function FinishButton() {
    const finished = document.createElement('button');
    finished.textContent = 'Im finished';
    finished.classList.add('finished');
    text_container.appendChild(finished);

    finished.onclick = function() {
        mediaRecorder.stop();
        console.log('recording has finished');
    }
}

function CheckProgress() {
    const split = questionsPerDuration[duration];
    const personalEnd = split.personal;
    const technicalEnd = personalEnd + split.technical;
    const situationalEnd = technicalEnd + split.situational;

    if (question_index === personalEnd) {process_block[0].classList.add('achieved-process');} 
    else if (question_index === technicalEnd) {process_block[1].classList.add('achieved-process');} 
    else if (question_index === situationalEnd) {
        process_block[2].classList.add('achieved-process');
        EndInterview();
        TTS(LastSpeech());
    }
}

function BotState(state) {
    const bot_state_span = document.createElement('span');
    bot_state_span.textContent = state;
    bot_state_span.classList.add('bot-state-span');
    text_container.innerHTML = '';
    text_container.appendChild(bot_state_span);
}

function BrightnessMode() {
    let mode = localStorage.getItem('mode');

    if (mode === null || mode === 'dark') {
        document.body.classList.add('dark-mode');
        bright_mode.src = 'Intervu.AI.Media/bright.png';
        localStorage.setItem('mode', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        bright_mode.src = 'Intervu.AI.Media/dark.png';
    }

    bright_mode.onclick = function () {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            bright_mode.src = 'Intervu.AI.Media/dark.png';
            localStorage.setItem('mode', 'light');
        } else {
            document.body.classList.add('dark-mode');
            bright_mode.src = 'Intervu.AI.Media/bright.png';
            localStorage.setItem('mode', 'dark');
        }
    };
}

function EndInterview() {
    interviewEnded = true;
    begin = false;
    if (mediaRecorder && mediaRecorder.state === "recording") {mediaRecorder.stop();}
    if (stream) {stream.getTracks().forEach(track => track.stop());}
    video_container.innerHTML = '';
    CalculateScore();
}

function CalculateScore() {
    let scores_sum = scores.reduce((a, b) => a + b, 0);
    final_score = (scores_sum / num_questions).toFixed(0); 
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

function LastSpeech() {
    return `The interview has ended, your score is ${final_score}/100, thank you so \
        much for completing this interview with Intervu.ai. I really appreciate your time and effort \
        today. Wishing you the best of luck in your future interviews!`;
}