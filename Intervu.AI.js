const bot_container = document.querySelector('.bot-container');
const process_block = document.querySelectorAll('.process-block');
const bright_mode = document.querySelector('.bright-mode');
const start_container = document.querySelector('.start-container');
const start_interview = document.querySelector('.start-interview');
const watch_demo = document.querySelector('.watch-demo');
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

const questionsPerDuration = {
    "15": { total: 10, personal: 2, technical: 4, situational: 4 },
    "30": { total: 15, personal: 3, technical: 6, situational: 6 },
    "45": { total: 20, personal: 4, technical: 8, situational: 8 }
};

const initial_speech = "Hello, welcome to Intervu.ai. I'm your virtual interview assistant. \
I'll ask you a few questions to help you practice and improve your interview skills. So how \
do you feel?";

// const BACKEND_URL = 'https://e4dd7e71-6bfb-4a93-97ef-c2119e2fc968-00-14at7dda96n.picard.replit.dev:8000'; // not working currently
const BACKEND_URL = 'http://localhost:5000';

let user_time_allowed = 40;
let interviewEnded = false;
let initial_question = true;
let error_happened = false;
let begin = false;
let mode;
let duration;
let num_questions;
let question_index = 1;
let question;
let mediaRecorder;
let recordingTimeout;
let stream;
let audioChunks = [];
let scores = [];
let final_score;

GenerateFieldOptions();
BrightnessMode();


document.body.style.userSelect = 'none';
start_interview.onclick = function() {
    if (field_select.value == 'Choose a field' ||
        speciality_select.value == 'Choose a speciality' ||
        duration_select.value == 'Choose a duration') {
        alert('Field and a speciality and duration are required');
        return;
    }

    duration = duration_select.value;
    num_questions = parseInt(questionsPerDuration[duration].total) || 10;

    ActivateMedia();
    let waiting = setInterval(() => {
        if (begin) {
            Timer();
            BotState('Get Ready! 😊');
            TTS(initial_speech);
            clearInterval(waiting);
        }
    }, 500);
}

watch_demo.onclick = function() {
    window.open('https://drive.google.com/file/d/1Sca6_ZdL-0oa5RktWz7zrjE9Fq2A_gBx/view?usp=sharing', '_blank');
}