from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import whisper

app = Flask(__name__)
model = whisper.load_model("base")
CORS(app)

@app.route("/stt", methods=["POST"])
def stt():
    audio_file = request.files["audio"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    text = result.get("text", "")

    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(debug=True)
