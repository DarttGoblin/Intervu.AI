def evaluate_user_response(user_response_text):
    prompt = f"""
        You are an AI language evaluator for a virtual interview platform.
        Evaluate the following transcribed response from a candidate.
        
        Question: "{question.strip()}"
        Response: "{user_response_text.strip()}"

        Return the result strictly in this JSON format:
        {{
            "score": number (out of 100),
            "explanation": string (explain the score clearly)
        }}

        Focus on clarity, relevance to the question, vocabulary, fluency, and grammar.
    """

    messages = [{"role": "user", "content": prompt}]
    try:
        response = client.chat.completions.create(
            model=chat_deployment,
            messages=messages,
            temperature=0.0,
            max_tokens=1000
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"