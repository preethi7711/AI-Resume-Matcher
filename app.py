from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS resumes (id INTEGER PRIMARY KEY, text TEXT)")
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return "Backend Running"

@app.route("/save", methods=["POST"])
def save_resume():
    text = request.json["text"]
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("INSERT INTO resumes(text) VALUES (?)", (text,))
    conn.commit()
    conn.close()
    return jsonify({"status":"saved"})

@app.route("/resumes")
def get_resumes():
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT * FROM resumes")
    rows = c.fetchall()
    conn.close()
    return jsonify([{"id":r[0],"text":r[1]} for r in rows])

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
