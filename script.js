let lastResult = {};

document.addEventListener("DOMContentLoaded", function () {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

  document.getElementById("pdfUpload")
    .addEventListener("change", loadPDF);
});

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

function extractSkills(text) {
  const skills = ["javascript","python","java","html","css","react","node","sql","mongodb","git","ai","ml"];
  text = text.toLowerCase();
  return skills.filter(skill => text.includes(skill));
}

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

  // SAVE TO BACKEND
  try {
    await fetch("http://127.0.0.1:5000/save", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ text: resumeText })
    });
  } catch (e) {
    console.warn("Backend not running");
  }
}

async function loadResumes() {
  try {
    const res = await fetch("http://127.0.0.1:5000/resumes");
    const data = await res.json();

    const container = document.getElementById("resumeHistory");

    if (data.length === 0) {
      container.innerHTML = "<p>No saved resumes yet.</p>";
      return;
    }

    let html = "<h3>Saved Resumes</h3>";
    data.forEach(item => {
      html += `
        <div class="result-card">
          ${item.text.substring(0, 120)}...
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {
    alert("Backend not running!");
  }
}

function generateReport() {
  if (!lastResult.score && lastResult.score !== 0) {
    alert("Run match first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Resume Feedback Report", 20, 20);
  doc.text(`Score: ${lastResult.score}%`, 20, 40);
  doc.text(`Matched: ${lastResult.matched.join(", ")}`, 20, 60);
  doc.text(`Missing: ${lastResult.missing.join(", ")}`, 20, 80);

  doc.save("feedback.pdf");
}
