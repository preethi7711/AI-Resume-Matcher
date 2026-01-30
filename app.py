from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import requests

app = Flask(__name__)
CORS(app)

DB_NAME = "data.db"

# ---------------- DATABASE INIT ----------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT
        )
    """)
    conn.commit()
    conn.close()

# ---------------- HOME ROUTE ----------------
@app.route("/")
def home():
    return "Backend Running 🚀"

# ---------------- SAVE RESUME ----------------
@app.route("/save", methods=["POST"])
def save_resume():
    try:
        text = request.json["text"]

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO resumes (text) VALUES (?)", (text,))
        conn.commit()
        conn.close()

        return jsonify({"status": "saved"})

    except Exception as e:
        return jsonify({"error": str(e)})

# ---------------- GET RESUMES ----------------
@app.route("/resumes", methods=["GET"])
def get_resumes():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM resumes")
    rows = c.fetchall()
    conn.close()

    data = [{"id": r[0], "text": r[1]} for r in rows]
    return jsonify(data)

# ---------------- AI FEEDBACK ----------------
OPENROUTER_API_KEY = "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"

@app.route("/ai-feedback", methods=["POST"])
def ai_feedback():
    try:
        text = request.json["text"]

        prompt = f"""
Give resume feedback in clean bullet points.
No markdown. No emojis.
Sections:
- Strengths
- Missing Skills
- Improvements

Resume:
{text}
"""

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/mistral-7b-instruct",
                "messages": [
                    {"role": "system", "content": "You are a professional resume coach."},
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=30
        )

        data = response.json()

        # Safe extraction
        feedback = data.get("choices", [{}])[0].get("message", {}).get("content", "No feedback generated.")

        return jsonify({"feedback": feedback})

    except Exception as e:
        return jsonify({"feedback": str(e)})

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
