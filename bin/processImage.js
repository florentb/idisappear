import { createCanvas, Image } from 'canvas'
import { readFileSync, existsSync, writeFileSync, createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define the picture and its dimensions
const image = new Image()
image.src = 'data:image/jpeg;base64,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'
const width = 160
const height = 125
const pixels = width * height // Total number of pixels in the image

// Work directories
const backupDir = join(__dirname, '../backups')
const publicDir = join(__dirname, '../public')

// Matrix file
const matrixFile = join(__dirname, '../matrix.json')

// Load the visibility matrix from a JSON file
const visibilityMatrix = JSON.parse(readFileSync(matrixFile, 'utf8'))

// Initialize and load the pixel visibility counter
let pixelCounter = { visiblePixels: visibilityMatrix.flat().filter(x => x === 1).length }
const counterFile = join(publicDir, 'counter.json')
if (existsSync(counterFile)) {
  pixelCounter = JSON.parse(readFileSync(counterFile, 'utf8'))
} else {
  writeFileSync(counterFile, JSON.stringify(pixelCounter), 'utf8')
}

// Function to hide a random visible pixel
function hideRandomVisiblePixel () {
  let hidden = false
  let attempts = 0

  while (!hidden && attempts < pixels) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)

    if (visibilityMatrix[y][x] === 1) {
      visibilityMatrix[y][x] = 0
      hidden = true
      console.log(`Set pixel at (${x}, ${y}) to hidden.`)
      writeFileSync(matrixFile, JSON.stringify(visibilityMatrix), 'utf8')
      // Update and save the visible pixel counter
      pixelCounter.visiblePixels--
      writeFileSync(counterFile, JSON.stringify(pixelCounter), 'utf8')
      return true // Exit after hiding one pixel
    }
    attempts++
  }

  console.log('No visible pixel was found to hide. It might be fully white now.')
  return false
}

// Function to process the image and create a larger, pixelated copy
function processImage () {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      if (visibilityMatrix[y][x] === 0) {
        data[index] = 255 // Red
        data[index + 1] = 255 // Green
        data[index + 2] = 255 // Blue
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Create a pixelated version
  const largeCanvas = createCanvas(width * 5, height * 5)
  const largeCtx = largeCanvas.getContext('2d')
  largeCtx.imageSmoothingEnabled = false
  largeCtx.scale(5, 5)
  largeCtx.drawImage(canvas, 0, 0)

  // Backup the pixelated image
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '')
  const backupPath = join(backupDir, `backup_${timestamp}.png`)
  const outBackup = createWriteStream(backupPath)
  const streamBackup = largeCanvas.createPNGStream()
  streamBackup.pipe(outBackup)

  // Save the pixelated image
  const outputPath = join(publicDir, 'picture.png')
  const out = createWriteStream(outputPath)
  const stream = largeCanvas.createPNGStream()
  stream.pipe(out)
  out.on('finish', () => console.log(`The pixelated image was saved as ${outputPath}`))
  outBackup.on('finish', () => console.log(`Backup created as ${backupPath}`))
}

// Run the full update and processing
if (hideRandomVisiblePixel()) {
  processImage('picture.png')
} else {
  console.log('Processing terminated: Is Boris still alive?')
}
