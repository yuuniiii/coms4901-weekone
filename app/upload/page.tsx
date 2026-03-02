import { createClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Upload Image for Captions</h1>
      <UploadForm />
    </main>
  );
}
