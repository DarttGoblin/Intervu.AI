from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv

from gtts import gTTS
import speech_recognition as sr
import google.generativeai as genai

from pydub import AudioSegment
import tempfile
import json
import os
import io

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
app = Flask(__name__)
CORS(app)

questions_per_duration = {
    "15": 10,  # shorter interview → fewer questions
    "30": 15,  # medium interview → full 15 questions
    "45": 20   # longer interview → more questions
}

def save_interview_result(result):
    base_dir = "Intervu.AI.Media/interviews"
    os.makedirs(base_dir, exist_ok=True)
    files = [f for f in os.listdir(base_dir) if f.startswith("interview") and f.endswith(".json")]
    numbers = [int(f.replace("interview", "").replace(".json", "")) for f in files]

    if numbers:
        latest_num = max(numbers)
        file_path = os.path.join(base_dir, f"interview{latest_num}.json")
    else:
        latest_num = 1
        file_path = os.path.join(base_dir, "interview1.json")

    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = []
    
    if str(result.get("question_index")) == "1":
        latest_num = (max(numbers) + 1) if numbers else 1
        file_path = os.path.join(base_dir, f"interview{latest_num}.json")
        data = []
    data.append(result)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def reply_to_condidate(question, answer, question_index, condidate_field, condidate_speciality, num_questions):
    prompt = f"""
        You are an AI interview assistant for a virtual interview platform.

        The interview is structured as follows:
        - Questions 1 to {min(5, num_questions)}: Personal/behavioral questions
        - Questions {min(6, num_questions-9)} to {min(12, num_questions-3)}: Technical questions specific to the {condidate_speciality} speciality in {condidate_field} field 
        - Questions {min(13, num_questions-2)} to {num_questions}: Situational/hypothetical questions related to the {condidate_speciality} speciality in {condidate_field} field

        Task:
        1. Evaluate the candidate's response to the given question.
        2. Provide constructive feedback:
        - If the response contains mistakes, politely correct them in short and concise way.
        - If the response is correct, clarify it to give more depth in short and concise way.
        - In both cases, generate short and concise content, max 25 words.
        3. Assign a score out of 100 with a clear explanation of the evaluation.
        4. Generate the next interview question based on the current question index {question_index} and the interview structure above.

        Input:
        Question: "{question}"
        Response: "{answer.strip()}"

        Return the result strictly in this JSON format:
        {{
            "score": number,
            "explanation": "string",
            "feedback": "string (correction or clarification)",
            "next_question": "string"
        }}
        """

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        result = model.generate_content(contents=prompt, generation_config={"response_mime_type": "application/json"})
        return result.text
    
    except Exception as e:
        return {"error": str(e)}
    


@app.route("/tts", methods=["POST"])
def tts():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return {"error": "No text provided"}, 400

    tts = gTTS(text)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return send_file(buf, mimetype="audio/mpeg")




@app.route("/stt", methods=["POST"])
def stt():
    audio_file = request.files["audio"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_webm:
        audio_file.save(tmp_webm.name)
        webm_path = tmp_webm.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
        wav_path = tmp_wav.name
        audio = AudioSegment.from_file(webm_path, format="webm")
        audio.export(wav_path, format="wav")

    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_path) as source:
        audio_data = recognizer.record(source)
        try: text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError: text = ""

    return jsonify({"text": text})




@app.route("/reply", methods=["POST"])
def reply():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")
    index = data.get("index", "")
    condidate_field = data.get("condidate_field", "")
    condidate_speciality = data.get("condidate_speciality", "")
    num_questions = data.get("num_questions", "")
    result = reply_to_condidate(question, answer, index, condidate_field, condidate_speciality, num_questions)

    try:
        result_json = json.loads(result)
        score = result_json.get("score")
        explanation = result_json.get("explanation")
        feedback = result_json.get("feedback")
        next_question = result_json.get("next_question")

        print('score:', score)
        print('explanation:', explanation)
        print('feedback:', feedback)
        print('next_question:', next_question)

        save_interview_result({
            "question": question,
            "answer": answer,
            "question_index": index,
            "score": score,
            "explanation": explanation,
            "feedback": feedback,
            "next_question": next_question
        })

        return jsonify({
            "score": score,
            "explanation": explanation,
            "feedback": feedback,
            "next_question": next_question
        })

    except json.JSONDecodeError:
        return jsonify({
            "score": None,
            "explanation": result
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)