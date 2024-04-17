import * as PImage from 'pureimage'
import { createReadStream } from 'fs'
import { Writable } from 'stream'
import { getStore } from '@netlify/blobs'

export default async (req, context) => {
  // Define the dimensions of the image
  const pictureFile = './boris.png'
  const width = 160
  const height = 125

  const store = getStore('idisappear')

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
  await store.setJSON('matrix', JSON.stringify(visibilityMatrix))
  await store.setJSON('counter', JSON.stringify(JSON.stringify(pixelCounter)))

  PImage.decodePNGFromStream(createReadStream(pictureFile)).then(image => {
    const canvas = PImage.make(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    // Create a pixelated version
    const largeCanvas = PImage.make(width * 5, height * 5)
    const largeCtx = largeCanvas.getContext('2d')
    largeCtx.imageSmoothingEnabled = false
    largeCtx.scale(5, 5)
    largeCtx.drawImage(canvas, 0, 0)

    // Save the pixelated image
    const outStream = new Writable()
    const chunks = []
    outStream._write = function (chunk, encoding, callback) {
      if (!(chunk instanceof Uint8Array)) {
        chunk = new Uint8Array(chunk)
      }
      chunks.push(chunk)
      callback()
    }
    outStream.on('finish', function () {
      const blob = new Blob(chunks, { type: 'image/png' })
      store.set('picture', blob)
    })
    PImage.encodePNGToStream(largeCanvas, outStream)
  })

  return new Response('Init done')
}
