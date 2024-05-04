import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("idisappear");
  let blob;
  if (context.params.id) {
    blob = await store.get(`backup_${context.params.id}`, { type: "blob" });
  } else {
    blob = await store.get("picture", { type: "blob" });
  }
  return new Response(blob);
};

export const config = {
  path: "/api/picture{/:id}?",
};
