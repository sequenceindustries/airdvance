export function RestrictionBanner() {
  return (
    <div className="rounded-md border border-alert/30 bg-alert-light px-4 py-3 text-sm text-alert-dark">
      <p className="font-medium text-alert">Your device has been temporarily restricted</p>
      <p className="mt-1 text-slate-700">
        A payment on this agreement is overdue. Make your outstanding payment to restore access.
      </p>
    </div>
  );
}
