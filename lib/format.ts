
const MK_MONTHS = [
  "јануари", "февруари", "март", "април", "мај", "јуни",
  "јули", "август", "септември", "октомври", "ноември", "декември",
];
const MK_MONTHS_GEN = [
  "јануари", "февруари", "март", "април", "мај", "јуни",
  "јули", "август", "септември", "октомври", "ноември", "декември",
];

export function formatDateMK(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthMK(monthIndex: number): string {
  return MK_MONTHS_GEN[monthIndex] ?? "";
}

export function shortDateMK(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}.${d.getMonth() + 1}`;
}
