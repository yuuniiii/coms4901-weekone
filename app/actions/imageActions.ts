"use server";

import { createClient } from "@/lib/supabaseServerClient";

const API_BASE_URL = "https://api.almostcrackd.ai";

export async function uploadAndGenerateCaptions(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { error: "Not authenticated. Please log in again." };
    }

    const jwt = session.access_token;
    const authHeaders = {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };

    // 1. POST /pipeline/generate-presigned-url
    // We assume it takes filename and contentType and returns { presignedUrl, publicUrl }
    const presignedResponse = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!presignedResponse.ok) {
      const errorText = await presignedResponse.text();
      console.error("Step 1 failed:", errorText);
      return { error: "Failed to generate upload URL" };
    }

    const { presignedUrl, publicUrl } = await presignedResponse.json();

    // 2. PUT image bytes to returned presignedUrl (NO Authorization header)
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: Buffer.from(await file.arrayBuffer()),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Step 2 failed:", errorText);
      return { error: "Failed to upload image bytes" };
    }

    // 3. POST /pipeline/upload-image-from-url
    // We assume it takes imageUrl and returns { imageId }
    const registerResponse = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ imageUrl: publicUrl, isCommonUse: false, }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error("Step 3 failed:", errorText);
      return { error: "Failed to register image" };
    }

    const { imageId } = await registerResponse.json();

    // 4. POST /pipeline/generate-captions
    // We assume it takes imageId and returns { captions: string[] }
    const captionsResponse = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ imageId }),
    });

    if (!captionsResponse.ok) {
      const errorText = await captionsResponse.text();
      console.error("Step 4 failed:", errorText);
      return { error: "Failed to generate captions" };
    }

    const { captions } = await captionsResponse.json();

    return { captions };
  } catch (error: any) {
    console.error("Pipeline error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
