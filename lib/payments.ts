import "server-only";
import { randomToken } from "./crypto";

/**
 * The seam between Airdvance and a real payments partner (DebiCheck mandates,
 * payouts and collections — e.g. via a BankservAfrica-connected PSP). Nothing
 * else in the app talks to a payments vendor directly.
 *
 * The mock provider moves no money. A live provider must be implemented and
 * selected with PAYMENTS_PROVIDER before launch.
 */
export interface PaymentResult {
  ok: boolean;
  reference?: string;
  message?: string;
}

export interface MandateRequest {
  loanReference: string;
  accountHolder: string;
  bankName: string;
  branchCode: string;
  accountNumber: string;
  accountType: string;
  amount: number;
  collectionDate: string;
  mobile: string;
}

export interface PaymentsProvider {
  readonly name: string;
  /** Registers a DebiCheck mandate; the customer authenticates it with their bank. */
  createMandate(req: MandateRequest): Promise<PaymentResult>;
  payout(req: { loanReference: string; accountHolder: string; bankName: string; branchCode: string; accountNumber: string; amount: number }): Promise<PaymentResult>;
  collect(req: { loanReference: string; mandateReference: string; amount: number }): Promise<PaymentResult>;
}

class MockPayments implements PaymentsProvider {
  readonly name = "mock";
  private ref(prefix: string) {
    return `${prefix}-MOCK-${randomToken(6).toUpperCase()}`;
  }
  async createMandate() {
    return { ok: true, reference: this.ref("DC"), message: "Simulated DebiCheck mandate (no bank contacted)." };
  }
  async payout(req: { amount: number }) {
    return { ok: true, reference: this.ref("PO"), message: `Simulated payout of R${req.amount} (no money moved).` };
  }
  async collect(req: { amount: number }) {
    return { ok: true, reference: this.ref("CO"), message: `Simulated collection of R${req.amount} (no money moved).` };
  }
}

export function payments(): PaymentsProvider {
  // Add real providers here, e.g. `if (process.env.PAYMENTS_PROVIDER === "acme") return new AcmePayments(...)`.
  return new MockPayments();
}

export function isDemoPayments() {
  return payments().name === "mock";
}
