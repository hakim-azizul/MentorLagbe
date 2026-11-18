/** ISO date string বা Date কে সুন্দর ফরম্যাটে দেখায় */
export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** ৳ সহ অঙ্কের ফরম্যাট */
export function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US")}`;
}
