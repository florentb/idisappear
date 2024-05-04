import * as PImage from "pureimage";
import { createReadStream } from "fs";
import { BlobWriteStream } from "fast-blob-stream";
import { getStore } from "@netlify/blobs";

export default async () => {
  // Define the dimensions of the image
  const pictureFile = "./boris.png";
  const width = 160;
  const height = 125;
  const pixels = width * height; // Total number of pixels in the image

  const store = getStore("idisappear");

  // Load the visibility matrix from Netlify Blob
  const matrixBlob = await store.get("matrix", { type: "json" });
  const visibilityMatrix = JSON.parse(matrixBlob);

  // Initialize and load the pixel visibility counter
  const pixelCounter = {
    visiblePixels: visibilityMatrix.flat().filter((x) => x === 1).length,
  };

  // Function to hide a random visible pixel
  async function hideRandomVisiblePixel() {
    let hidden = false;
    let attempts = 0;

    while (!hidden && attempts < pixels) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);

      if (visibilityMatrix[y][x] === 1) {
        visibilityMatrix[y][x] = 0;
        hidden = true;
        console.log(`Set pixel at (${x}, ${y}) to hidden.`);
        await store.setJSON("matrix", JSON.stringify(visibilityMatrix));
        // Update and save the visible pixel counter
        pixelCounter.visiblePixels--;
        await store.setJSON("counter", JSON.stringify(pixelCounter));
        return true; // Exit after hiding one pixel
      }
      attempts++;
    }

    console.log(
      "No visible pixel was found to hide. It might be fully white now."
    );
    return false;
  }

  // Function to process the image and create a larger, pixelated copy
  async function processImage(imagePath) {
    const image = await PImage.decodePNGFromStream(createReadStream(imagePath));
    const canvas = PImage.make(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (visibilityMatrix[y][x] === 0) {
          data[index] = 255; // Red
          data[index + 1] = 255; // Green
          data[index + 2] = 255; // Blue
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
    return PImage.encodePNGToStream(largeCanvas, pictureStream);
  }

  // Save picture to Netlify Blob
  async function saveImage(blob) {
    await store.set(`backup_${pixels - pixelCounter.visiblePixels}`, blob);
    await store.set("picture", blob);
  }

  // Run the full update and processing
  if (hideRandomVisiblePixel()) {
    await processImage(pictureFile);
    return new Response("Updated");
  } else {
    return new Response("Processing terminated: Is Boris still alive?");
  }
};
