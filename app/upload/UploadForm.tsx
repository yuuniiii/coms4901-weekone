"use client";

import { useState } from "react";
import { uploadAndGenerateCaptions } from "@/app/actions/imageActions";

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
      if (!SUPPORTED_TYPES.includes(selectedFile.type)) {
        setError("Unsupported file type. Please upload a JPEG, PNG, WEBP, GIF, or HEIC image.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setCaptions([]);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadAndGenerateCaptions(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.captions) {
      setCaptions(result.captions);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="image-upload" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Select Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Upload and Generate Captions"}
        </button>
      </form>

      {captions.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Generated Captions:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {captions.map((caption, index) => (
              <li
                key={index}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f9f9f9",
                  marginBottom: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #eee",
                }}
              >
                {caption}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
