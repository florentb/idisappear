// import { createCanvas, Image } from 'canvas'
import * as PImage from 'pureimage'
import { readFileSync, existsSync, writeFileSync, createReadStream, createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define the picture and its dimensions
const pictureFile = join(__dirname, '../boris.png')
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
function processImage (imagePath) {
  PImage.decodePNGFromStream(createReadStream(imagePath)).then(image => {
    const canvas = PImage.make(width, height)
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
    const largeCanvas = PImage.make(width * 5, height * 5)
    const largeCtx = largeCanvas.getContext('2d')
    largeCtx.imageSmoothingEnabled = false
    largeCtx.scale(5, 5)
    largeCtx.drawImage(canvas, 0, 0)

    // Backup the pixelated image
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '')
    const backupPath = join(backupDir, `backup_${timestamp}.png`)
    PImage.encodePNGToStream(largeCanvas, createWriteStream(backupPath)).then(() => {
      console.log(`Backup created as ${backupPath}`)
    })

    // Save the pixelated image
    const outputPath = join(publicDir, 'picture.png')
    PImage.encodePNGToStream(largeCanvas, createWriteStream(outputPath)).then(() => {
      console.log(`The pixelated image was saved as ${outputPath}`)
    })
  })
}

// Run the full update and processing
if (hideRandomVisiblePixel()) {
  processImage(pictureFile)
} else {
  console.log('Processing terminated: Is Boris still alive?')
}
