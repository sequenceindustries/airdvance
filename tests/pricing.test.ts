import { test } from "node:test";
import assert from "node:assert/strict";
import { balanceOn, calculateQuote, initiationFee, interestFor, isQuoteError, serviceFeeFor, type Quote } from "../lib/pricing";
import { parseSaId, normaliseMobile } from "../lib/sa";
import { daysBetween, defaultPayday } from "../lib/dates";

test("initiation fee follows Reg. 42", () => {
  assert.equal(initiationFee(300), 165);
  assert.equal(initiationFee(1000), 165);
  assert.equal(initiationFee(2000), 265);
  assert.equal(initiationFee(20000), 1050);
});

test("interest and service fee never exceed monthly caps", () => {
  for (let d = 1; d <= 31; d++) {
    assert.ok(interestFor(1000, 0.05, d) <= 50, `interest day ${d}`);
    assert.ok(serviceFeeFor(d) <= 60, `fee day ${d}`);
  }
  assert.equal(interestFor(1000, 0.05, 30), 49.32);
  assert.equal(serviceFeeFor(30), 60);
  assert.equal(serviceFeeFor(15), 30);
});

test("quote for R1,000 over 30 days", () => {
  const q = calculateQuote({ principal: 1000, startDate: "2026-10-07", dueDate: "2026-11-06" }) as Quote;
  assert.equal(q.days, 30);
  assert.equal(q.initiationFee, 165);
  assert.equal(q.serviceFee, 60);
  assert.equal(q.interest, 49.32);
  assert.equal(q.totalRepayable, 1274.32);
});

test("repeat loans in the same year use 3% per month", () => {
  const q = calculateQuote({ principal: 1000, startDate: "2026-10-07", dueDate: "2026-11-06", isRepeatThisYear: true }) as Quote;
  assert.equal(q.monthlyRate, 0.03);
  assert.equal(q.interest, 29.59);
});

test("rejects out-of-range terms", () => {
  assert.ok(isQuoteError(calculateQuote({ principal: 250, startDate: "2026-10-07", dueDate: "2026-11-06" })));
  assert.ok(isQuoteError(calculateQuote({ principal: 1050, startDate: "2026-10-07", dueDate: "2026-11-06" })));
  assert.ok(isQuoteError(calculateQuote({ principal: 325, startDate: "2026-10-07", dueDate: "2026-11-06" })));
  assert.ok(isQuoteError(calculateQuote({ principal: 500, startDate: "2026-10-07", dueDate: "2026-10-10" })));
  assert.ok(isQuoteError(calculateQuote({ principal: 500, startDate: "2026-10-07", dueDate: "2026-11-10" })));
});

test("early settlement charges only days used", () => {
  const b = balanceOn({ principal: 1000, initiationFee: 165, monthlyRate: 0.05, disbursedOn: "2026-10-07", dueDate: "2026-11-06", paid: 0, asOf: "2026-10-17" });
  assert.equal(b.daysElapsed, 10);
  assert.equal(b.serviceFee, 20);
  assert.equal(b.interest, 16.44);
  assert.equal(b.outstanding, 1201.44);
});

test("late interest respects in duplum", () => {
  const b = balanceOn({ principal: 1000, initiationFee: 165, monthlyRate: 0.05, disbursedOn: "2026-01-01", dueDate: "2026-01-31", paid: 1200, asOf: "2027-06-01" });
  // balance at default was 74.32 → late interest can't exceed that
  assert.equal(b.lateInterest, 74.32);
  assert.equal(b.outstanding, 148.64);
});

test("SA ID validation", () => {
  const ok = parseSaId("8001015009087", new Date("2026-10-07"));
  assert.equal(ok.valid, true);
  assert.equal(ok.dateOfBirth, "1980-01-01");
  assert.equal(ok.age, 46);
  assert.equal(parseSaId("8001015009088").valid, false);
  assert.equal(parseSaId("123").valid, false);
});

test("mobile normalisation", () => {
  assert.equal(normaliseMobile("082 123 4567"), "+27821234567");
  assert.equal(normaliseMobile("+27 72 123 4567"), "+27721234567");
  assert.equal(normaliseMobile("0123456789"), null);
});

test("default payday lands within term limits", () => {
  for (const t of ["2026-10-07", "2026-10-21", "2026-12-28", "2026-02-24"]) {
    const d = daysBetween(t, defaultPayday(t, 5, 31));
    assert.ok(d >= 5 && d <= 31, `${t} -> ${d}`);
  }
});

import { assessAffordability, minimumExpenseNorm } from "../lib/affordability";

test("minimum expense norms (Reg. 23A)", () => {
  assert.equal(minimumExpenseNorm(500), 500);
  assert.equal(minimumExpenseNorm(6250), 1267.88);
  assert.equal(minimumExpenseNorm(15000), 1955.38);
  assert.equal(minimumExpenseNorm(60000), 5580.38);
});

test("affordability uses the higher of declared expenses and norm", () => {
  const a = assessAffordability(
    { grossIncome: 15000, netIncome: 12500, housing: 0, food: 500, transport: 300, utilities: 0, education: 0, otherExpenses: 0, debtRepayments: 2000 },
    1274.32,
  );
  assert.equal(a.livingUsed, 1955.38);
  assert.equal(a.disposable, 8544.62);
  assert.equal(a.passes, true);
  const b = assessAffordability(
    { grossIncome: 6000, netIncome: 5200, housing: 2500, food: 1500, transport: 800, utilities: 300, education: 0, otherExpenses: 0, debtRepayments: 0 },
    715.79,
  );
  assert.equal(b.passes, false);
});
