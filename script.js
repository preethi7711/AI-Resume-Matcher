let lastResult = {};
let lastAIFeedback = "";

document.addEventListener("DOMContentLoaded", function () {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

  document.getElementById("pdfUpload").addEventListener("change", loadPDF);
});

// -------- PDF LOAD --------
async function loadPDF(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ");
    }

    document.getElementById("resume").value = text;
  };

  reader.readAsArrayBuffer(file);
}

// -------- SKILL EXTRACTION --------
function extractSkills(text) {
  const skills = ["javascript","python","java","html","css","react","node","sql","mongodb","git","ai","ml"];
  text = text.toLowerCase();
  return skills.filter(skill => text.includes(skill));
}

// -------- MATCH --------
async function match() {
  const resumeText = document.getElementById("resume").value;
  const jobText = document.getElementById("job").value;

  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobText);

  const matched = resumeSkills.filter(s => jobSkills.includes(s));
  const missing = jobSkills.filter(s => !resumeSkills.includes(s));
  const score = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;

  lastResult = { score, matched, missing };

  document.getElementById("result").innerHTML = `
    <div class="result-card"><h3>Score</h3>${score}%</div>
    <div class="result-card"><h3>Matched</h3>${matched.join(", ") || "None"}</div>
    <div class="result-card"><h3>Missing</h3>${missing.join(", ") || "None"}</div>
  `;

  try {
    await fetch("http://127.0.0.1:5000/save", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ text: resumeText })
    });
  } catch {
    console.warn("Backend not running");
  }
}

// -------- LOAD SAVED --------
async function loadResumes() {
  const res = await fetch("http://127.0.0.1:5000/resumes");
  const data = await res.json();

  document.getElementById("resumeHistory").innerHTML =
    data.map(r => `<div class="result-card">${r.text.substring(0,100)}...</div>`).join("");
}

// -------- MATCH REPORT PDF --------
function generateReport() {
  if (!lastResult.score && lastResult.score !== 0) {
    alert("Run match first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Match Score: ${lastResult.score}%`, 20, 20);
  doc.text(`Matched Skills: ${lastResult.matched.join(", ")}`, 20, 40);
  doc.text(`Missing Skills: ${lastResult.missing.join(", ")}`, 20, 60);

  doc.save("Match-Report.pdf");
}

// -------- AI FEEDBACK --------
async function getAIFeedback() {
  const text = document.getElementById("resume").value;
  const aiBox = document.getElementById("aiBox");

  aiBox.innerHTML = "AI analyzing...";

  try {
    const res = await fetch("http://127.0.0.1:5000/ai-feedback", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    let feedback = data.feedback;

    lastAIFeedback = feedback;

    feedback = feedback
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/-/g, "•")
      .replace(/\n/g, "<br>");

    aiBox.innerHTML = `
      <div class="result-card">
        <h3>AI Resume Feedback</h3>
        <p>${feedback}</p>
      </div>
    `;

  } catch {
    aiBox.innerHTML = "AI Error!";
  }
}

// -------- COMPLETE AI CAREER REPORT PDF --------
function downloadAIFeedback() {
  if (!lastAIFeedback) {
    alert("Generate AI feedback first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("AI Resume Career Report", 20, 20);

  doc.setFontSize(12);

  doc.text(`Match Score: ${lastResult.score || 0}%`, 20, 40);

  doc.text("Matched Skills:", 20, 55);
  doc.text(doc.splitTextToSize(lastResult.matched.join(", ") || "None", 170), 20, 65);

  doc.text("Missing Skills:", 20, 85);
  doc.text(doc.splitTextToSize(lastResult.missing.join(", ") || "None", 170), 20, 95);

  doc.text("AI Feedback:", 20, 120);
  const feedbackLines = doc.splitTextToSize(lastAIFeedback, 170);
  doc.text(feedbackLines, 20, 130);

  doc.save("AI-Career-Report.pdf");
}
