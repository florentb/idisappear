import { getStore } from '@netlify/blobs'

export default async (req, context) => {
  const store = getStore('idisappear')
  const blob = await store.get('picture', { type: 'blob' })
  return new Response(blob)
}

export const config = {
  path: '/api/picture'
}
