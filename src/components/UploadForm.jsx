import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./UploadForm.css";

const ITEMS_PER_PAGE = 5;

function UploadForm() {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("Data Engineer");
  const [location, setLocation] = useState("India");
  const [results, setResults] = useState([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
    if (file) toast.success("Resume uploaded successfully!");
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
      const response = await axios.post("http://localhost:5000/api/match-jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { results, csv_download } = response.data;
      setResults(results);
      setDownloadLink(`http://localhost:5000${csv_download}`);
      setCurrentPage(1);
      toast.success("Jobs matched successfully!");
    } catch (err) {
      toast.error("Error uploading or processing the resume.");
    } finally {
      setLoading(false);
    }
  };

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
