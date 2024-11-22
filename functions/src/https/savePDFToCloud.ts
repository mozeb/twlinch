import { onRequest } from "firebase-functions/v2/https";
import { Storage } from "@google-cloud/storage";
import cors from "cors";

const storage = new Storage();
const bucketName = "custom-slipmats"; // Replace with your actual bucket name
const corsHandler = cors({ origin: true }); // Adjust CORS settings as needed

export const uploadPDF = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("multipart/form-data")) {
        res.status(400).send("Content-Type must be multipart/form-data");
        return;
      }

      const fileBuffer = req.body; // Expecting Buffer data in req.body
      const fileName = `${Date.now()}-uploaded.pdf`;
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(fileName);

      await file.save(fileBuffer, {
        contentType: "application/pdf",
        metadata: {
          contentType: "application/pdf",
        },
      });

      // Construct the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      res.status(200).send({ url: publicUrl });
    } catch (error) {
      console.error("Error uploading file:", error);

      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      res.status(500).send(`Error uploading file: ${errorMessage}`);
    }
  });
});
