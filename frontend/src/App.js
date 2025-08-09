import React, { useState } from "react";
import { marked } from "marked";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState("");
  const [condition, setCondition] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setCondition("");
    setAdvice("");
  };

  const handleLanguageChange = (e) => {
    setLang(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setCondition(data.condition);
      setAdvice(data.advice);
    } catch (error) {
      setAdvice("❌ Failed to get advice from server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>MediScan AI 🩺</h1>

      <label htmlFor="lang-select">Choose Language: </label>
      <select id="lang-select" value={lang} onChange={handleLanguageChange}>
        <option value="tamil">Tamil</option>
        <option value="english">English</option>
        <option value="tanglish">Tanglish</option>
      </select>

      <div className="spacer"></div>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <div className="spacer"></div>

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload and Analyze"}
      </button>

      {condition && <h2>Detected Condition: {condition}</h2>}
      {advice && (
        <>
          <h2>Medical Advice</h2>
          <div
            className="advice-box"
            dangerouslySetInnerHTML={{ __html: marked(advice) }}
          />
        </>
      )}
    </div>
  );
}

export default App;


//Command for running Terminal
//uvicorn main:app --backend ---cd backend
//npm run start --frontend ---cd frontend






