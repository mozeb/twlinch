/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "firebase-functions";

export function logInfo(...args: any[]): void {
  logger.info(...args);
}

export function logDebug(...args: any[]): void {
  logger.debug(...args);
}

export function logLog(...args: any[]): void {
  logger.log(...args);
}

export function logWarn(...args: any[]): void {
  logger.warn(...args);
}

export function logError(...args: any[]): void {
  logger.error(...args);
}
