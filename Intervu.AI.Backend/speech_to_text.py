from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import tempfile
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)