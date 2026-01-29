document.addEventListener("DOMContentLoaded", function () {

  // SET PDF WORKER
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

  const pdfUpload = document.getElementById("pdfUpload");
  if (pdfUpload) {
    pdfUpload.addEventListener("change", loadPDF);
  }

});

// ---------- PDF LOADER ----------
async function loadPDF(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);

    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(" ");
    }

    document.getElementById("resume").value = fullText;
  };

  reader.readAsArrayBuffer(file);
}

// ---------- SKILL EXTRACTION ----------
function extractSkills(text) {
  const skills = [
    "javascript","python","java","c++","html","css",
    "react","node","sql","mongodb","git","ai","ml"
  ];

  text = text.toLowerCase();
  return skills.filter(skill => text.includes(skill));
}

// ---------- MATCH FUNCTION ----------
async function match() {
  const resumeText = document.getElementById("resume").value;
  const jobText = document.getElementById("job").value;

  if (!resumeText || !jobText) {
    alert("Please enter both Resume and Job Description!");
    return;
  }

  // Loading UI
  document.getElementById("result").innerHTML =
    "<p>Analyzing...</p>";

  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobText);

  let matched = resumeSkills.filter(skill =>
    jobSkills.includes(skill)
  );

  let score = 0;
  if (jobSkills.length > 0) {
    score = Math.round((matched.length / jobSkills.length) * 100);
  }

  const missing = jobSkills.filter(skill =>
    !resumeSkills.includes(skill)
  );

  // RESULT UI
  document.getElementById("result").innerHTML = `
    <div class="result-card">
      <h3>Match Score</h3>
      <p>${score}%</p>
    </div>

    <div class="result-card">
      <h3>Matched Skills</h3>
      <p>${matched.join(", ") || "None"}</p>
    </div>

    <div class="result-card">
      <h3>Missing Skills</h3>
      <p>${missing.join(", ") || "None"}</p>
    </div>
  `;

  // ---------- BACKEND SAVE ----------
  try {
    await fetch("http://127.0.0.1:5000/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText })
    });
    console.log("Saved to DB");
  } catch (error) {
    console.warn("Backend not running — skipping save");
  }
}
