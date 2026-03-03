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
    backgroundColor: "#ffffff",
    zIndex: 10,
    borderBottom: "1px solid #eee",
  }

  const navLinkStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: "100px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "700",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }

  const logoutButtonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "#000",
    border: "1px solid #ddd",
    borderRadius: "100px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "700",
    transition: "all 0.2s ease",
  }

  return (
    <main
      style={{
        backgroundColor: "#ffffff",
        color: "#000",
        minHeight: "100vh",
        padding: "8rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "sans-serif",
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
          letterSpacing: "-0.02em"
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
          backgroundColor: "#fff",
          borderRadius: "24px",
          padding: "3rem 2rem",
          border: "1px solid #eee",
          marginTop: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: "2.5rem", 
          fontSize: "2rem", 
          fontWeight: "800",
          letterSpacing: "-0.02em"
        }}>
          make your own memes
        </h2>
        <UploadForm />
      </div>
    </main>
  );
}
