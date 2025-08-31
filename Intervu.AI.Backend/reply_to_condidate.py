def repley_to_condidate(question_index, condidate_category):
    prompt = f"""
        You are an AI interview assistant generating the next question for a candidate applying for the position of {condidate_category}.
        
        The interview consists of:
        - Questions 1 to 5: Personal/behavioral questions
        - Questions 6 to 12: Technical questions specific to the {condidate_category} role
        - Questions 13 to 15: Situational/hypothetical questions related to the {condidate_category} domain

        Given that the current question index is {question_index}, generate ONE clear and concise interview question from the appropriate category.

        Return ONLY the question text, without any extra explanation or numbering.
    """

    messages = [{"role": "user", "content": prompt}]
    try:
        response = client.chat.completions.create(
            model=chat_deployment,
            messages=messages,
            temperature=0.7,
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"