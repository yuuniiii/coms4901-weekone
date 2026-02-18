import { createClient } from "@/lib/supabaseServerClient"
import { submitVote } from "@/app/actions/vote"

export default async function FeedPage() {
  const supabase = await createClient()

  // Get one public caption
  const { data: captions, error } = await supabase
    .from("captions")
    .select("*")
    .eq("is_public", true)
    .limit(1)

  if (error) {
  console.error("CAPTIONS ERROR:", error)
  return <div>{JSON.stringify(error)}</div>
  }


  const caption = captions?.[0]

  if (!caption) {
    return <div>No captions found</div>
  }

  // Fetch image separately
  const { data: imageData } = await supabase
    .from("images")
    .select("url")
    .eq("id", caption.image_id)
    .maybeSingle()

  return (
    <main style={{ padding: "2rem" }}>
      {imageData && (
        <img
          src={imageData.url}
          alt="Caption image"
          style={{ width: "400px", marginBottom: "1rem" }}
        />
      )}

      <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        {caption.content}
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <form action={submitVote.bind(null, caption.id, 1)}>
            <button type="submit">👍 Upvote</button>
        </form>

        <form action={submitVote.bind(null, caption.id, -1)}>
            <button type="submit">👎 Downvote</button>
        </form>
      </div>
    </main>
  )
}