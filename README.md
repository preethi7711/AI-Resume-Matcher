AI Resume & Job Matcher 🚀

An AI-powered web application that analyzes resumes, matches them with job descriptions, and generates intelligent feedback reports.
Built as a full-stack hackathon project using Flask, JavaScript, SQLite, and Ollama (Llama 3 / Phi-3).

Features

📄 Upload Resume (PDF or Text)

🧠 AI Resume Feedback (Local LLM – Ollama)

📊 Match Score Calculation

✅ Matched Skills Detection

❌ Missing Skills Identification

🗂 Resume History (Database Storage)

📥 Download AI Career Report (PDF)

🎨 Modern UI with Background & Glass Effects

🔒 Offline AI – No API Keys Needed

Tech Stack

Frontend

HTML

CSS

JavaScript

jsPDF

PDF.js

Backend

Python

Flask

Flask-CORS

SQLite

AI

Ollama

Llama 3 / Phi-3 Models

Project Structure
AI-Resume-Matcher/
│
├── index.html
├── style.css
├── script.js
├── app.py
├── data.db (auto-generated)
└── README.md

Installation & Setup
1. Clone Project
git clone <your-repo-url>
cd AI-Resume-Matcher

2. Install Python Dependencies
pip install flask flask-cors

AI Setup (Ollama)
Install Ollama

Download from:

https://ollama.com/download

Pull AI Model
ollama pull llama3


Optional (lighter model for slower laptops):

ollama pull phi3

Running the Application
Start Backend
python app.py


Backend runs at:

http://127.0.0.1:5000

Start Frontend

Open index.html using Live Server in VS Code
or simply double-click the file.

Usage Flow

Upload or paste resume

Paste job description

Click Match Resume

Click Get AI Feedback

Download AI Career Report PDF

View saved resumes anytime

PDF Report Includes

Match Score %

Matched Skills

Missing Skills

AI Feedback Suggestions