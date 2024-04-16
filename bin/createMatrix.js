import { writeFile } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define the dimensions of the image
const width = 160
const height = 125

const matrixFile = join(__dirname, '../matrix.json')

// Initialize the matrix
const visibilityMatrix = new Array(height)
for (let i = 0; i < height; i++) {
  visibilityMatrix[i] = new Array(width)
  for (let j = 0; j < width; j++) {
    // Initialize each pixel as visible (1)
    visibilityMatrix[i][j] = 1
  }
}

// Convert the matrix to JSON
const matrixJSON = JSON.stringify(visibilityMatrix)

// Write the JSON to a file
writeFile(matrixFile, matrixJSON, 'utf8', function (err) {
  if (err) {
    console.log('An error occured while writing JSON Object to File.')
    return console.log(err)
  }

  console.log('Matrix file has been saved.')
})
