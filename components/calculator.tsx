"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRODUCT } from "@/lib/config";
import { addDays, formatDate, isWeekend } from "@/lib/dates";
import { calculateQuote, formatRand, isQuoteError } from "@/lib/pricing";

const CHIPS = [300, 500, 750, 1000];

export function Calculator({
  today,
  defaultDue,
  compact = false,
}: {
  today: string;
  defaultDue: string;
  compact?: boolean;
}) {
  const [amount, setAmount] = useState(500);
  const [due, setDue] = useState(defaultDue);
  const minDue = addDays(today, PRODUCT.minDays);
  const maxDue = addDays(today, PRODUCT.maxDays);

  const quote = useMemo(() => calculateQuote({ principal: amount, startDate: today, dueDate: due }), [amount, today, due]);
  const fill = ((amount - PRODUCT.minAmount) / (PRODUCT.maxAmount - PRODUCT.minAmount)) * 100;

  return (
    <div className="glass relative overflow-hidden p-5 sm:p-7">
      <div className="relative">
        <div className="flex items-baseline justify-between">
          <label htmlFor="calc-amount" className="text-sm font-medium text-ink-muted">
            I'd like to borrow
          </label>
          <span className="font-display text-4xl font-semibold tabular-nums sm:text-5xl" aria-live="polite">
            {formatRand(amount, { cents: false })}
          </span>
        </div>
        <input
          id="calc-amount"
          type="range"
          className="range mt-5"
          min={PRODUCT.minAmount}
          max={PRODUCT.maxAmount}
          step={PRODUCT.step}
          value={amount}
          style={{ ["--fill" as any]: `${fill}%` }}
          onChange={(e) => setAmount(Number(e.target.value))}
          aria-valuetext={formatRand(amount, { cents: false })}
        />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAmount(c)}
              className={`rounded-full border px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                amount === c ? "border-ember bg-ember/15 text-ink" : "border-ink/10 text-ink-muted hover:border-ink/25"
              }`}
            >
              {formatRand(c, { cents: false })}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label htmlFor="calc-due" className="label">
            Repay on my next payday
          </label>
          <input
            id="calc-due"
            type="date"
            className="input"
            min={minDue}
            max={maxDue}
            value={due}
            onChange={(e) => e.target.value && setDue(e.target.value)}
          />
          <span className="hint">
            {isWeekend(due)
              ? "That's a weekend — debit orders run on business days, so choose the day your salary actually lands."
              : `Between ${PRODUCT.minDays} and ${PRODUCT.maxDays} days from today.`}
          </span>
        </div>

        {isQuoteError(quote) ? (
          <p className="mt-6 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-300">{quote.error}</p>
        ) : (
          <>
            <dl className={`mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-sm ${compact ? "" : ""}`}>
              <Row label="Paid into your account" value={formatRand(quote.principal)} />
              <Row label="Initiation fee (once-off)" value={formatRand(quote.initiationFee)} />
              <Row label={`Service fee (${quote.days} days)`} value={formatRand(quote.serviceFee)} />
              <Row label={`Interest (${(quote.monthlyRate * 100).toFixed(0)}% per month, ${quote.days} days)`} value={formatRand(quote.interest)} />
            </dl>
            <div className="mt-4 flex items-end justify-between rounded-2xl border border-ember/30 bg-ember/[0.08] px-4 py-3.5">
              <div>
                <p className="text-xs font-medium text-ink-muted">Total to repay on {formatDate(quote.dueDate, { year: false })}</p>
                <p className="mt-0.5 text-xs text-ink-faint">Cost of credit {formatRand(quote.costOfCredit)}</p>
              </div>
              <p className="font-display text-2xl font-semibold tabular-nums">{formatRand(quote.totalRepayable)}</p>
            </div>
            <Link
              href={`/apply?amount=${quote.principal}&due=${quote.dueDate}`}
              className="btn-primary mt-5 w-full py-3.5 text-base"
            >
              Apply for {formatRand(quote.principal, { cents: false })}
            </Link>
            <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
              Quote for a first loan this year. Your final cost is confirmed in your pre-agreement statement before you
              sign. Approval depends on an affordability assessment and isn't guaranteed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}
