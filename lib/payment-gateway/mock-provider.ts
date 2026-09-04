import type { DebitOrderMandateInput, PaymentGatewayProvider, PaymentGatewayResult } from "./provider";

/**
 * MockPaymentGatewayProvider simulates a real debit-order gateway for development
 * and demos. It does NOT move real money. It always succeeds -- swap this out for
 * a real provider in lib/payment-gateway/service.ts when integrating a live gateway,
 * without touching any of the calling business logic.
 */
export class MockPaymentGatewayProvider implements PaymentGatewayProvider {
  readonly name = "mock";

  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  private reference() {
    return `mock_${Math.random().toString(36).slice(2, 10)}`;
  }

  async chargeInitialDebit(_mandate: DebitOrderMandateInput, amount: number): Promise<PaymentGatewayResult> {
    await this.simulateLatency();
    return { ok: true, reference: this.reference(), message: `Initial debit of R${amount} authorized (simulation only).` };
  }

  async chargeRecurringDebit(_mandateId: string, amount: number): Promise<PaymentGatewayResult> {
    await this.simulateLatency();
    return { ok: true, reference: this.reference(), message: `Recurring debit of R${amount} collected (simulation only).` };
  }

  async chargeBuyout(_mandateId: string, amount: number): Promise<PaymentGatewayResult> {
    await this.simulateLatency();
    return { ok: true, reference: this.reference(), message: `Buyout of R${amount} collected (simulation only).` };
  }
}
