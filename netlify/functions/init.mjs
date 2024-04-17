import { getStore } from '@netlify/blobs'

export default async (req, context) => {
  // Define the dimensions of the image
  const width = 160
  const height = 125

  const idisappear = getStore('idisappear')

  // Initialize the matrix
  const visibilityMatrix = new Array(height)
  for (let i = 0; i < height; i++) {
    visibilityMatrix[i] = new Array(width)
    for (let j = 0; j < width; j++) {
      // Initialize each pixel as visible (1)
      visibilityMatrix[i][j] = 1
    }
  }

  // Initialize and load the pixel visibility counter
  const pixelCounter = { visiblePixels: visibilityMatrix.flat().filter(x => x === 1).length }

  // Save to Netlify Blob
  await idisappear.setJSON('matrix', JSON.stringify(visibilityMatrix))
  await idisappear.setJSON('counter', JSON.stringify(JSON.stringify(pixelCounter)))

  return new Response('Init done')
}
