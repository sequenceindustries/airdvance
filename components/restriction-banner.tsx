export function RestrictionBanner() {
  return (
    <div className="rounded-md border border-alert/30 bg-alert-light px-4 py-3 text-sm text-alert-dark">
      <p className="font-medium text-alert">Your device has been locked</p>
      <p className="mt-1 text-slate-200">
        Your debit order failed and hasn't been resolved. Debit orders are not automatically
        retried — make a manual payment to unlock your device.
      </p>
    </div>
  );
}
