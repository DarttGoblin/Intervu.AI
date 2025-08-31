from flask import Flask, request, send_file
from gtts import gTTS
import io

app = Flask(__name__)

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
    app.run(debug=True)
