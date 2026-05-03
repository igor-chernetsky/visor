/** Base64url for news detail links — works in browser (client) and Node (server). */
export function encodeNewsUrl(url: string): string {
  if (typeof window === "undefined" && typeof Buffer !== "undefined") {
    return Buffer.from(url, "utf-8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(url);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
