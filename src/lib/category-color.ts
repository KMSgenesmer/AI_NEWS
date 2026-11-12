// Tailwind는 동적 클래스명을 감지하지 못하므로 전체 클래스 문자열을 그대로 둔다. (ui.md §2)
const COLORS = {
  rose: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  sky: {
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  teal: {
    dot: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  indigo: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  violet: {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  emerald: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  slate: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
  },
} as const;

const BY_NAME: Record<string, keyof typeof COLORS> = {
  정치: "rose",
  경제: "amber",
  사회: "sky",
  국제: "teal",
  "IT/과학": "indigo",
  문화: "violet",
  스포츠: "emerald",
  미분류: "slate",
};

const FALLBACK: (keyof typeof COLORS)[] = [
  "rose",
  "amber",
  "sky",
  "teal",
  "indigo",
  "violet",
  "emerald",
];

export type ColorKey = keyof typeof COLORS;
export const COLOR_KEYS = Object.keys(COLORS) as (keyof typeof COLORS)[];
// 사용자가 고를 수 있는 색 ("미분류" 전용인 slate 제외)
export const SELECTABLE_COLOR_KEYS = COLOR_KEYS.filter((k) => k !== "slate");

export function isColorKey(value: unknown): value is keyof typeof COLORS {
  return typeof value === "string" && value in COLORS;
}

export function getColorByKey(key: keyof typeof COLORS) {
  return COLORS[key];
}

// DB에 저장된 색(color)이 있으면 그것을 쓰고, 없으면 기본 카테고리는 고정 색,
// 그 밖의 카테고리는 이름 해시로 색을 배정한다.
export function getCategoryColor(name: string, color?: string | null) {
  if (isColorKey(color)) return COLORS[color];
  const known = BY_NAME[name];
  if (known) return COLORS[known];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[FALLBACK[hash % FALLBACK.length]];
}
