/**
 * PaymentGatewayProvider is the single seam between Airdvance's business logic
 * and whatever real debit-order/payment gateway eventually processes charges.
 * Nothing outside lib/payment-gateway should import a vendor SDK directly.
 */
export interface PaymentGatewayResult {
  ok: boolean;
  reference?: string;
  message?: string;
}

export interface DebitOrderMandateInput {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

export interface PaymentGatewayProvider {
  readonly name: string;

  /** Charges the first combined installment + admin fee against a freshly-authorized mandate. */
  chargeInitialDebit(mandate: DebitOrderMandateInput, amount: number): Promise<PaymentGatewayResult>;

  /** Charges a routine monthly debit order collection. */
  chargeRecurringDebit(mandateId: string, amount: number): Promise<PaymentGatewayResult>;

  /** Charges the final buyout amount to transfer ownership. */
  chargeBuyout(mandateId: string, amount: number): Promise<PaymentGatewayResult>;
}
