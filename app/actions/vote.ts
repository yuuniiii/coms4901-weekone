"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabaseServerClient"

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!user) {
    throw new Error("Not authenticated")
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from("caption_votes")
    .upsert(
      {
        caption_id: captionId,
        profile_id: user.id,
        vote_value: voteValue,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      },
      {
        onConflict: "profile_id,caption_id",
      }
    )

  if (error) {
    console.error("VOTE ERROR:", error)
    return
  }

  // This triggers the FeedPage to re-run its data fetching
  revalidatePath("/feed")
}
