import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServerClient"
import Link from "next/link"
import { logout } from "@/app/actions/logout"
import DashboardGrid from "./DashboardGrid"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch upvoted captions with their associated images
  const { data: upvotedData, error } = await supabase
    .from("caption_votes")
    .select(`
      caption:captions (
        id,
        content,
        image:images (
          url
        )
      )
    `)
    .eq("profile_id", session.user.id)
    .eq("vote_value", 1)
    .order("modified_datetime_utc", { ascending: false })

  if (error) {
    console.error("Error fetching upvoted captions:", error)
  }

  const upvotedItems = upvotedData?.map((item: any) => item.caption) || []

  return (
    <main
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "8rem 2rem 2rem 2rem",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header Area */}
      <div
        style={{
          position: "fixed",
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
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
          <Link
            href="/feed"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f55719",
              color: "#fff",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "700",
              transition: "all 0.2s ease",
              boxShadow: "0 0 15px rgba(167, 139, 250, 0.4)",
            }}
          >
            Browse public gallery
          </Link>
          <Link
            href="/upload"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f55719",
              color: "#fff",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "700",
              transition: "all 0.2s ease",
              boxShadow: "0 0 15px rgba(45, 212, 191, 0.4)",
            }}
          >
            Make your own memes
          </Link>
        </div>

        <h1 style={{ 
          margin: 0, 
          fontSize: "2rem", 
          fontWeight: "800", 
          position: "absolute", 
          left: "50%", 
          transform: "translateX(-50%)",
          letterSpacing: "0.09em",
          fontFamily: "var(--font-display)",
          color: "#fff"
        }}>
          My Humor Gallery
        </h1>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <form action={logout}>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "100px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "700",
                transition: "all 0.2s ease",
              }}
            >
              Log Out
            </button>
          </form>
        </div>
      </div>

      {upvotedItems.length === 0 ? (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", color: "#fff" }}>
            seems like you haven’t found anything funny.{" "}
            <Link
              href="/feed"
              style={{ color: "#fff", fontWeight: "700", textDecoration: "underline" }}
            >
              browse the public gallery
            </Link>{" "}
            or{" "}
            <Link
              href="/upload"
              style={{ color: "#fff", fontWeight: "700", textDecoration: "underline" }}
            >
              make your own
            </Link>
          </p>
        </div>
      ) : (
        <DashboardGrid items={upvotedItems} />
      )}
    </main>
  )
}
