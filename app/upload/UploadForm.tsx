"use client";

import { useState, useEffect, useRef } from "react";
import { uploadAndGenerateCaptions } from "@/app/actions/imageActions";
import { submitVote } from "@/app/actions/vote";
import styles from "./UploadForm.module.css";

// Define the shape of the caption returned by the server
interface CaptionRecord {
  id: string;
  content: string;
}

type VoteType = 'up' | 'down' | null;

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

const STATUS_MESSAGES = [
  "Uploading image…",
  "Analyzing image features…",
  "Finding the funny…",
  "Making jokes…",
  "Crafting punchlines…",
  "Almost there…",
  "Putting it all together…",
];

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [captions, setCaptions] = useState<CaptionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [votes, setVotes] = useState<Record<string, VoteType>>({});
  const [votingLoading, setVotingLoading] = useState<Record<string, boolean>>({});

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up the object URL when the component unmounts or file changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setCaptions([]);
    setVotes({});

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
    setStatusIndex(0);
    setProgress(0);
    setError(null);
    setCaptions([]);
    setVotes({});

    // Start loading interval
    intervalRef.current = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) return prev + 1;
        return prev;
      });
      setProgress((prev) => {
        const step = Math.floor(100 / STATUS_MESSAGES.length);
        const next = prev + step;
        return next > 95 ? 95 : next;
      });
    }, 1800);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadAndGenerateCaptions(formData);

    // Clear interval and show 100% briefly
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(100);

    // Brief delay before showing results
    setTimeout(() => {
      if (result.error) {
        setError(result.error);
      } else if (result.captions) {
        setCaptions(result.captions as any);
      }
      setLoading(false);
      setProgress(0);
      setStatusIndex(0);
    }, 500);
  };

  const handleVote = async (captionId: string, type: 'up' | 'down') => {
    const currentVote = votes[captionId] || null;
    const newValue = currentVote === type ? null : type;
    
    // Optimistic update
    setVotes(prev => ({ ...prev, [captionId]: newValue }));
    setVotingLoading(prev => ({ ...prev, [captionId]: true }));
    
    try {
      const voteValue = newValue === 'up' ? 1 : newValue === 'down' ? -1 : 0;
      await submitVote(captionId, voteValue);
    } catch (err) {
      console.error("Vote failed:", err);
      // Revert optimistic update
      setVotes(prev => ({ ...prev, [captionId]: currentVote }));
      // Optional: show local error for this caption
    } finally {
      setVotingLoading(prev => ({ ...prev, [captionId]: false }));
    }
  };

  const ThumbUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12"></path>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
    </svg>
  );

  const ThumbDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2"></path>
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
    </svg>
  );

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
            color: loading || !file ? "#fff" : "#fff",
            border: "none",
            borderRadius: "100px",
            cursor: loading || !file ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "1.1rem",
            transition: "all 0.2s ease",
            boxShadow: loading || !file ? "none" : "0 0 20px rgba(45, 212, 191, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <div style={{ width: "100%" }}>
              <div style={{ color: "#fff" }}>{STATUS_MESSAGES[statusIndex]}</div>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            "Upload and Generate Captions"
          )}
        </button>

        {loading && (
          <p className={styles.loadingSubtext}>
            Caption generation generally takes around 1 minute. Refreshing the page will lose progress.
          </p>
        )}
      </form>

      {captions.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h3 style={{ 
            marginBottom: "1.5rem", 
            paddingBottom: "1rem",
            fontSize: "1.5rem",
            fontWeight: "800",
            letterSpacing: "0.01em",
            borderBottom: "1px solid #222",
            color: "#fff",
            fontFamily: "var(--font-display)"
          }}>
            Generated Captions:
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {captions.map((caption) => {
              const currentVote = votes[caption.id] || null;
              const isLoading = votingLoading[caption.id] || false;
              
              return (
                <div key={caption.id} className={styles.captionRow}>
                  <div className={styles.captionText}>
                    {caption.content}
                  </div>
                  <div className={styles.voteButtons}>
                    <button
                      className={`${styles.voteBtn} ${styles.voteBtnUp} ${currentVote === 'up' ? styles.active : ''}`}
                      onClick={() => handleVote(caption.id, 'up')}
                      disabled={isLoading}
                      title="Thumbs Up"
                    >
                      <ThumbUpIcon />
                    </button>
                    <button
                      className={`${styles.voteBtn} ${styles.voteBtnDown} ${currentVote === 'down' ? styles.active : ''}`}
                      onClick={() => handleVote(caption.id, 'down')}
                      disabled={isLoading}
                      title="Thumbs Down"
                    >
                      <ThumbDownIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
