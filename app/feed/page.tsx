import { createClient } from "@/lib/supabaseServerClient"

export default async function FeedPage() {
  const supabase = await createClient()

  return <div>Client created successfully</div>
}
