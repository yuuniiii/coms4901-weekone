"use client"

import { supabase } from "../../lib/supabaseClient"

export default function LoginPage() {
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
        gap: "2rem",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "var(--font-body)",
      }}
    >
      <h1 style={{ 
        fontFamily: "var(--font-display)", 
        fontSize: "3rem",
        color: "#fff"
      }}>
        Login
      </h1>
      <button 
        onClick={signInWithGoogle}
        style={{
          padding: "1rem 2.5rem",
          backgroundColor: "var(--color-accent-coral)",
          color: "#fff",
          borderRadius: "100px",
          border: "none",
          fontWeight: "700",
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(251, 113, 133, 0.4)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(251, 113, 133, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(251, 113, 133, 0.4)";
        }}
      >
        Sign in with Google
      </button>
    </main>
  )
}