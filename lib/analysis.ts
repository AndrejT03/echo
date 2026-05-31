


export type ThemeKey =
  | "school"
  | "sleep"
  | "loneliness"
  | "body"
  | "anxiety"
  | "sadness"
  | "anger"
  | "relationships"
  | "joy"
  | "calm"
  | "pride"
  | "shame"
  | "overwhelmed"
  | "excitement"
  | "disappointment"
  | "gratitude"
  | "jealousy";

export type Energy = "low" | "medium" | "high";

export interface Analysis {
  sentiment: number;
  intensity: number;
  energy: Energy;
  temperature: number;
  themes: ThemeKey[];
  source: "gemini" | "local";
}

interface ThemeInfo {
  label: string;
  form: number;
  valence: number;
  keywords: string[];
}


export const THEME_META: Record<ThemeKey, ThemeInfo> = {
  school: {
    label: "училиштен стрес",
    form: 0,
    valence: -0.4,
    keywords: [
      "училиш", "школо", "тест", "испит", "оценк", "настав", "домашн",
      "задач", "час по", "професор", "предмет", "матур", "контролн", "одговар",
    ],
  },
  anxiety: {
    label: "анксиозност",
    form: 0,
    valence: -0.6,
    keywords: [
      "анксиоз", "страв", "паник", "нервоз", "грижа", "загрижен", "трем",
      "тресам", "стрес", "притисок", "напнат", "не можам да дишам", "вознемир",
    ],
  },
  anger: {
    label: "лутина",
    form: 0,
    valence: -0.5,
    keywords: [
      "лут", "лутина", "бес", "нервира", "иритир", "омраза", "гнев",
      "кавга", "раскарав", "свад", "несакам", "не поднесувам",
    ],
  },
  sleep: {
    label: "умор и спиење",
    form: 1,
    valence: -0.3,
    keywords: [
      "спиев", "спијам", "спиење", "сон", "умор", "заморе", "недоспан",
      "будна", "будев", "не спиев", "исцрп", "поспан", "изнемоштен",
    ],
  },
  sadness: {
    label: "тага",
    form: 1,
    valence: -0.7,
    keywords: [
      "тажен", "тажна", "тага", "плач", "солз", "депрес", "празнин",
      "безнадеж", "очај", "несреќ", "лошо ми", "не ми се живее", "потиштен",
    ],
  },
  calm: {
    label: "спокој",
    form: 1,
    valence: 0.5,
    keywords: [
      "смирен", "спокој", "мир", "релакс", "опуштен", "добро ми", "в ред",
      "полека", "тивко", "балансиран", "благодар",
    ],
  },
  loneliness: {
    label: "осаменост",
    form: 2,
    valence: -0.6,
    keywords: [
      "осам", "сам ", "сама", "немам никого", "никој", "изолир", "отфрл",
      "напуштен", "никому", "сам сум", "сама сум",
    ],
  },
  joy: {
    label: "радост",
    form: 3,
    valence: 0.8,
    keywords: [
      "среќен", "среќна", "радост", "возбуд", "супер", "одличн", "убав ден",
      "насмеан", "смеа", "весел", "задоволн", "успе", "добив", "фантастичн",
    ],
  },
  relationships: {
    label: "врски и блискост",
    form: 3,
    valence: 0.2,
    keywords: [
      "пријател", "другар", "друшт", "врска", "момче", "девојк", "сакам",
      "љубов", "семејств", "родител", "мајка", "татко", "брат", "сестра", "раскин",
    ],
  },
  body: {
    label: "физички симптоми",
    form: 4,
    valence: -0.4,
    keywords: [
      "боли", "болка", "стомак", "глав", "главобол", "мачнин", "гадење",
      "напнатост во", "телото", "симптом", "температур", "грозниц", "вртоглав",
    ],
  },
  pride: {
    label: "гордост",
    form: 5,
    valence: 0.7,
    keywords: [
      "горд", "горда", "успеав", "постигнав", "освоив", "победив", "понос",
      "поносен", "поносна", "награда", "прво место", "најдобар", "најдобра",
      "признание", "пофалба", "ме фалеа", "постигнување", "дипломир",
      "proud", "achievement", "accomplished",
    ],
  },
  shame: {
    label: "срам",
    form: 6,
    valence: -0.6,
    keywords: [
      "срам", "срамота", "срамежлив", "засрамен", "засрамена", "се срамам",
      "ме е срам", "непријатно ми", "неудобно ми", "се изложив", "ме исмеаа",
      "ме критикуваа", "погрешив пред", "направив глупост", "ме навредиле",
      "embarrass", "ashamed",
    ],
  },
  overwhelmed: {
    label: "преоптовареност",
    form: 7,
    valence: -0.5,
    keywords: [
      "преоптоварен", "преоптоварена", "не можам да се снајдам", "не знам одкаде",
      "не стигнувам", "хаос", "се губам", "изгубен сум", "изгубена сум",
      "не знам што да правам", "сè одеднаш", "превртено", "не знам ни самиот",
      "не знам ни сама", "се давам", "премногу обврски", "сè ми паѓа",
      "overwhelmed", "too much",
    ],
  },
  excitement: {
    label: "возбуда",
    form: 8,
    valence: 0.6,
    keywords: [
      "возбуден", "возбудена", "ентузијазам", "не можам да чекам", "едвај чекам",
      "се радувам на", "нетрпелив", "нетрпелива", "адреналин", "трепетам",
      "одушевен", "одушевена", "одушевување", "фантастично ми е", "предвкусувам",
      "excited", "thrilled", "can't wait",
    ],
  },
  disappointment: {
    label: "разочарување",
    form: 9,
    valence: -0.4,
    keywords: [
      "разочаран", "разочарана", "разочарување", "очекував повеќе", "не испадна",
      "не успеав", "промашив", "не исполни", "залудно", "напразно",
      "не ги исполни очекувањата", "излажан", "излажана", "не е тоа", "погрешна одлука",
      "disappointed", "let down",
    ],
  },
  gratitude: {
    label: "благодарност",
    form: 10,
    valence: 0.6,
    keywords: [
      "благодарен", "благодарна", "благодарам", "фала", "благодарност",
      "ценам", "среќен сум дека", "среќна сум дека", "ми помогна", "ги ценам",
      "среќник сум", "среќница сум", "колку убаво", "колку сум благодарен",
      "grateful", "thankful", "appreciate",
    ],
  },
  jealousy: {
    label: "завист",
    form: 11,
    valence: -0.3,
    keywords: [
      "завидувам", "завист", "ревност", "љубоморен", "љубоморна",
      "зошто не јас", "зошто тој", "зошто таа", "нечесно", "тој има а јас немам",
      "таа има а јас немам", "им завидувам", "ревнувам", "ревнива", "ревнив",
      "jealous", "envy", "envious",
    ],
  },
};

export const THEME_KEYS = Object.keys(THEME_META) as ThemeKey[];


export const SYSTEM_INSTRUCTION = `Ти си тивок емоционален аналитичар за тинејџери во Македонија.
Корисникот пишува неколку реченици на македонски за тоа како се чувствува денес.
Твоја задача е САМО да го анализираш чувството и да вратиш СТРОГО валиден JSON објект.
Не давај совети, не водиш разговор, не дијагностицираш, не пишуваш ништо надвор од JSON.

Врати точно вакви полиња:
{
  "sentiment": број од -1 до 1 (негативно→позитивно),
  "intensity": цел број 0 до 100 (колку силно е чувството),
  "energy": "low" | "medium" | "high" (енергетско ниво),
  "temperature": цел број 0 до 100 (емоционална „температура“: студено/потиштено = ниско, топло/возбудено = високо),
  "themes": низа од 1 до 3 теми подредени по доминантност, само од: ${THEME_KEYS.join(", ")}
}

Бирај теми што најдобро одговараат на текстот. Врати само JSON, ништо друго.`;

export function buildPrompt(text: string): string {
  return `Текст од тинејџерот:\n"""${text.slice(0, 1200)}"""\n\nВрати го JSON објектот.`;
}


const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export function sanitizeAnalysis(
  raw: unknown,
  source: Analysis["source"],
): Analysis {
  const o = (raw ?? {}) as Record<string, unknown>;

  let themes: ThemeKey[] = Array.isArray(o.themes)
    ? (o.themes.filter((t): t is ThemeKey =>
        THEME_KEYS.includes(t as ThemeKey),
      ))
    : [];
  themes = [...new Set(themes)].slice(0, 3);
  if (themes.length === 0) themes = ["calm"];

  const sentiment = clamp(Number(o.sentiment) || 0, -1, 1);
  const intensity = Math.round(clamp(Number(o.intensity) || 0, 0, 100));

  let energy: Energy = "medium";
  if (o.energy === "low" || o.energy === "high" || o.energy === "medium") {
    energy = o.energy;
  }

  let temperature = Number(o.temperature);
  if (!Number.isFinite(temperature)) {
    const e = energy === "low" ? 0.2 : energy === "high" ? 0.9 : 0.55;
    temperature = ((sentiment + 1) / 2) * 55 + e * 45;
  }
  temperature = Math.round(clamp(temperature, 0, 100));

  return { sentiment, intensity, energy, temperature, themes, source };
}


const POSITIVE = [
  "добро", "убав", "среќ", "супер", "одличн", "радост", "успе", "сакам",
  "благодар", "насмеа", "смеа", "весел", "опуштен", "спокој", "фал", "леснотија",
];
const NEGATIVE = [
  "лошо", "тешко", "тага", "тажен", "тажна", "страв", "боли", "умор",
  "осам", "стрес", "плач", "лут", "очај", "не можам", "грижа", "празнин",
];
const AMPLIFIERS = [
  "многу", "премногу", "ужасно", "страшно", "екстремно", "толку",
  "целосно", "апсолутно", "никогаш", "секогаш",
];

export function localAnalyze(text: string): Analysis {
  const t = ` ${text.toLowerCase()} `;


  const scored = THEME_KEYS.map((key) => {
    const info = THEME_META[key];
    let score = 0;
    for (const kw of info.keywords) if (t.includes(kw)) score += 1;
    return { key, score, valence: info.valence };
  }).filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  let themes = scored.slice(0, 3).map((s) => s.key);


  let pos = 0;
  let neg = 0;
  for (const w of POSITIVE) if (t.includes(w)) pos += 1;
  for (const w of NEGATIVE) if (t.includes(w)) neg += 1;
  const themeValence = scored
    .slice(0, 3)
    .reduce((acc, s) => acc + s.valence * s.score, 0);

  let sentiment = clamp((pos - neg) * 0.22 + themeValence * 0.18, -1, 1);
  if (scored.length === 0 && pos === 0 && neg === 0) sentiment = 0.05;


  let amp = 0;
  for (const w of AMPLIFIERS) if (t.includes(w)) amp += 1;
  const exclam = (text.match(/!/g) || []).length;
  const matchTotal = scored.reduce((a, s) => a + s.score, 0);
  const intensity = Math.round(
    clamp(28 + matchTotal * 9 + amp * 10 + exclam * 6 + Math.abs(sentiment) * 24, 0, 100),
  );


  const highThemes = themes.filter((k) =>
    ["anxiety", "anger", "joy", "excitement", "overwhelmed"].includes(k),
  ).length;
  const lowThemes = themes.filter((k) =>
    ["sleep", "sadness", "calm", "disappointment", "shame"].includes(k),
  ).length;
  let energy: Energy = "medium";
  if (highThemes > lowThemes && intensity > 45) energy = "high";
  else if (lowThemes > highThemes || intensity < 35) energy = "low";

  if (themes.length === 0) themes = sentiment >= 0.1 ? ["calm"] : ["sadness"];

  return sanitizeAnalysis(
    { sentiment, intensity, energy, themes },
    "local",
  );
}

export function dominantTheme(a: Analysis): ThemeKey {
  return a.themes[0] ?? "calm";
}

export function themeLabels(a: Analysis): string[] {
  return a.themes.map((k) => THEME_META[k].label);
}


export interface AnalysisInsight {
  summary: string;
  note: string;
}

export function energyLabelMK(e: Energy): string {
  return e === "low" ? "ниска" : e === "high" ? "висока" : "средна";
}


export interface Metric {
  label: string;
  value: string;
  hint: string;
  pct: number;
}

export function metricsFor(a: Analysis): Metric[] {
  const tone =
    a.sentiment > 0.45
      ? "Ведар"
      : a.sentiment > 0.12
        ? "Светол"
        : a.sentiment < -0.45
          ? "Тежок"
          : a.sentiment < -0.12
            ? "Мрачен"
            : "Мешан";
  const inten =
    a.intensity >= 75
      ? "Многу силен"
      : a.intensity >= 50
        ? "Силен"
        : a.intensity >= 28
          ? "Умерен"
          : "Тивок";
  const energy =
    a.energy === "high" ? "Висока" : a.energy === "low" ? "Ниска" : "Средна";
  const energyPct = a.energy === "high" ? 88 : a.energy === "low" ? 26 : 57;
  const temp =
    a.temperature >= 66 ? "Топло" : a.temperature <= 33 ? "Студено" : "Млако";

  return [
    {
      label: "Тон",
      value: tone,
      hint: "колку денот е тежок или ведар",
      pct: Math.round(((a.sentiment + 1) / 2) * 100),
    },
    {
      label: "Интензитет",
      value: inten,
      hint: "колку силно се чувствува",
      pct: a.intensity,
    },
    {
      label: "Енергија",
      value: energy,
      hint: "немирна или смирена",
      pct: energyPct,
    },
    {
      label: "Топлина",
      value: temp,
      hint: "емотивно студено или топло",
      pct: a.temperature,
    },
  ];
}

export function describeAnalysis(a: Analysis): AnalysisInsight {
  const tone =
    a.sentiment > 0.35
      ? "ведар, позитивен тон"
      : a.sentiment < -0.35
        ? "тежок, нагласен тон"
        : "мешан тон со повеќе нијанси";
  const inten =
    a.intensity >= 66
      ? "силен интензитет"
      : a.intensity <= 33
        ? "благ интензитет"
        : "среден интензитет";
  const en =
    a.energy === "high"
      ? "висока енергија"
      : a.energy === "low"
        ? "ниска, смирена енергија"
        : "избалансирана енергија";
  const temp =
    a.temperature >= 66
      ? "топло"
      : a.temperature <= 33
        ? "студено"
        : "млако";
  const labels = a.themes.map((k) => THEME_META[k].label);
  const themesPart =
    labels.length > 1
      ? `Се испреплетуваат „${labels[0]}“ и „${labels[1]}“.`
      : `Најмногу се провлекува „${labels[0] ?? "спокој"}“.`;

  const summary = `Денот носи ${tone}, со ${inten} и ${en}. Емотивно се чувствува ${temp}. ${themesPart}`;

  const note =
    a.sentiment < -0.2
      ? "Тоа што го носиш е реално — и не мора да го носиш сам."
      : a.sentiment > 0.3
        ? "Убав миг — вреди да се запамети и да се задржи."
        : "Секој ден има своја боја; и оваа е само твоја.";

  return { summary, note };
}
