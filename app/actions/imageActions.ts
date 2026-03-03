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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Not authenticated. Please log in again." };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { error: "Missing access token." };
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
        contentType: file.type,
      }),
    });

    if (!presignedResponse.ok) {
      const errorText = await presignedResponse.text();
      console.error("Step 1 failed:", errorText);
      return { error: "Failed to generate upload URL" };
    }

    const step1Data = await presignedResponse.json();
    console.log("Step 1 response:", step1Data);

    const presignedUrl = step1Data.presignedUrl;
    const cdnUrl = step1Data.cdnUrl;

    console.log("CDN URL:", cdnUrl);

    // 2. PUT image bytes to returned presignedUrl (NO Authorization header)
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file
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
      body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false, }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error("Step 3 failed:", errorText);
      return { error: "Failed to register image" };
    }

    const step3Data = await registerResponse.json();
    console.log("Step 3 raw response:", step3Data);

    // Robust extraction in case the API returns 'id' or 'image_id' instead of 'imageId'
    const imageId = step3Data.imageId || step3Data.id || step3Data.image_id;
    console.log("Extracted imageId:", imageId);

    if (!imageId) {
      return { error: "Failed to extract imageId from Step 3 response" };
    }

    console.log("JWT length:", jwt.length);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. POST /pipeline/generate-captions
    // Reverting to 'imageId' as per 400 error message. 
    // The profile/user is automatically handled by the JWT in the headers.
    const captionsResponse = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ imageId }),
    });

    if (!captionsResponse.ok) {
      const errorText = await captionsResponse.text();
      console.error("Step 4 failed:", errorText);
      return { error: errorText };
    }

    const data = await captionsResponse.json();
    // Normalize response to ensure it's an array for the UI
    const captionArray = Array.isArray(data) ? data : (data.captions || []);

    return { captions: captionArray };
  } catch (error: any) {
    console.error("Pipeline error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
