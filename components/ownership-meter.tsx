import { formatCurrency, ownershipProgress } from "@/lib/pricing";

export function OwnershipMeter({
  paymentsCompleted,
  paymentsRequired,
  amountRemaining,
}: {
  paymentsCompleted: number;
  paymentsRequired: number;
  amountRemaining: number;
}) {
  const { percent, remainingPayments } = ownershipProgress(paymentsCompleted, paymentsRequired);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-slate-600">
          {paymentsCompleted} / {paymentsRequired} payments completed
        </p>
        <p className="text-sm font-medium text-signal">{percent}%</p>
      </div>
      <div className="meter-track mt-2">
        <div className="meter-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {remainingPayments} payment{remainingPayments === 1 ? "" : "s"} remaining · {formatCurrency(amountRemaining)} left to own
      </p>
    </div>
  );
}
