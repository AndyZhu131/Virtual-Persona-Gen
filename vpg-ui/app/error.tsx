"use client";
export default function Error({ error }: { error: Error }) {
  return (
    <div className="p-6 text-red-600">
      Something went wrong: <span className="font-mono">{error.message}</span>
    </div>
  );
}
