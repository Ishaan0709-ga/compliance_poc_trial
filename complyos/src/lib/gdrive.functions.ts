import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

async function gdriveFetch(path: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
  if (!GOOGLE_DRIVE_API_KEY) throw new Error("GOOGLE_DRIVE_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google Drive [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

export const getGoogleDriveStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await gdriveFetch("/files?pageSize=1&fields=files(id)");
    return { connected: true, ok: Array.isArray(data.files) };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
});

export const listGoogleDriveFiles = createServerFn({ method: "GET" }).handler(async () => {
  const data = await gdriveFetch(
    "/files?pageSize=20&orderBy=modifiedTime%20desc&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)"
  );
  return { files: data.files || [] };
});
