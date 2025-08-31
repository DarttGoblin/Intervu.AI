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

function ActivateCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
        const video = document.createElement("video");
        video.classList.add('video-element');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video_container.appendChild(video);
        start_container.style.display = 'none';
        begin = true;
    })
    .catch(err => {
        console.error("Camera access denied:", err);
        alert("Camera access is required to continue the interview. Please enable it to proceed.");
        ActivateCamera();
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

// async function StartRecording() {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder = new MediaRecorder(stream);

//     mediaRecorder.ondataavailable = e => {
//         audioChunks.push(e.data);
//     };

//     mediaRecorder.onstop = () => {
//         const blob = new Blob(audioChunks, { type: 'audio/webm' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'recorded_audio.webm';
//         a.click();
//         audioChunks = [];
//     };

//     mediaRecorder.start();
// }

// function StopRecording() {
//     if (mediaRecorder) mediaRecorder.stop();
// }