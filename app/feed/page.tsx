import { createClient } from "@/lib/supabaseServerClient"
import { submitVote } from "@/app/actions/vote"

export default async function FeedPage() {
  const supabase = await createClient()

  // Example: get one image with caption
  const { data: captions } = await supabase
    .from("captions")
    .select(`
      id,
      text,
      image_id,
      images (*)
    `)
    .limit(1)

  const caption = captions?.[0]

  if (!caption) return <div>No captions found</div>

  return (
    <main style={{ padding: "2rem" }}>
      <img
        src={caption.images?.[0]?.url}
        style={{ width: "400px" }}
      />

      <p>{caption.text}</p>

      <form action={async () => {
        await submitVote(caption.id, 1)
      }}>
        <button type="submit">👍</button>
      </form>

      <form action={async () => {
        await submitVote(caption.id, -1)
      }}>
        <button type="submit">👎</button>
      </form>
    </main>
  )
}
