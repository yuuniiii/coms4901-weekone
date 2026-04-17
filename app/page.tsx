"use client"

import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2.5rem",
        textAlign: "center",
        padding: "2rem",
        backgroundColor: "#000000",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h1 style={{ 
          fontSize: "clamp(3rem, 10vw, 5rem)", 
          fontWeight: "900", 
          letterSpacing: "-0.04em", 
          margin: 0,
          lineHeight: "1.1",
          color: "#ffffff"
        }}>
          your favorite memes
        </h1>
        <p style={{ 
          fontSize: "clamp(1.25rem, 4vw, 1.75rem)", 
          fontWeight: "700", 
          color: "#b1b1b1", 
          margin: 0 
        }}>
          in one place.
        </p>
      </div>

      <button
        onClick={signInWithGoogle}
        style={{
          padding: "1.25rem 3rem",
          backgroundColor: "#d54368",
          color: "#fff",
          borderRadius: "100px",
          cursor: "pointer",
          border: "none",
          fontSize: "1.25rem",
          fontWeight: "700",
          transition: "all 0.2s ease",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
        }}
      >
        Sign in with Google
      </button>
    </main>
  );
}