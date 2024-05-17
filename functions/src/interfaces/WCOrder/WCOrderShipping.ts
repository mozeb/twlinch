/**
 * Woocommerce Order Shipping Properties.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-shipping-properties
 */
export interface WCOrderShipping {
  /**
   * Address line 1.
   */
  address_1: string;

  /**
   * Address line 2.
   */
  address_2: string;

  /**
   * City name.
   */
  city: string;

  /**
   * Company name.
   */
  company: string;

  /**
   * Country code in ISO 3166-1 alpha-2 format.
   */
  country: string;

  /**
   * First name.
   */
  first_name: string;

  /**
   * Last name.
   */
  last_name: string;

  /**
   * Postal code.
   */
  postcode: string;

  /**
   * ISO code or name of the state, province or district.
   */
  state: string;
}
