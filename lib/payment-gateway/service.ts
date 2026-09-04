import type { DebitOrderMandateInput, PaymentGatewayProvider } from "./provider";
import { MockPaymentGatewayProvider } from "./mock-provider";

/**
 * PaymentGatewayService is what the rest of the application calls.
 * To go live with a real debit-order/payment gateway: implement PaymentGatewayProvider
 * in a new file and change resolveProvider() below. No other code needs to change.
 */
function resolveProvider(): PaymentGatewayProvider {
  return new MockPaymentGatewayProvider();
}

export const PaymentGatewayService = {
  chargeInitialDebit(mandate: DebitOrderMandateInput, amount: number) {
    return resolveProvider().chargeInitialDebit(mandate, amount);
  },
  chargeRecurringDebit(mandateId: string, amount: number) {
    return resolveProvider().chargeRecurringDebit(mandateId, amount);
  },
  chargeBuyout(mandateId: string, amount: number) {
    return resolveProvider().chargeBuyout(mandateId, amount);
  },
};
