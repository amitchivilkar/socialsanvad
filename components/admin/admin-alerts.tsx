export function AdminError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {message}
    </div>
  );
}

export function AdminSuccess({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      role="status"
    >
      {message}
    </div>
  );
}
