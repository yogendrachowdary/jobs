import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./UploadForm.css";
import { FiUpload } from "react-icons/fi";
import { useEffect } from "react";

const DEFAULT_ITEMS_PER_PAGE = 10;
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

function UploadForm() {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("Data Engineer");
  const [location, setLocation] = useState("India");
  const [results, setResults] = useState([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
    if (file) toast.success("Resume uploaded successfully!");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
      toast.success("Resume uploaded via drag & drop!");
    } else {
      toast.error("Please drop a valid PDF file.");
    }
  };

  const removeResume = () => {
    setResume(null);
    toast("Resume removed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Resume is required. Please upload your resume.");
      return;
    }

    if (!jobRole.trim() || !location.trim()) {
      toast.error("Please fill in both the job role and location fields.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("role", jobRole);
    formData.append("location", location);

    try {
      setLoading(true);
      const response = await axios.post("https://job-search-x00b.onrender.com/api/match-jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { results, csv_download_url } = response.data;
      setDownloadLink(csv_download_url); 
      setResults(results);
      setCurrentPage(1);
      toast.success("Jobs matched successfully!");
    } catch (err) {
      toast.error("Error uploading or processing the resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentJobs = results.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const columnOrder = [
    "title",
    "company",
    "location",
    "AI_Score",
    "via",
    "Apply Link",
    "suggestions",
    "strengths",
    "weaknesses"
  ];

  const [backendStatus, setBackendStatus] = useState("connecting");

useEffect(() => {
  const checkHealth = async () => {
    try {
      const res = await axios.get("https://job-search-x00b.onrender.com/api/health");
      if (res.status === 200 && res.data.status === "healthy") {
        setBackendStatus("healthy");
      } else {
        setBackendStatus("unhealthy");
      }
    } catch (err) {
      setBackendStatus("unhealthy");
    }
  };

  checkHealth(); // first check
  const interval = setInterval(checkHealth, 7000); // repeat every 7 sec

  return () => clearInterval(interval); // cleanup on unmount
}, []);

  return (
    <div className="upload-container">
    <div className="backend-status">
  {backendStatus === "connecting" && (
    <p className="status connecting">🔄 Connecting to backend...</p>
  )}
  {backendStatus === "healthy" && (
    <p className="status healthy">✅ Backend is active</p>
  )}
  {backendStatus === "unhealthy" && (
    <p className="status unhealthy">❌ Backend is not responding</p>
  )}
</div>
      <form onSubmit={handleSubmit} className="upload-form">
      <label className="file-label">
        <FiUpload style={{ marginRight: "8px" }} />
        Upload Resume (PDF)
        <input type="file" onChange={handleFileChange} accept=".pdf" />
      </label>


        {/* Drag and Drop Zone */}
        <div
          className="drag-drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p>📂 Or drag & drop your resume here (PDF only)</p>
        </div>

        {resume && (
          <div className="file-info">
            <span>📄 {resume.name}</span>
            <button className="remove-btn" type="button" onClick={removeResume}>Remove</button>
          </div>
        )}

        <input
          type="text"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="Job Role"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
        />
        <button type="submit" className="submit-btn">
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Matching jobs and ranking them using AI... Please wait a moment.</p>
        </div>
      ) : (
        results.length > 0 && (
          <div className="table-container">
            <div className="table-header">
              <h2>Top Matching Jobs</h2>
              <div className="rows-per-page">
                <label htmlFor="itemsPerPage">Rows per page:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="styled-table">
              <thead>
                <tr>
                  {columnOrder.map((key) => (
                    <th key={key}>{key.charAt(0).toUpperCase() + key.replaceAll('_', ' ').slice(1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
  {currentJobs.map((job, index) => (
    <tr key={index}>
      {columnOrder.map((key) => (
        <td key={key}>
          {key === "Apply Link" ? (
            job[key] ? (
              <a href={job[key]} target="_blank" rel="noopener noreferrer" className="apply-link">
                Apply Here
              </a>
            ) : (
              "No Link"
            )
          ) : typeof job[key] === "number" && key.toLowerCase().includes("score") ? (
            `${job[key].toFixed(2)}%`
          ) : (
            job[key]
          )}
        </td>
      ))}
    </tr>
  ))}
</tbody>

            </table>

            <div className="pagination">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>

            {downloadLink && (
              <a href={downloadLink} className="download-link" download>
                Download CSV
              </a>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default UploadForm;
