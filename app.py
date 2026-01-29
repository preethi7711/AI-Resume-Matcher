from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_NAME = "data.db"

# ---------- INIT DATABASE ----------
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

# ---------- HOME ROUTE ----------
@app.route("/")
def home():
    return "Backend Running Successfully 🚀"

# ---------- SAVE RESUME ----------
@app.route("/save", methods=["POST"])
def save_resume():
    try:
        data = request.get_json()
        text = data.get("text", "")

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO resumes (text) VALUES (?)", (text,))
        conn.commit()
        conn.close()

        return jsonify({"status": "saved"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- VIEW ALL RESUMES ----------
@app.route("/resumes", methods=["GET"])
def get_resumes():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM resumes")
    rows = c.fetchall()
    conn.close()

    data = [{"id": r[0], "text": r[1]} for r in rows]
    return jsonify(data)

# ---------- RUN SERVER ----------
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
