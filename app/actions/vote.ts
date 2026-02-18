"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabaseServerClient"

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("caption_votes")
    .upsert(
      {
        caption_id: captionId,
        profile_id: user.id,
        vote_value: voteValue,
        modified_datetime_utc: new Date().toISOString(),
      },
      {
        onConflict: "profile_id,caption_id",
      }
    )

  if (error) {
    console.error(error)
    throw new Error("Vote failed")
  }

  revalidatePath("/") // change if needed
}