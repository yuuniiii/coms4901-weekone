"use client";

import { useState, useEffect } from "react";
import { uploadAndGenerateCaptions } from "@/app/actions/imageActions";

// Define the shape of the caption returned by the server
interface CaptionRecord {
  id: string;
  content: string;
}

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
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<CaptionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Clean up the object URL when the component unmounts or file changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setCaptions([]);

    if (selectedFile) {
      if (!SUPPORTED_TYPES.includes(selectedFile.type)) {
        setError("Unsupported file type. Please upload a JPEG, PNG, WEBP, GIF, or HEIC image.");
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
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
      // Assuming result.captions is CaptionRecord[] as per requirements
      setCaptions(result.captions as any);
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

        {preview && (
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "4px", border: "1px solid #eee" }}
            />
          </div>
        )}

        {error && (
          <div style={{ color: "red", marginBottom: "1rem", padding: "0.5rem", backgroundColor: "#fff5f5", borderRadius: "4px", border: "1px solid #feb2b2" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Generating Captions..." : "Upload and Generate Captions"}
        </button>
      </form>

      {captions.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", borderBottom: "2px solid #0070f3", paddingBottom: "0.5rem" }}>
            Generated Captions:
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {captions.map((caption, index) => (
              <li
                key={caption.id || index}
                style={{
                  padding: "1rem",
                  backgroundColor: "#f9f9f9",
                  marginBottom: "0.75rem",
                  borderRadius: "4px",
                  border: "1px solid #eee",
                  lineHeight: "1.5",
                }}
              >
                {caption.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
