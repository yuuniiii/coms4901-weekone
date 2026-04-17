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
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: "2rem" }}>
          <label 
            htmlFor="image-upload" 
            style={{ 
              display: "block", 
              marginBottom: "1rem", 
              fontWeight: "700",
              fontSize: "1.1rem",
              color: "#fff"
            }}
          >
            Select Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              border: "2px dashed #444",
              borderRadius: "16px",
              cursor: "pointer",
              backgroundColor: "#111",
              color: "#fff",
            }}
          />
        </div>

        {preview && (
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <img
              src={preview}
              alt="Preview"
              style={{ 
                maxWidth: "100%", 
                maxHeight: "400px", 
                borderRadius: "20px", 
                border: "1px solid #333",
                boxShadow: "0 0 30px rgba(45, 212, 191, 0.2)"
              }}
            />
          </div>
        )}

        {error && (
          <div style={{ 
            color: "#fff", 
            marginBottom: "1.5rem", 
            padding: "1rem", 
            backgroundColor: "rgba(251, 113, 133, 0.2)", 
            borderRadius: "12px", 
            border: "1px solid rgba(251, 113, 133, 0.4)",
            fontWeight: "600"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          style={{
            width: "100%",
            padding: "1.25rem 2rem",
            backgroundColor: loading || !file ? "#333" : "#2dd4bf",
            color: loading || !file ? "#666" : "#fff",
            border: "none",
            borderRadius: "100px",
            cursor: loading || !file ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "1.1rem",
            transition: "all 0.2s ease",
            boxShadow: loading || !file ? "none" : "0 0 20px rgba(45, 212, 191, 0.4)",
          }}
        >
          {loading ? "Generating Captions..." : "Upload and Generate Captions"}
        </button>
      </form>

      {captions.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h3 style={{ 
            marginBottom: "1.5rem", 
            paddingBottom: "1rem",
            fontSize: "1.5rem",
            fontWeight: "800",
            letterSpacing: "-0.02em",
            borderBottom: "1px solid #222",
            color: "#fff",
            fontFamily: "var(--font-display)"
          }}>
            Generated Captions:
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {captions.map((caption, index) => (
              <div
                key={caption.id || index}
                style={{
                  padding: "1.25rem 1.5rem",
                  backgroundColor: "#0d0d0d",
                  borderRadius: "16px",
                  border: "1px solid #222",
                  lineHeight: "1.5",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 0 15px rgba(251, 191, 36, 0.1)"
                }}
              >
                {caption.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
