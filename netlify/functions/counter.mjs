import { getStore } from '@netlify/blobs'

export default async (req, context) => {
  const store = getStore('idisappear')
  const counter = await store.get('counter', { type: 'json' })
  return new Response(counter)
}
