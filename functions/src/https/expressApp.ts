import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { type Request, type Response } from "express";
import { logMiddleware } from "./logMiddleware";

const app = express();
app.disable("x-powered-by");
app.use(logMiddleware);

app.get("/ping", (req: Request, res: Response) => {
  return res.status(200).send("pong");
});

export const api = onRequest(app);
