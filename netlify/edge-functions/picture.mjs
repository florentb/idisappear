import crypto from "crypto";
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("idisappear");
  let blob;
  if (context.params.id) {
    blob = await store.get(`backup_${context.params.id}`, { type: "blob" });
  } else {
    blob = await store.get("picture", { type: "blob" });
  }

  const blobString = await blob.text();

  const etag = `"${crypto.createHash("md5").update(blobString).digest("hex")}"`;

  const headers = {
    "Content-Type": "	image/png",
    "Cache-Control": "public, max-age=0, must-revalidate", // Tell browsers to always revalidate
    "Netlify-CDN-Cache-Control": "public, max-age=31536000, must-revalidate", // Tell Edge to cache asset for up to a year
    ETag: etag,
  };

  if (
    req.headers.get("if-none-match") === `W/${etag}` ||
    req.headers.get("if-none-match") === etag
  ) {
    return new Response(null, {
      status: 304,
      headers: { headers },
    });
  }

  return new Response(blob, {
    headers: headers,
  });
};

export const config = {
  cache: "manual",
  path: "/api/picture{/:id}?",
};
