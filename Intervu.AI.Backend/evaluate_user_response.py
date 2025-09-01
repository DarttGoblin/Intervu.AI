import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
app = Flask(__name__)
CORS(app)

def evaluate_user_response(question, response):
    prompt = f"""
    You are an AI language evaluator for a virtual interview platform.
    Evaluate the following transcribed response from a candidate.
    
    Question: "{question}"
    Response: "{response.strip()}"

    Return the result strictly in this JSON format:
    {{
        "score": number (out of 100),
        "explanation": string (explain the score clearly)
    }}

    Focus on clarity, relevance to the question, vocabulary, fluency, and grammar.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        result = model.generate_content(contents=prompt)
        return result.text.strip()
    except Exception as e:
        return {"error": str(e)}

@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")

    result = evaluate_user_response(question, answer)

    try:
        import json
        result_json = json.loads(result)
        score = result_json.get("score")
        explanation = result_json.get("explanation")
        return jsonify({
            "score": score,
            "explanation": explanation
        })
    except json.JSONDecodeError:
        return jsonify({
            "score": None,
            "explanation": result
        })

if __name__ == "__main__":
    app.run(debug=True)