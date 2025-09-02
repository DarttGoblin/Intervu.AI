from flask import Flask, request, send_file
from flask_cors import CORS
from gtts import gTTS
import io

app = Flask(__name__)
CORS(app)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)