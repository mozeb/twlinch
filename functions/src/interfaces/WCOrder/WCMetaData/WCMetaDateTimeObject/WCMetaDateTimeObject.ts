/**
 * Date representation that is visible in some WC responses
 */
export interface WCMetaDateTimeObject {
  /**
   * Date in format: "2019-03-07 13:06:23.000000"
   */
  date: string;

  /**
   * Timezone in format: "+00:00"
   */
  timezone: string;

  /**
   * ?
   */
  timezone_type: number;
}
