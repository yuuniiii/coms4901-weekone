import { createClient } from "@/lib/supabaseServerClient"

export default async function FeedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("captions")
    .select("id, content, is_public")
    .limit(1)

  console.log("DATA:", data)
  console.log("ERROR:", error)

  return <div>Query ran</div>
}
