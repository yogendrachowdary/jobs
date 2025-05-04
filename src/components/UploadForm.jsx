import React, { useState } from "react";
import axios from "axios";
import "./UploadForm.css"; // import the CSS

const ITEMS_PER_PAGE = 5;

function UploadForm() {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("Data Engineer");
  const [location, setLocation] = useState("India");
  const [results, setResults] = useState([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      alert("Please upload a resume first!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("role", jobRole);
    formData.append("location", location);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/match-jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { results, csv_download } = response.data;
      setResults(results);
      setDownloadLink(`http://localhost:5000${csv_download}`);
      setCurrentPage(1);
    } catch (err) {
      setError("Error uploading or processing the resume.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentJobs = results.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <label className="file-label">
          Upload Resume (PDF)
          <input type="file" onChange={handleFileChange} accept=".pdf" />
        </label>

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

      {error && <p className="error-msg">{error}</p>}

      {results.length > 0 && (
        <div className="table-container">
          <h2>Top Matching Jobs</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job, index) => (
                <tr key={index}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{job.location}</td>
                  <td>{job.score.toFixed(2)}%</td>
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
      )}
    </div>
  );
}

export default UploadForm;
