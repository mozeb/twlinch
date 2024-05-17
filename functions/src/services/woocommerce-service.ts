import { getEnv } from "../shared";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

/**
 * App cache
 */
let appCache: WooCommerceRestApi | undefined = undefined;

/**
 * Returns initialized WooCommerceRestApi object.
 * @see https://woocommerce.github.io/woocommerce-rest-api-docs/?javascript#retrieve-an-order (API docs)
 * @see https://github.com/woocommerce/woocommerce-rest-api-js-lib (package docs)
 */
export function getWCApp(): WooCommerceRestApi {
  if (appCache === undefined) {
    appCache = new WooCommerceRestApi({
      url: "https://www.amblyoplay.com",
      consumerKey: getEnv().WOOCOMMERCE_KEY,
      consumerSecret: getEnv().WOOCOMMERCE_SECRET,
      version: "wc/v3",
    });
  }
  return appCache;
}

export function getWCShipmentTrackingApp(): WooCommerceRestApi {
  return new WooCommerceRestApi({
    url: "https://www.amblyoplay.com",
    consumerKey: getEnv().WOOCOMMERCE_KEY,
    consumerSecret: getEnv().WOOCOMMERCE_SECRET,
    version: "wc-shipment-tracking/v3",
  } as any);
}
