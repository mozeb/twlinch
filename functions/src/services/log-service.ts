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

export function logTrainingCalendar(userId: string) {
  logger.log(`📆 Updated training calendar for ${userId}.`);
}

export function logDbDeletedSkip() {
  logger.info("🗑️ Skipping because the value was deleted.");
}

export function logSkipInDevEnvironment() {
  logger.info("🧑‍💻️ Skipping this in dev mode.");
}

export function logTodoNotImplemented(todoMsg: string) {
  logger.error(`🧑‍💻️ ${todoMsg}`);
}

export function logDbZeroSkip() {
  logger.log("/ Skipping because the value is zero.");
}
