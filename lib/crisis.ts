


const CRISIS_PATTERNS = [
  "самоубис",
  "сакам да умрам",
  "сакам да исчезнам",
  "да исчезнам засекогаш",
  "не сакам да живеам",
  "не сакам да постојам",
  "да си го одземам животот",
  "ќе се убијам",
  "да се убијам",
  "да се самоповред",
  "да се повредам себе",
  "се сечам",
  "нема смисла да живеам",
  "подобро да ме нема",
  "светот без мене",
];

export function detectCrisis(text: string): boolean {
  const t = ` ${text.toLowerCase()} `;
  return CRISIS_PATTERNS.some((p) => t.includes(p));
}

export interface Helpline {
  name: string;
  detail: string;
  phone?: string;
}

export const HELPLINES: Helpline[] = [
  {
    name: "СОС телефон за деца и млади (Меѓаши)",
    detail: "Бесплатно и доверливо, секој ден.",
    phone: "0800 1 2222",
  },
  {
    name: "Единствен број за итни случаи",
    detail: "Ако си во непосредна опасност, јави се веднаш.",
    phone: "112",
  },
];
