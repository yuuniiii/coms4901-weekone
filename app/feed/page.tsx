import { createClient } from "@/lib/supabaseServerClient"
import { redirect } from "next/navigation"
import { submitVote } from "@/app/actions/vote"
import { logout } from "@/app/actions/logout"
import Link from "next/link"

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // 1. Fetch all caption IDs this user has already voted on
  const { data: votedData } = await supabase
    .from("caption_votes")
    .select("caption_id")
    .eq("profile_id", session.user.id)

  const votedIds = votedData?.map((v) => v.caption_id) || []

  // 2. Get one public caption NOT in the voted list
  let query = supabase
    .from("captions")
    .select("*")
    .eq("is_public", true)

  if (votedIds.length > 0) {
    query = query.not("id", "in", `(${votedIds.join(",")})`)
  }

  const { data: captions, error } = await query.limit(1)

  if (error) {
    console.error("CAPTIONS ERROR:", error)
    return <div>Error loading feed</div>
  }

  const caption = captions?.[0]

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
    backgroundColor: "#f55719",
    color: "#fff",
    borderRadius: "100px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "700",
    transition: "all 0.2s ease",
    boxShadow: "0 0 15px rgba(255, 200, 0, 0.4)",
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

  if (!caption) {
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
              Back to User Home
            </Link>
          </div>
          
          <h1 style={{ 
            margin: 0, 
            fontSize: "1.5rem", 
            fontWeight: "800", 
            position: "absolute", 
            left: "50%", 
            transform: "translateX(-50%)",
            letterSpacing: "0.01em",
            fontFamily: "var(--font-display)",
            color: "#fff"
          }}>
            Feed
          </h1>

          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <form action={logout}>
              <button type="submit" style={logoutButtonStyle}>
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>You've seen everything!</h1>
          <p style={{ color: "#fff", fontSize: "1.2rem" }}>Check back later for more captions.</p>
          <Link href="/dashboard" style={{ ...navLinkStyle, display: "inline-block", marginTop: "2rem" }}>
            Go to My Gallery
          </Link>
        </div>
      </main>
    )
  }

  // Fetch image for the selected caption
  const { data: imageData } = await supabase
    .from("images")
    .select("url")
    .eq("id", caption.image_id)
    .maybeSingle()

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
        letterSpacing: "0.01em",
      }}
    >
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <Link href="/dashboard" style={navLinkStyle}>
            Back to user home
          </Link>
        </div>
        
        <h1 style={{ 
          margin: 0, 
          fontSize: "1.5rem", 
          fontWeight: "800", 
          position: "absolute", 
          left: "50%", 
          transform: "translateX(-50%)",
          letterSpacing: "0.09em",
          fontFamily: "var(--font-display)",
          color: "#fff"
        }}>
          Feed
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
          maxWidth: "500px",
          width: "100%",
          backgroundColor: "#0d0d0d",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          marginTop: "2rem",
          boxShadow: "0 0 40px rgba(167, 139, 250, 0.15)",
        }}
      >
        {imageData && (
          <div style={{ width: "100%", aspectRatio: "1/1", position: "relative" }}>
            <img
              src={imageData.url}
              alt="Caption image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <div style={{ padding: "2rem" }}>
          <p style={{ 
            fontSize: "1.5rem", 
            fontWeight: "700", 
            marginBottom: "2rem", 
            textAlign: "center",
            lineHeight: "1.3",
            letterSpacing: "0.06em",
            fontFamily: "var(--font-display)",
            color: "#fff"
          }}>
            {caption.content}
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <form action={submitVote.bind(null, caption.id, 1)}>
              <button
                type="submit"
                style={{
                  padding: "1rem 2rem",
                  backgroundColor: "#f55719",
                  color: "#fff",
                  border: "none",
                  borderRadius: "100px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "700",
                  transition: "all 0.2s ease",
                  boxShadow: "0 0 15px rgba(254, 224, 106, 0.4)",
                }}
              >
                Save to my gallery
              </button>
            </form>

            <form action={submitVote.bind(null, caption.id, -1)}>
              <button
                type="submit"
                style={{
                  padding: "1rem 2rem",
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: "100px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "700",
                  transition: "all 0.2s ease",
                }}
              >
                Next
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
