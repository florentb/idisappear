import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("idisappear");
  const counter = await store.get("counter", { type: "json" });
  return new Response(counter);
};

export const config = {
  path: "/api/counter",
};
