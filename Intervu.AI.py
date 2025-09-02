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

def reply_to_condidate(question, answer, question_index, condidate_field, condidate_speciality):
    prompt = f"""
        You are an AI interview assistant for a virtual interview platform.

        The interview is structured as follows:
        - Questions 1 to 5: Personal/behavioral questions
        - Questions 6 to 12: Technical questions specific to the {condidate_speciality} speciality in {condidate_field} field 
        - Questions 13 to 15: Situational/hypothetical questions related to the {condidate_speciality} speciality in {condidate_field} field

        Task:
        1. Evaluate the candidate's response to the given question.
        2. Provide constructive feedback:
        - If the response contains mistakes, politely correct them.
        - If the response is correct, clarify or expand on it to give more depth.
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
    result = reply_to_condidate(question, answer, index, condidate_field, condidate_speciality)

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