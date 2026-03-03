import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServerClient"
import Link from "next/link"
import { logout } from "@/app/actions/logout"

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

  if (error) {
    console.error("Error fetching upvoted captions:", error)
  }

  const upvotedItems = upvotedData?.map((item: any) => item.caption) || []

  const linkColor = "#3b82f6"

  return (
    <main
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        minHeight: "100vh",
        padding: "8rem 2rem 2rem 2rem",
        fontFamily: "sans-serif",
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
          backgroundColor: "#ffffff",
          zIndex: 10,
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
          <Link
            href="/feed"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "700",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            browse public gallery
          </Link>
          <Link
            href="/upload"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "700",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            make your own memes
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
          my humor gallery
        </h1>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <form action={logout}>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: "#000",
                border: "1px solid #ddd",
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
          <p style={{ fontSize: "1.1rem", color: "#666" }}>
            seems like you haven’t found anything funny.{" "}
            <Link
              href="/feed"
              style={{ color: "#000", fontWeight: "700", textDecoration: "underline" }}
            >
              browse the public gallery
            </Link>{" "}
            or{" "}
            <Link
              href="/upload"
              style={{ color: "#000", fontWeight: "700", textDecoration: "underline" }}
            >
              make your own
            </Link>
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2.5rem",
            marginTop: "2rem",
          }}
        >
          {upvotedItems.map((item: any) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #eee",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease",
              }}
            >
              {item.image?.url && (
                <div style={{ width: "100%", aspectRatio: "1/1", position: "relative" }}>
                  <img
                    src={item.image.url}
                    alt="Humor item"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <div style={{ padding: "1.5rem", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#333", lineHeight: "1.4" }}>
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
