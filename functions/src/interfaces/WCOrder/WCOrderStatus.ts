/**
 * Woocommerce Order status options.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties
 */
export type WCOrderStatus =
  | "pending"
  | "processing"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed"
  | "trash";
