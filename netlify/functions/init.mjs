import * as PImage from "pureimage";
import { createReadStream } from "fs";
import { BlobWriteStream } from "fast-blob-stream";
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const requestToken = req.headers.get("X-Token");
  const appToken = Netlify.env.get("APP_TOKEN");

  if (requestToken === appToken) {
    // Define the dimensions of the image
    const pictureFile = "./boris.png";
    const width = 160;
    const height = 125;

    const store = getStore("idisappear");

    // Initialize the matrix
    const visibilityMatrix = new Array(height);
    for (let i = 0; i < height; i++) {
      visibilityMatrix[i] = new Array(width);
      for (let j = 0; j < width; j++) {
        // Initialize each pixel as visible (1)
        visibilityMatrix[i][j] = 1;
      }
    }

    // Initialize and load the pixel visibility counter
    const pixelCounter = {
      visiblePixels: visibilityMatrix.flat().filter((x) => x === 1).length,
    };

    // Save to Netlify Blob
    await store.setJSON("matrix", visibilityMatrix);
    await store.setJSON("counter", pixelCounter);

    // Get pixalated image canvas
    const image = await PImage.decodePNGFromStream(
      createReadStream(pictureFile)
    );
    const canvas = PImage.make(width * 5, height * 5);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, width * 5, height * 5);

    // Save the pixelated image
    const outStream = new BlobWriteStream(console.log, {
      mimeType: "image/png",
    });
    PImage.encodePNGToStream(canvas, outStream);
    outStream.on("blob", (blob) => {
      store.set("picture", blob);
    });

    return new Response("Init done");
  }

  return new Response("Sorry, no access for you.", { status: 401 });
};
