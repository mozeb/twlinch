/**
 * Data model. Shipping tracking in WC Order.
 * Used when meta data key is "_wc_shipment_tracking_items".
 */
export interface WCMetaShippingTracking {
  date_shipped: number;
  tracking_id: string;
  tracking_number: string;
  tracking_provider: string;
}
