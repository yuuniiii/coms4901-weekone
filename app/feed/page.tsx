import { createClient } from "@/lib/supabaseServerClient"
import { redirect } from "next/navigation"
import { submitVote } from "@/app/actions/vote"
import { logout } from "@/app/actions/logout"

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

  if (!caption) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>You've seen everything!</h1>
        <p>Check back later for more captions.</p>
        <form action={logout}>
          <button type="submit">Log Out</button>
        </form>
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
    <main style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Feed</h1>
        <form action={logout}>
          <button type="submit">Log Out</button>
        </form>
      </div>

      {imageData && (
        <img
          src={imageData.url}
          alt="Caption image"
          style={{ width: "100%", maxWidth: "450px", borderRadius: "8px", marginBottom: "1rem" }}
        />
      )}

      <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        {caption.content}
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <form action={submitVote.bind(null, caption.id, 1)}>
          <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>👍 Upvote</button>
        </form>

        <form action={submitVote.bind(null, caption.id, -1)}>
          <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>👎 Downvote</button>
        </form>
      </div>
    </main>
  )
}
