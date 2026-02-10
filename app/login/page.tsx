"use client"

import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main>
      <h1>Login</h1>
      <button onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </main>
  )
}