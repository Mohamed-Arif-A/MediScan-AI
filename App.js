import React, { useState } from "react";
import { marked } from "marked";

import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [condition, setCondition] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setCondition("");
    setAdvice("");
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image!");

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
const res = await fetch("http://127.0.0.1:8001/upload/", {
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


{advice && (
  <>
    <h2>Medical Advice</h2>
    <div
      className="advice-box"
      dangerouslySetInnerHTML={{ __html: marked(advice) }}
    />
  </>
)}


  
  return (
    <div className="App">
      <h1>MediScan AI 🩺</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <div className="spacer"></div> 
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload and Analyze"}
      </button>

      {condition && <h2>Detected Condition: {condition}</h2>}
      {advice && <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>{advice}</pre>}
    </div>
  );

}

export default App;
