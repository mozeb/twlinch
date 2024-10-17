export interface GiftCode {
  user_id: string;
  date_created: string;
  date_used: string;
  product: string;
  code_id: string;
  wc_order_id: string;
  purchaser_email: string;
  redeemer_email: string;
  is_used: boolean;
  voucherPDFLink: string;
}

export interface GiftVoucher {
  product: string;
  code_id: string;
  _pdfplum_config: {
    outputFileName: string;
    templatePath: string;
  };
}
