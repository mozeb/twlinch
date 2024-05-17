import { type NextFunction, type Request, type Response } from "express";
import { logLog, logWarn } from "../services";

export function logMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    logLog(`ℹ️ [api] Request for: ${req.path}`, {
      req: {
        body: req.body,
        query: req.query,
        param: req.params,
        headers: req.headers,
      },
    });
  } catch (err) {
    logWarn(err);
  }

  return next();
}
