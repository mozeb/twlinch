import { Storage } from "@google-cloud/storage";
import Busboy = require("busboy"); // Use CommonJS import for Busboy
import path from "path";
import os from "os";
import fs from "fs";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";

const storage = new Storage();
const bucketName = "custom-slipmats"; // Replace with your actual bucket name

// Initialize CORS middleware
const corsHandler = cors({ origin: "https://twlinch.com" });

export const uploadfileslipmat = onRequest((req, res) => {
  corsHandler(req, res, () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    let uploadPromise: Promise<string> | null = null;

    busboy.on(
      "file",
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: { filename: string },
      ) => {
        const { filename } = info;
        const filepath = path.join(tmpdir, filename);
        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(filename);

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        // Wait for the file to be fully written to disk
        uploadPromise = new Promise((resolve, reject) => {
          writeStream.on("finish", async () => {
            // Upload the file to Google Cloud Storage
            await bucket.upload(filepath, {
              destination: blob.name,
              resumable: false,
              contentType: "auto",
            });

            // Make the file publicly accessible
            await blob.makePublic();

            // Remove the temporary file
            fs.unlinkSync(filepath);

            // Resolve with the file URL
            resolve(
              `https://storage.googleapis.com/${bucketName}/${blob.name}`,
            );
          });

          writeStream.on("error", reject);
        });
      },
    );

    busboy.on("finish", async () => {
      try {
        if (uploadPromise) {
          const publicUrl = await uploadPromise;
          res.status(200).send({ url: publicUrl });
        } else {
          res.status(400).send("No file uploaded");
        }
      } catch (error) {
        res
          .status(500)
          .send(
            `Error uploading file: ${error instanceof Error ? error.message : String(error)}`,
          );
      }
    });

    req.pipe(busboy);
  });
});
