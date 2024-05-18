import { onRequest } from "firebase-functions/v2/https";
import express, { type Request, type Response } from "express";
import { logMiddleware } from "./logMiddleware";
import { woocommerceRouter } from "./woocommerce";

const app = express();
app.disable("x-powered-by");
app.use(logMiddleware);

app.use("/woocommerce", woocommerceRouter);

app.get("/ping", (req: Request, res: Response) => {
  return res.status(200).send("pong");
});

export const api = onRequest(app);
