const bot_container = document.querySelector('.bot-container');
const process_block = document.querySelectorAll('.process-block');
const start_container = document.querySelector('.start-container');
const start_interview = document.querySelector('.start-interview');
const field_select = document.querySelector('.field-select');
const speciality_select = document.querySelector('.speciality-select');
const duration_select = document.querySelector('.duration-select');
const video_container = document.querySelector('.video-container');
const text_container = document.querySelector('.text-container');
const time_span = document.querySelector('.time-span');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

const field_options = [
    "Choose a field",
    "Machine Learning",
    "Cybersecurity",
    "Robotics",
    "Design"
];

const speciality_map = {
    "Machine Learning": [
        "Computer Vision",
        "Natural Language Processing",
        "Reinforcement Learning",
        "Generative Models"
    ],
    "Cybersecurity": [
        "Network Security",
        "Cryptography",
        "Ethical Hacking",
        "Malware Analysis"
    ],
    "Robotics": [
        "Autonomous Navigation",
        "Human-Robot Interaction",
        "Robot Perception",
        "Control Systems"
    ],
    "Design": [
        "UI/UX Design",
        "Graphic Design",
        "Product Design",
        "3D Modeling"
    ]
};

const initial_speech = "Hello, welcome to Intervu.ai. I'm your virtual interview assistant. \
I'll ask you a few questions to help you practice and improve your interview skills. So how \
do you feel?";

const last_speech = "Thank you so much for completing this interview with Intervu.ai. I really \
appreciate your time and effort today. Wishing you the best of luck in your future interviews!";

let initial_question = true;
let begin = false;
let question_index = 1;
let question;
let audioChunks = [];
let mediaRecorder;
let stream;

GenerateFieldOptions();

start_interview.onclick = function() {
    if (field_select.value == 'Choose a field' && 
        speciality_select.value == 'Choose a speciality' &&
        duration_select.value == 'Choose a duration') {
        alert('Field and a speciality and duration are required');
        return;
    }

    ActivateMedia();
    let waiting = setInterval(() => {
        if (begin) {
            Timer();
            MovableVideo();
            TTS(initial_speech);
            clearInterval(waiting);
        }
    }, 500);
}