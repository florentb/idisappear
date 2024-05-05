import crypto from "crypto";
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("idisappear");
  const counter = await store.get("counter");
  const etag = `"${crypto.createHash("md5").update(counter).digest("hex")}"`;

  const headers = {
    "Content-Type": "	application/json",
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

  return new Response(counter, {
    headers: headers,
  });
};

export const config = {
  cache: "manual",
  path: "/api/counter",
};
