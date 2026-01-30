from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import subprocess

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

# ---------------- AI FEEDBACK (OLLAMA) ----------------
@app.route("/ai-feedback", methods=["POST"])
def ai_feedback():
    try:
        text = request.json["text"][:1500]  # limit length

        prompt = f"""
Give short resume feedback in 5 clean bullet points.
No emojis. No markdown.

Resume:
{text}
"""

        result = subprocess.run(
            ["ollama", "run", "llama3", prompt],
            capture_output=True,
            text=True
        )

        feedback = result.stdout.strip()

        if not feedback:
            feedback = "AI did not return feedback."

        return jsonify({"feedback": feedback})

    except Exception as e:
        return jsonify({"feedback": str(e)})

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
