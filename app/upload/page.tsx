import { createClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";
import Link from "next/link";
import { logout } from "@/app/actions/logout";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const headerStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    padding: "1.5rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 10,
    borderBottom: "1px solid #222",
  }

  const navLinkStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: "100px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "700",
    transition: "all 0.2s ease",
    boxShadow: "0 0 15px rgba(45, 212, 191, 0.4)",
  }

  const logoutButtonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "100px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "700",
    transition: "all 0.2s ease",
  }

  return (
    <main
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "8rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <Link href="/dashboard" style={navLinkStyle}>
            back to user home
          </Link>
        </div>
        
        <h1 style={{ 
          margin: 0, 
          fontSize: "1.5rem", 
          fontWeight: "800", 
          position: "absolute", 
          left: "50%", 
          transform: "translateX(-50%)",
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-display)",
          color: "#2dd4bf"
        }}>
          upload
        </h1>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <form action={logout}>
            <button type="submit" style={logoutButtonStyle}>
              Log Out
            </button>
          </form>
        </div>
      </div>

      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#0d0d0d",
          borderRadius: "24px",
          padding: "3rem 2rem",
          border: "1px solid #222",
          marginTop: "2rem",
          boxShadow: "0 0 40px rgba(45, 212, 191, 0.15)",
        }}
      >
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: "2.5rem", 
          fontSize: "2rem", 
          fontWeight: "800",
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-display)",
          color: "#fff"
        }}>
          make your own memes
        </h2>
        <UploadForm />
      </div>
    </main>
  );
}
