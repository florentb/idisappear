import * as PImage from "pureimage";
import { createReadStream } from "fs";
import { BlobWriteStream } from "fast-blob-stream";
import { getStore } from "@netlify/blobs";

// Define the dimensions of the image
const pictureFile = "./boris.png";
const width = 160;
const height = 125;
const store = getStore("idisappear");
const pixelCounter = {};
let visibilityMatrix = [];

export default async () => {
  try {
    // Load the visibility matrix from Netlify Blob
    const matrixBlob = await store.get("matrix");
    visibilityMatrix = JSON.parse(matrixBlob);

    // Initialize and load the pixel visibility counter
    pixelCounter.visiblePixels = visibilityMatrix
      .flat()
      .filter((x) => x === 1).length;

    if (await hideRandomVisiblePixel()) {
      await processImage();
      return new Response("Updated");
    } else {
      return new Response("Processing terminated: No visible pixels left.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return new Response("Error processing the image", { status: 500 });
  }
};

// Function to hide a random visible pixel
async function hideRandomVisiblePixel() {
  const coordinates = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visibilityMatrix[y][x] === 1) {
        coordinates.push({ x, y });
      }
    }
  }

  if (coordinates.length === 0) {
    console.log(
      "No visible pixel was found to hide. It might be fully white now."
    );
    return false;
  }

  const { x, y } = coordinates[Math.floor(Math.random() * coordinates.length)];
  visibilityMatrix[y][x] = 0;
  await store.setJSON("matrix", visibilityMatrix);
  pixelCounter.visiblePixels--;

  // Update and save the visible pixel counter
  await store.setJSON("counter", pixelCounter);
  console.log(`Pixel at (${x}, ${y}) hidden.`);
  return true;
}

// Function to process the image and create a larger, pixelated copy
async function processImage() {
  const image = await PImage.decodePNGFromStream(createReadStream(pictureFile));
  const canvas = PImage.make(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visibilityMatrix[y][x] === 0) {
        const index = (y * width + x) * 4;
        data[index] = data[index + 1] = data[index + 2] = 255; // Set pixel to white
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Create a pixelated version
  const largeCanvas = PImage.make(width * 5, height * 5);
  const largeCtx = largeCanvas.getContext("2d");
  largeCtx.imageSmoothingEnabled = false;
  largeCtx.drawImage(canvas, 0, 0, width * 5, height * 5);

  // Save the pixelated image
  const pictureStream = new BlobWriteStream(saveImage, {
    mimeType: "image/png",
  });
  await PImage.encodePNGToStream(largeCanvas, pictureStream);
}

// Save picture to Netlify Blob
async function saveImage(blob) {
  const metadata = { date: new Date().toISOString() };
  await store.set(
    `backup_${width * height - pixelCounter.visiblePixels}`,
    blob,
    { metadata: metadata }
  );
  await store.set("picture", blob);
}
